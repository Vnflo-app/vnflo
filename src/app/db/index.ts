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
  name: string;
  ownerId: string;
  nodes: unknown[];
  edges: unknown[];
  viewport?: { x: number; y: number; zoom: number };
  thumbnail?: string;
  createdAt: number;
  updatedAt: number;
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

// Helper to map frontend camelCase DiagramData to database snake_case fields
function toDbDiagram(d: DiagramData) {
  return {
    id: d.id,
    name: d.name,
    owner_id: d.ownerId,
    nodes: d.nodes,
    edges: d.edges,
    viewport: d.viewport || { x: 0, y: 0, zoom: 1 },
    thumbnail: d.thumbnail || null,
    created_at: d.createdAt ? new Date(d.createdAt).toISOString() : new Date().toISOString(),
    updated_at: new Date(d.updatedAt || Date.now()).toISOString(),
  };
}

// Helper to map database snake_case fields to frontend camelCase DiagramData
function fromDbDiagram(row: any): DiagramData {
  return {
    id: row.id,
    name: row.name,
    ownerId: row.owner_id,
    nodes: row.nodes || [],
    edges: row.edges || [],
    viewport: row.viewport || { x: 0, y: 0, zoom: 1 },
    thumbnail: row.thumbnail || undefined,
    createdAt: row.created_at ? Date.parse(row.created_at) : Date.now(),
    updatedAt: row.updated_at ? Date.parse(row.updated_at) : Date.now(),
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
    .select("*")
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
