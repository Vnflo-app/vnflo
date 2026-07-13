import { openDB, type IDBPDatabase } from "idb";
import { supabase } from "./supabase";

export interface User {
  id: string;
  username: string;
  email: string;
  passwordHash?: string;
  salt?: string;
  avatar?: string;
  displayName?: string;
  bio?: string;
  website?: string;
  location?: string;
  createdAt: number;
  subscriptionStatus: 'active' | 'trialing' | 'canceled' | null;
  subscriptionPlan: string | null;
  subscriptionId?: string | null;
  aiCredits?: number;
}

export interface DiagramData {
  id: string;
  workspaceId: string | null;
  ownerId: string;
  name: string; // Maps to 'title' in DB
  description: string | null;
  yjsState: string | null; // base64 representation for transport
  metadata: {
    viewport: { x: number; y: number; zoom: number };
    theme?: string;
    nodeCount?: number;
  };
  thumbnailUrl: string | null;
  isPublic: boolean;
  createdAt: number;
  updatedAt: number;
  nodes?: unknown[]; // Backwards compatibility for template initialization
  edges?: unknown[]; // Backwards compatibility for template initialization
}

export interface Setting {
  key: string;
  value: unknown;
}

interface NBDB {
  settings: { key: string; value: Setting };
}

let dbInstance: IDBPDatabase<NBDB> | null = null;

export async function getDB(): Promise<IDBPDatabase<NBDB>> {
  if (dbInstance) return dbInstance;
  dbInstance = await openDB<NBDB>("Visual Node Flow-db", 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains("settings")) {
        db.createObjectStore("settings", { keyPath: "key" });
      }
    },
  });
  return dbInstance;
}

export function generateId(): string {
  return crypto.randomUUID();
}

function bytesToHex(bytes: Uint8Array): string {
  let hex = "\\x";
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, "0");
  }
  return hex;
}

// Helper to map frontend camelCase DiagramData to database snake_case fields
function toDbDiagram(d: DiagramData) {
  let yjsHex: string | null = null;
  if (d.yjsState) {
    const binStr = atob(d.yjsState);
    const bytes = new Uint8Array(binStr.length);
    for (let i = 0; i < binStr.length; i++) {
      bytes[i] = binStr.charCodeAt(i);
    }
    yjsHex = bytesToHex(bytes);
  }

  const nodeCount = d.nodes ? d.nodes.length : (d.metadata as any)?.nodeCount ?? 0;

  return {
    id: d.id,
    workspace_id: d.workspaceId || null,
    owner_id: d.ownerId,
    title: d.name || "Untitled Diagram",
    description: d.description || null,
    yjs_state: yjsHex,
    metadata: {
      ...(d.metadata || { viewport: { x: 0, y: 0, zoom: 1 } }),
      nodeCount,
    },
    thumbnail_url: d.thumbnailUrl || null,
    is_public: d.isPublic || false,
    created_at: d.createdAt ? new Date(d.createdAt).toISOString() : new Date().toISOString(),
    updated_at: new Date(d.updatedAt || Date.now()).toISOString(),
  };
}

// Helper to map database snake_case fields to frontend camelCase DiagramData
function fromDbDiagram(row: any): DiagramData {
  let yjsStateStr: string | null = null;
  if (row.yjs_state) {
    if (row.yjs_state instanceof Uint8Array) {
      yjsStateStr = btoa(String.fromCharCode(...row.yjs_state));
    } else if (typeof row.yjs_state === "string") {
      if (row.yjs_state.startsWith("\\x")) {
        const hex = row.yjs_state.slice(2);
        const bytes = new Uint8Array(hex.length / 2);
        for (let i = 0; i < bytes.length; i++) {
          bytes[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
        }
        yjsStateStr = btoa(String.fromCharCode(...bytes));
      } else {
        yjsStateStr = row.yjs_state;
      }
    } else {
      const bytes = new Uint8Array(row.yjs_state);
      yjsStateStr = btoa(String.fromCharCode(...bytes));
    }
  }

  return {
    id: row.id,
    workspaceId: row.workspace_id || null,
    ownerId: row.owner_id,
    name: row.title || "Untitled Diagram",
    description: row.description || null,
    yjsState: yjsStateStr,
    metadata: row.metadata || { viewport: { x: 0, y: 0, zoom: 1 } },
    thumbnailUrl: row.thumbnail_url || null,
    isPublic: row.is_public || false,
    createdAt: row.created_at ? Date.parse(row.created_at) : Date.now(),
    updatedAt: row.updated_at ? Date.parse(row.updated_at) : Date.now(),
    nodes: [],
    edges: [],
  };
}

// Diagrams stored in Supabase
export async function saveDiagram(diagram: DiagramData): Promise<void> {
  const dbRow = toDbDiagram(diagram);
  const { error } = await supabase.from("diagrams").upsert(dbRow);
  if (error) {
    console.error("Error saving diagram to Supabase:", error);
    throw error;
  }
}

export async function getDiagram(id: string): Promise<DiagramData | undefined> {
  const { data, error } = await supabase
    .from("diagrams")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Error getting diagram from Supabase:", error);
    return undefined;
  }
  return data ? fromDbDiagram(data) : undefined;
}

export async function getDiagramsByOwner(ownerId: string): Promise<DiagramData[]> {
  const { data, error } = await supabase
    .from("diagrams")
    .select("id, workspace_id, owner_id, title, description, metadata, thumbnail_url, is_public, created_at, updated_at")
    .eq("owner_id", ownerId)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Error getting diagrams by owner from Supabase:", error);
    return [];
  }
  return (data || []).map(fromDbDiagram);
}

export async function deleteDiagram(id: string): Promise<void> {
  const { error } = await supabase
    .from("diagrams")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting diagram from Supabase:", error);
    throw error;
  }
}

// Settings stored locally in IndexedDB
export async function getSetting<T>(key: string): Promise<T | undefined> {
  const db = await getDB();
  const s = await db.get("settings", key);
  return s?.value as T | undefined;
}

export async function setSetting(key: string, value: unknown): Promise<void> {
  const db = await getDB();
  await db.put("settings", { key, value });
}
