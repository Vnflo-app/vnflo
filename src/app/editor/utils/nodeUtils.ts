import type { Node } from "@xyflow/react";

export function cleanOrphanedNodes(allNodes: Node[]): Node[] {
  let currentNodes = [...allNodes];
  let changed = true;
  while (changed) {
    const nodeIds = new Set(currentNodes.map((n) => n.id));
    const nextNodes = currentNodes.filter(
      (n) => !n.parentId || nodeIds.has(n.parentId)
    );
    if (nextNodes.length === currentNodes.length) {
      changed = false;
    } else {
      currentNodes = nextNodes;
    }
  }
  return currentNodes;
}

export function isNodeInsideFrame(node: Node, allNodes: Node[]): boolean {
  let curr = node.parentId;
  while (curr) {
    const parent = allNodes.find((pn) => pn.id === curr);
    if (parent) {
      if (parent.type === "frame") return true;
      curr = parent.parentId;
    } else {
      break;
    }
  }
  return false;
}

export function getNodeZIndex(node: Node, allNodes: Node[]): number {
  if (node.parentId) {
    const parent = allNodes.find((pn) => pn.id === node.parentId);
    if (parent) {
      return getNodeZIndex(parent, allNodes) + 5 + (node.selected ? 1000 : 0);
    }
  }
  const index = allNodes.findIndex((n) => n.id === node.id);
  let baseZIndex = (index >= 0 ? index : 0) * 10 + 10;
  if (node.selected) baseZIndex += 1000;
  return baseZIndex;
}

export function isNodeCoveredByAnyFrame(node: Node, allNodes: Node[]): boolean {
  if (node.type === "frame") return false;
  if (isNodeInsideFrame(node, allNodes)) return false;

  const nodeW = node.width ?? (node.data as any)?.width ?? 160;
  const nodeH = node.height ?? (node.data as any)?.height ?? 80;

  let nodeX = node.position.x;
  let nodeY = node.position.y;
  let parentId = node.parentId;
  while (parentId) {
    const parent = allNodes.find((pn) => pn.id === parentId);
    if (parent) {
      nodeX += parent.position.x;
      nodeY += parent.position.y;
      parentId = parent.parentId;
    } else {
      break;
    }
  }

  const nodeZ = getNodeZIndex(node, allNodes);
  const frames = allNodes.filter((n) => n.type === "frame");

  for (const frame of frames) {
    const frameW = frame.width ?? (frame.data as any)?.width ?? 480;
    const frameH = frame.height ?? (frame.data as any)?.height ?? 600;
    const frameX = frame.position.x;
    const frameY = frame.position.y;

    const overlapX = Math.max(
      0,
      Math.min(nodeX + nodeW, frameX + frameW) - Math.max(nodeX, frameX)
    );
    const overlapY = Math.max(
      0,
      Math.min(nodeY + nodeH, frameY + frameH) - Math.max(nodeY, frameY)
    );

    if (overlapX > 0 && overlapY > 0) {
      const frameZ = getNodeZIndex(frame, allNodes);
      if (frameZ > nodeZ) return true;
    }
  }

  return false;
}