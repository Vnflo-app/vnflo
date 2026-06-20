import { create } from "zustand";

export type ActiveTool = "select" | "hand" | "add-node";
export type ActivePanel = "shapes" | "framer" | "colors" | "icons" | "image" | "templates" | "ai" | "er" | "dsl" | null;
export type PlaybackMode = "sequential" | "parallel" | "highlight";
export type FrameMode = "diagram" | "ai" | "dsl";

interface EditorState {
  activeTool: ActiveTool;
  activePanel: ActivePanel;
  selectedNodeIds: string[];
  diagramName: string;
  isSaving: boolean;
  isDirty: boolean;
  webrtcConnected: boolean;
  webrtcPeerId: string | null;
  autoLayoutEnabled: boolean;
  rootNodeId: string | null;
  playbackMode: PlaybackMode;
  playbackSpeed: number;
  activeFrameId: string | null;
  activeFrameMode: FrameMode;

  setActiveTool: (tool: ActiveTool) => void;
  setActivePanel: (panel: ActivePanel) => void;
  setSelectedNodeIds: (ids: string[]) => void;
  setDiagramName: (name: string) => void;
  setIsSaving: (v: boolean) => void;
  setIsDirty: (v: boolean) => void;
  setWebrtcStatus: (connected: boolean, peerId?: string) => void;
  setAutoLayoutEnabled: (enabled: boolean) => void;
  setRootNodeId: (id: string | null) => void;
  setPlaybackMode: (mode: PlaybackMode) => void;
  setPlaybackSpeed: (speed: number) => void;
  setActiveFrameId: (id: string | null) => void;
  setActiveFrameMode: (mode: FrameMode) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  activeTool: "select",
  activePanel: null,
  selectedNodeIds: [],
  diagramName: "Untitled Diagram",
  isSaving: false,
  isDirty: false,
  webrtcConnected: false,
  webrtcPeerId: null,
  autoLayoutEnabled: true,
  rootNodeId: null,
  playbackMode: "sequential",
  playbackSpeed: 1,
  activeFrameId: null,
  activeFrameMode: "diagram",

  setActiveTool: (tool) => set({ activeTool: tool }),
  setActivePanel: (panel) => set((s) => ({ activePanel: s.activePanel === panel ? null : panel })),
  setSelectedNodeIds: (ids) => set({ selectedNodeIds: ids }),
  setDiagramName: (name) => set({ diagramName: name, isDirty: true }),
  setIsSaving: (v) => set({ isSaving: v }),
  setIsDirty: (v) => set({ isDirty: v }),
  setWebrtcStatus: (connected, peerId) => set({ webrtcConnected: connected, webrtcPeerId: peerId ?? null }),
  setAutoLayoutEnabled: (enabled: boolean) => set({ autoLayoutEnabled: enabled }),
  setRootNodeId: (id: string | null) => set({ rootNodeId: id }),
  setPlaybackMode: (mode) => set({ playbackMode: mode }),
  setPlaybackSpeed: (speed) => set({ playbackSpeed: speed }),
  setActiveFrameId: (id) => set({ activeFrameId: id }),
  setActiveFrameMode: (mode) => set({ activeFrameMode: mode }),
}));
