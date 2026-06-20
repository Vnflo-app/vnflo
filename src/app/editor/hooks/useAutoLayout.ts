import { useCallback } from "react";
import type { Node, Edge, ReactFlowInstance } from "@xyflow/react";
import { applyElkLayout, type ElkLayoutDirection } from "./useElkLayout";

interface UseAutoLayoutArgs {
  nodes: Node[];
  edges: Edge[];
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  rfInstance: ReactFlowInstance | null;
  pushHistory: (n: Node[], e: Edge[]) => void;
}

export function useAutoLayout({ nodes, edges, setNodes, rfInstance, pushHistory }: UseAutoLayoutArgs) {
  const handleAutoLayout = useCallback(async (dir: ElkLayoutDirection) => {
    if (nodes.length < 2) return;
    pushHistory(nodes, edges);
    const laid = await applyElkLayout(nodes, edges, dir);
    setNodes(laid);
    setTimeout(() => rfInstance?.fitView({ padding: 0.1 }), 60);
  }, [nodes, edges, setNodes, rfInstance, pushHistory]);

  return { handleAutoLayout };
}