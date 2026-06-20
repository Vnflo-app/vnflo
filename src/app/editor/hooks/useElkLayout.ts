import ELK, { type ElkNode, type ElkExtendedEdge } from "elkjs/lib/elk.bundled.js";
import { type Node, type Edge } from "@xyflow/react";
import { type CustomNodeData } from "../nodes/CustomNode";

const elk = new ELK();

export type ElkLayoutDirection = "TB" | "LR" | "BT" | "RL";

const ELK_OPTIONS: Record<string, string> = {
  "org.eclipse.elk.algorithm": "layered",
  "org.eclipse.elk.layered.spacing.nodeNodeBetweenLayers": "80",
  "org.eclipse.elk.spacing.nodeNode": "50",
  "org.eclipse.elk.direction": "DOWN",
};

export async function applyElkLayout(
  nodes: Node[],
  edges: Edge[],
  direction: ElkLayoutDirection = "TB"
): Promise<Node[]> {
  const elkNodes: ElkNode[] = nodes.map((n) => {
    const d = n.data as unknown as CustomNodeData;
    return {
      id: n.id,
      width: d.width ?? 160,
      height: d.height ?? 80,
    };
  });

  const elkEdges: ElkExtendedEdge[] = edges.map((e) => ({
    id: e.id,
    sources: [e.source],
    targets: [e.target],
  }));

  const dirMap: Record<ElkLayoutDirection, string> = {
    TB: "DOWN",
    LR: "RIGHT",
    BT: "UP",
    RL: "LEFT",
  };

  const graph: ElkNode = {
    id: "root",
    layoutOptions: {
      ...ELK_OPTIONS,
      "org.eclipse.elk.direction": dirMap[direction],
    },
    children: elkNodes,
    edges: elkEdges,
  };

  const layout = await elk.layout(graph);

  return nodes.map((n) => {
    const lNode = layout.children?.find((c) => c.id === n.id);
    if (!lNode || lNode.x === undefined || lNode.y === undefined) return n;
    return { ...n, position: { x: lNode.x, y: lNode.y } };
  });
}
