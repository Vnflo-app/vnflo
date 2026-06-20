import { create } from "zustand";
import {
  type DiagramData,
  getDiagramsByOwner,
  saveDiagram,
  deleteDiagram as dbDeleteDiagram,
  getDiagram,
  generateId,
} from "../db/index";

interface DiagramState {
  diagrams: DiagramData[];
  loading: boolean;
  loadDiagrams: (ownerId: string) => Promise<void>;
  createDiagram: (name: string, ownerId: string, nodes?: unknown[], edges?: unknown[]) => Promise<DiagramData>;
  updateDiagram: (diagram: DiagramData) => Promise<void>;
  deleteDiagram: (id: string) => Promise<void>;
  getDiagram: (id: string) => Promise<DiagramData | undefined>;
}

export const useDiagramStore = create<DiagramState>((set) => ({
  diagrams: [],
  loading: false,

  loadDiagrams: async (ownerId) => {
    set({ loading: true });
    const diagrams = await getDiagramsByOwner(ownerId);
    diagrams.sort((a, b) => b.updatedAt - a.updatedAt);
    set({ diagrams, loading: false });
  },

  createDiagram: async (name, ownerId, nodes = [], edges = []) => {
    const diagram: DiagramData = {
      id: generateId(),
      name,
      ownerId,
      nodes,
      edges,
      viewport: { x: 0, y: 0, zoom: 1 },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await saveDiagram(diagram);
    set((s) => ({ diagrams: [diagram, ...s.diagrams] }));
    return diagram;
  },

  updateDiagram: async (diagram) => {
    const updated = { ...diagram, updatedAt: Date.now() };
    await saveDiagram(updated);
    set((s) => ({
      diagrams: s.diagrams.map((d) => (d.id === updated.id ? updated : d)),
    }));
  },

  deleteDiagram: async (id) => {
    await dbDeleteDiagram(id);
    set((s) => ({ diagrams: s.diagrams.filter((d) => d.id !== id) }));
  },

  getDiagram: async (id) => getDiagram(id),
}));
