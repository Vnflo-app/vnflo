import type { Node, Edge } from "@xyflow/react";
import type { NodeShape } from "./nodes/CustomNode";

export interface HistorySnapshot {
  nodes: Node[];
  edges: Edge[];
}

export interface MenuState {
  isOpen: boolean;
  x: number;
  y: number;
  nodeId: string | null;
  nodeLabel: string;
  nodeShape: NodeShape;
  nodeBgColor: string;
  isFrame: boolean;
}

export interface StampedTemplate {
  title: string;
  nodes: any[];
  edges: any[];
}

export interface ClipboardData {
  nodes: Node[];
  edges: Edge[];
}