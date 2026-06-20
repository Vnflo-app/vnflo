import { useCallback, useRef, useState } from "react";
import type { Node, Edge } from "@xyflow/react";
import type { HistorySnapshot } from "../types";

export function useEditorHistory(
  nodes: Node[],
  edges: Edge[],
  setNodes: (ns: Node[]) => void,
  setEdges: (es: Edge[]) => void
) {
  const undoStack = useRef<HistorySnapshot[]>([]);
  const redoStack = useRef<HistorySnapshot[]>([]);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const pushHistory = useCallback((n: Node[], e: Edge[]) => {
    undoStack.current.push({ nodes: n, edges: e });
    if (undoStack.current.length > 60) undoStack.current.shift();
    redoStack.current = [];
    setCanUndo(true);
    setCanRedo(false);
  }, []);

  const handleUndo = useCallback(() => {
    const snap = undoStack.current.pop();
    if (!snap) return;
    redoStack.current.push({ nodes, edges });
    setNodes(snap.nodes);
    setEdges(snap.edges);
    setCanUndo(undoStack.current.length > 0);
    setCanRedo(true);
  }, [nodes, edges, setNodes, setEdges]);

  const handleRedo = useCallback(() => {
    const snap = redoStack.current.pop();
    if (!snap) return;
    undoStack.current.push({ nodes, edges });
    setNodes(snap.nodes);
    setEdges(snap.edges);
    setCanRedo(redoStack.current.length > 0);
    setCanUndo(true);
  }, [nodes, edges, setNodes, setEdges]);

  return { pushHistory, handleUndo, handleRedo, canUndo, canRedo };
}