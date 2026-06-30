import { useEffect, useRef } from "react";
import * as Y from "yjs";
import { type Node, type Edge } from "@xyflow/react";

export function useYjsBinding(
  ydoc: Y.Doc,
  nodes: Node[],
  edges: Edge[],
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>,
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>,
  enabled: boolean
) {
  const isApplyingRef = useRef(false);

  // 1. Listen to Yjs changes and update ReactFlow state
  useEffect(() => {
    if (!enabled) return;

    const yNodes = ydoc.getMap<any>("nodes");
    const yEdges = ydoc.getMap<any>("edges");

    const observer = () => {
      if (isApplyingRef.current) return;
      isApplyingRef.current = true;
      try {
        const newNodes = Array.from(yNodes.values());
        const newEdges = Array.from(yEdges.values());

        // Check if actually different before setting to prevent loops and unnecessary re-renders
        const nodesChanged = JSON.stringify(newNodes) !== JSON.stringify(nodes);
        const edgesChanged = JSON.stringify(newEdges) !== JSON.stringify(edges);

        if (nodesChanged) {
          setNodes(newNodes);
        }
        if (edgesChanged) {
          setEdges(newEdges);
        }
      } finally {
        isApplyingRef.current = false;
      }
    };

    yNodes.observe(observer);
    yEdges.observe(observer);

    return () => {
      yNodes.unobserve(observer);
      yEdges.unobserve(observer);
    };
  }, [ydoc, setNodes, setEdges, enabled, nodes, edges]);

  // 2. Push ReactFlow state changes to Yjs
  useEffect(() => {
    if (!enabled || isApplyingRef.current) return;
    isApplyingRef.current = true;

    const yNodes = ydoc.getMap<any>("nodes");
    const yEdges = ydoc.getMap<any>("edges");

    ydoc.transact(() => {
      // Sync nodes
      const nodeIds = new Set(nodes.map((n) => n.id));
      for (const key of yNodes.keys()) {
        if (!nodeIds.has(key)) {
          yNodes.delete(key);
        }
      }
      for (const node of nodes) {
        const existing = yNodes.get(node.id);
        if (JSON.stringify(existing) !== JSON.stringify(node)) {
          yNodes.set(node.id, node);
        }
      }

      // Sync edges
      const edgeIds = new Set(edges.map((e) => e.id));
      for (const key of yEdges.keys()) {
        if (!edgeIds.has(key)) {
          yEdges.delete(key);
        }
      }
      for (const edge of edges) {
        const existing = yEdges.get(edge.id);
        if (JSON.stringify(existing) !== JSON.stringify(edge)) {
          yEdges.set(edge.id, edge);
        }
      }
    });

    isApplyingRef.current = false;
  }, [nodes, edges, ydoc, enabled]);
}
