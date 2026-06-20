import { useCallback } from "react";
import type { Node, Edge } from "@xyflow/react";
import { generateId } from "../../db/index";
import type { HistorySnapshot } from "../types";

interface UseClipboardArgs {
  nodes: Node[];
  edges: Edge[];
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  pushHistory: (n: Node[], e: Edge[]) => void;
  handleDeleteSelected: () => void;
}

export function useClipboard({
  nodes,
  edges,
  setNodes,
  setEdges,
  pushHistory,
  handleDeleteSelected,
}: UseClipboardArgs) {
  const handleCopy = useCallback(() => {
    const selectedNodes = nodes.filter((n) => n.selected);
    const selectedEdges = edges.filter((e) => e.selected);
    if (selectedNodes.length === 0) return;
    localStorage.setItem(
      "vnflo_clipboard",
      JSON.stringify({ nodes: selectedNodes, edges: selectedEdges })
    );
  }, [nodes, edges]);

  const handleCut = useCallback(() => {
    const selectedNodes = nodes.filter((n) => n.selected);
    if (selectedNodes.length === 0) return;
    localStorage.setItem(
      "vnflo_clipboard",
      JSON.stringify({
        nodes: selectedNodes,
        edges: edges.filter((e) => e.selected),
      })
    );
    handleDeleteSelected();
  }, [nodes, edges, handleDeleteSelected]);

  const handlePaste = useCallback(() => {
    const str = localStorage.getItem("vnflo_clipboard");
    if (!str) return;
    try {
      const clipboard = JSON.parse(str);
      if (!clipboard.nodes || !Array.isArray(clipboard.nodes)) return;

      const idMap: Record<string, string> = {};
      const newNodes = clipboard.nodes.map((node: any) => {
        const newId = generateId();
        idMap[node.id] = newId;
        return {
          ...node,
          id: newId,
          position: { x: node.position.x + 40, y: node.position.y + 40 },
          selected: true,
        };
      });

      const newEdges = (clipboard.edges || []).map((edge: any) => ({
        ...edge,
        id: `e-${generateId()}`,
        source: idMap[edge.source] || edge.source,
        target: idMap[edge.target] || edge.target,
        selected: true,
      }));

      setNodes((ns) => ns.map((n) => ({ ...n, selected: false })));
      setEdges((es) => es.map((e) => ({ ...e, selected: false })));
      pushHistory(nodes, edges);
      setNodes((ns) => [...ns, ...newNodes]);
      setEdges((es) => [...es, ...newEdges]);
    } catch (e) {
      console.error("Paste failed:", e);
    }
  }, [nodes, edges, setNodes, setEdges, pushHistory]);

  const handleDuplicate = useCallback(() => {
    const selectedNodes = nodes.filter((n) => n.selected);
    if (selectedNodes.length === 0) return;

    const idMap: Record<string, string> = {};
    const dupNodes = selectedNodes.map((node) => {
      const newId = generateId();
      idMap[node.id] = newId;
      return {
        ...node,
        id: newId,
        position: { x: node.position.x + 40, y: node.position.y + 40 },
        selected: true,
      };
    });

    const dupEdges = edges
      .filter((e) => e.selected)
      .map((edge) => ({
        ...edge,
        id: `e-${generateId()}`,
        source: idMap[edge.source] || edge.source,
        target: idMap[edge.target] || edge.target,
        selected: true,
      }));

    setNodes((ns) => ns.map((n) => ({ ...n, selected: false })));
    setEdges((es) => es.map((e) => ({ ...e, selected: false })));
    pushHistory(nodes, edges);
    setNodes((ns) => [...ns, ...dupNodes]);
    setEdges((es) => [...es, ...dupEdges]);
  }, [nodes, edges, setNodes, setEdges, pushHistory]);

  const handleSelectAll = useCallback(() => {
    setNodes((ns) => ns.map((n) => ({ ...n, selected: true })));
    setEdges((es) => es.map((e) => ({ ...e, selected: true })));
  }, [setNodes, setEdges]);

  return { handleCopy, handleCut, handlePaste, handleDuplicate, handleSelectAll };
}