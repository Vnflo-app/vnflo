import { useCallback, useRef } from "react";
import type { Node, Edge, Connection } from "@xyflow/react";
import { addEdge, MarkerType, reconnectEdge } from "@xyflow/react";
import { generateId } from "../../db/index";

interface UseEdgeOperationsArgs {
  nodes: Node[];
  edges: Edge[];
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  pushHistory: (n: Node[], e: Edge[]) => void;
  theme: any;
  edgeType: "default" | "step";
}

export function useEdgeOperations({
  nodes,
  edges,
  setEdges,
  pushHistory,
  theme,
  edgeType,
}: UseEdgeOperationsArgs) {
  const edgeReconnectSuccessful = useRef(true);

  const onConnect = useCallback(
    (connection: Connection) => {
      pushHistory(nodes, edges);
      setEdges((es) =>
        addEdge(
          {
            ...connection,
            id: generateId(),
            style: { stroke: theme.accent, strokeWidth: 2 },
            markerEnd: { type: MarkerType.ArrowClosed, color: theme.accent },
            type: edgeType,
            reconnectable: true,
          },
          es
        )
      );
    },
    [nodes, edges, pushHistory, theme.accent, edgeType, setEdges]
  );

  const onEdgeUpdate = useCallback(
    (oldEdge: Edge, newConnection: Connection) => {
      edgeReconnectSuccessful.current = true;
      pushHistory(nodes, edges);
      setEdges((es) => reconnectEdge(oldEdge, newConnection, es));
    },
    [nodes, edges, pushHistory, setEdges]
  );

  const onReconnectStart = useCallback(() => {
    edgeReconnectSuccessful.current = false;
  }, []);

  const onReconnectEnd = useCallback(
    (_: any, edge: Edge) => {
      if (!edgeReconnectSuccessful.current && edge) {
        pushHistory(nodes, edges);
        setEdges((eds) => eds.filter((e) => e.id !== edge.id));
      }
      edgeReconnectSuccessful.current = true;
    },
    [nodes, edges, pushHistory, setEdges]
  );

  const handleEdgeTypeChange = useCallback(
    (type: "default" | "step") => {
      pushHistory(nodes, edges);
      const activeNodes = nodes.filter((n) => n.selected);

      if (activeNodes.length === 0) {
        setEdges((es) => es.map((e) => ({ ...e, type, reconnectable: true })));
      } else {
        const selectedIds = new Set(activeNodes.map((n) => n.id));
        const branchIds = new Set<string>();
        const queue = [...selectedIds];
        while (queue.length > 0) {
          const currentId = queue.shift()!;
          if (!branchIds.has(currentId)) {
             branchIds.add(currentId);
            edges.forEach((e) => {
              if (e.source === currentId && !branchIds.has(e.target)) {
                queue.push(e.target);
              }
            });
          }
        }

        setEdges((es) =>
          es.map((e) => {
            if (branchIds.has(e.source)) {
              return { ...e, type, reconnectable: true };
            }
            return e;
          })
        );
      }
    },
    [nodes, edges, pushHistory, setEdges]
  );

  return {
    onConnect,
    onEdgeUpdate,
    onReconnectStart,
    onReconnectEnd,
    handleEdgeTypeChange,
  };
}