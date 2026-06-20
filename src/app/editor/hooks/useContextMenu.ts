import { useCallback, useState } from "react";
import type { Node, Edge, ReactFlowInstance } from "@xyflow/react";
import { MarkerType } from "@xyflow/react";
import { generateId } from "../../db/index";
import type { NodeShape, CustomNodeData } from "../nodes/CustomNode";
import type { MenuState, StampedTemplate } from "../types";
import { applyElkLayout, type ElkLayoutDirection } from "../hooks/useElkLayout";

interface UseContextMenuArgs {
  rfInstance: ReactFlowInstance | null;
  reactFlowWrapperRef: React.RefObject<HTMLDivElement | null>;
  nodes: Node[];
  edges: Edge[];
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  pushHistory: (n: Node[], e: Edge[]) => void;
  handleUpdateNode: (id: string, data: Partial<CustomNodeData>) => void;
  defaultNodeData: any;
  toolColors: { bgColor: string; borderColor: string; textColor: string };
  toolIcon?: string;
  theme: any;
  edgeType: "default" | "step";
  stampedTemplate: StampedTemplate | null;
  setStampedTemplate: React.Dispatch<React.SetStateAction<StampedTemplate | null>>;
  setShowMobileProps: (show: boolean) => void;
}

export function useContextMenu({
  rfInstance,
  reactFlowWrapperRef,
  nodes,
  edges,
  setNodes,
  setEdges,
  pushHistory,
  handleUpdateNode,
  defaultNodeData,
  toolColors,
  toolIcon,
  theme,
  edgeType,
  stampedTemplate,
  setStampedTemplate,
  setShowMobileProps,
}: UseContextMenuArgs) {
  const [menuState, setMenuState] = useState<MenuState>({
    isOpen: false,
    x: 0,
    y: 0,
    nodeId: null,
    nodeLabel: "",
    nodeShape: "rect",
    nodeBgColor: theme.nodeBg,
    isFrame: false,
  });

  const handleCloseMenu = useCallback(() => {
    setMenuState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const handlePaneClick = useCallback(
    (event: React.MouseEvent) => {
      handleCloseMenu();
      if (!stampedTemplate || !rfInstance) return;

      pushHistory(nodes, edges);
      const flowPos = rfInstance.screenToFlowPosition({ x: event.clientX, y: event.clientY });

      const idMap: Record<string, string> = {};
      const tplNodes = stampedTemplate.nodes.map((n: any) => {
        const newId = generateId();
        idMap[n.id] = newId;
        return {
          id: newId,
          type: "custom",
          position: { x: 0, y: 0 },
          width: n.width || 160,
          height: n.height || 80,
          data: {
            ...defaultNodeData,
            label: n.label,
            shape: n.shape || "rect",
            bgColor: n.bgColor || theme.nodeBg,
            borderColor: n.bgColor ? `${n.bgColor}99` : theme.nodeBorder,
            textColor: theme.nodeText,
          },
        };
      });

      const tplEdges = stampedTemplate.edges.map((e: any) => ({
        id: generateId(),
        source: idMap[e.source] || e.source,
        target: idMap[e.target] || e.target,
        label: e.label,
        style: { stroke: theme.accent, strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: theme.accent },
        type: edgeType,
        reconnectable: true,
      }));

      applyElkLayout(tplNodes as Node[], tplEdges as Edge[], "TB").then((laidNodes) => {
        const rootNode = laidNodes.find(
          (tn: any) => !tplEdges.some((te: any) => te.target === tn.id)
        ) || laidNodes[0];

        const dx = flowPos.x - (rootNode?.position?.x || 0);
        const dy = flowPos.y - (rootNode?.position?.y || 0);

        const targetFrame = nodes.find((fn) => {
          if (fn.type !== "frame") return false;
          const fw = fn.width ?? 480;
          const fh = fn.height ?? 600;
          return (
            flowPos.x >= fn.position.x &&
            flowPos.x <= fn.position.x + fw &&
            flowPos.y >= fn.position.y &&
            flowPos.y <= fn.position.y + fh
          );
        });

        const positionedNodes = laidNodes.map((n) => {
          if (targetFrame) {
            return {
              ...n,
              parentId: targetFrame.id,
              extent: "parent" as const,
              position: {
                x: n.position.x + dx - targetFrame.position.x,
                y: n.position.y + dy - targetFrame.position.y,
              },
            };
          } else {
            return {
              ...n,
              position: { x: n.position.x + dx, y: n.position.y + dy },
            };
          }
        });

        setNodes((ns) => [...ns, ...positionedNodes]);
        setEdges((es) => [...es, ...tplEdges]);
        setStampedTemplate(null);
      });
    },
    [stampedTemplate, rfInstance, nodes, edges, pushHistory, theme, edgeType, defaultNodeData, handleCloseMenu, setNodes, setEdges, setStampedTemplate]
  );

  const handleRenameNode = useCallback(
    (id: string, newLabel: string) => {
      pushHistory(nodes, edges);
      handleUpdateNode(id, { label: newLabel });
    },
    [nodes, edges, handleUpdateNode, pushHistory]
  );

  const handleChangeNodeShape = useCallback(
    (id: string, shape: NodeShape) => {
      pushHistory(nodes, edges);
      handleUpdateNode(id, { shape });
    },
    [nodes, edges, handleUpdateNode, pushHistory]
  );

  const handleChangeNodeColor = useCallback(
    (id: string, color: string) => {
      pushHistory(nodes, edges);
      handleUpdateNode(id, { bgColor: color, borderColor: `${color}99` });
    },
    [nodes, edges, handleUpdateNode, pushHistory]
  );

  const handleSpawnNode = useCallback(
    (shape: NodeShape) => {
      if (!rfInstance || !reactFlowWrapperRef.current) return;
      const rect = reactFlowWrapperRef.current.getBoundingClientRect();
      const flowPos = rfInstance.screenToFlowPosition({
        x: menuState.x + rect.left,
        y: menuState.y + rect.top,
      });

      const clickedNode = menuState.nodeId ? nodes.find((n) => n.id === menuState.nodeId) : null;
      const targetFrame = (clickedNode && clickedNode.type === "frame")
        ? clickedNode
        : nodes.find((n) => {
            if (n.type !== "frame") return false;
            const fw = n.width ?? 480;
            const fh = n.height ?? 600;
            return (
              flowPos.x >= n.position.x &&
              flowPos.x <= n.position.x + fw &&
              flowPos.y >= n.position.y &&
              flowPos.y <= n.position.y + fh
            );
          });

      let relativePos = flowPos;
      if (targetFrame) {
        let rx = flowPos.x - targetFrame.position.x;
        let ry = flowPos.y - targetFrame.position.y;
        const fw = targetFrame.width ?? 480;
        const fh = targetFrame.height ?? 600;
        rx = Math.max(20, Math.min(rx, fw - 160 - 20));
        ry = Math.max(40, Math.min(ry, fh - 80 - 20));
        relativePos = { x: rx, y: ry };
      }

      const newNode: Node = {
        id: generateId(),
        type: "custom",
        position: targetFrame ? relativePos : flowPos,
        parentId: targetFrame?.id,
        width: 160,
        height: 80,
        data: {
          ...defaultNodeData,
          label: shape.charAt(0).toUpperCase() + shape.slice(1),
          shape,
          ...toolColors,
          ...(toolIcon ? { iconName: toolIcon } : {}),
        } as unknown as Record<string, unknown>,
      };
      pushHistory(nodes, edges);
      setNodes((ns) => [...ns, newNode]);
    },
    [rfInstance, menuState.x, menuState.y, menuState.nodeId, defaultNodeData, toolColors, toolIcon, nodes, edges, pushHistory, setNodes, reactFlowWrapperRef]
  );

  const handleSpawnFrame = useCallback(
    (frameType: "flowchart") => {
      if (!rfInstance || !reactFlowWrapperRef.current) return;
      const rect = reactFlowWrapperRef.current.getBoundingClientRect();
      const flowPos = rfInstance.screenToFlowPosition({
        x: menuState.x + rect.left,
        y: menuState.y + rect.top,
      });

      const newFrameNode: Node = {
        id: generateId(),
        type: "frame",
        position: flowPos,
        width: 480,
        height: 600,
        data: {
          label: "Flowchart",
          frameType,
        } as unknown as Record<string, unknown>,
      };
      pushHistory(nodes, edges);
      setNodes((ns) => [...ns, newFrameNode]);
    },
    [rfInstance, menuState.x, menuState.y, nodes, edges, pushHistory, setNodes, reactFlowWrapperRef]
  );

  const handleAddFrame = useCallback(
    (frameType: "flowchart") => {
      if (!rfInstance || !reactFlowWrapperRef.current) return;
      const rect = reactFlowWrapperRef.current.getBoundingClientRect();
      const flowPos = rfInstance.screenToFlowPosition({
        x: rect.width / 2 + rect.left,
        y: rect.height / 2 + rect.top,
      });

      const newFrameNode: Node = {
        id: generateId(),
        type: "frame",
        position: { x: flowPos.x - 240, y: flowPos.y - 300 },
        width: 480,
        height: 600,
        data: {
          label: "Flowchart",
          frameType,
        } as unknown as Record<string, unknown>,
      };
      pushHistory(nodes, edges);
      setNodes((ns) => [...ns, newFrameNode]);
    },
    [rfInstance, nodes, edges, pushHistory, setNodes, reactFlowWrapperRef]
  );

  const handleCreateFigure = useCallback(() => {
    handleSpawnNode("rect");
  }, [handleSpawnNode]);

  const handleGroupSelection = useCallback(() => {
    const selectedCustomNodes = nodes.filter((n) => n.selected && n.type === "custom");
    if (selectedCustomNodes.length === 0) return;

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    selectedCustomNodes.forEach((n) => {
      const x = n.position.x;
      const y = n.position.y;
      const w = n.width ?? 160;
      const h = n.height ?? 80;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x + w > maxX) maxX = x + w;
      if (y + h > maxY) maxY = y + h;
    });

    const padding = 40;
    const frameX = minX - padding;
    const frameY = minY - padding - 40;
    const frameW = (maxX - minX) + padding * 2;
    const frameH = (maxY - minY) + padding * 2 + 40;

    const frameId = generateId();
    const newFrameNode: Node = {
      id: frameId,
      type: "frame",
      position: { x: frameX, y: frameY },
      width: frameW,
      height: frameH,
      data: {
        label: "Grouped Container",
        frameType: "flowchart",
      } as unknown as Record<string, unknown>,
    };

    const updatedNodes = nodes.map((n) => {
      if (n.selected && n.type === "custom") {
        return {
          ...n,
          parentId: frameId,
          position: {
            x: n.position.x - frameX,
            y: n.position.y - frameY,
          },
        };
      }
      return n;
    });

    pushHistory(nodes, edges);
    setNodes([...updatedNodes, newFrameNode]);
  }, [nodes, edges, setNodes, pushHistory]);

  const onNodeContextMenu = useCallback(
    (event: any, node: Node) => {
      event.preventDefault();
      if (!reactFlowWrapperRef.current) return;
      const rect = reactFlowWrapperRef.current.getBoundingClientRect();
      setMenuState({
        isOpen: true,
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
        nodeId: node.id,
        nodeLabel: (node.data as any).label || "",
        nodeShape: (node.data as any).shape || "rect",
        nodeBgColor: (node.data as any).bgColor || theme.nodeBg,
        isFrame: node.type === "frame",
      });
    },
    [theme.nodeBg, reactFlowWrapperRef]
  );

  const onPaneContextMenu = useCallback(
    (event: any) => {
      event.preventDefault();
      if (!reactFlowWrapperRef.current) return;
      const rect = reactFlowWrapperRef.current.getBoundingClientRect();
      setMenuState({
        isOpen: true,
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
        nodeId: null,
        nodeLabel: "",
        nodeShape: "rect",
        nodeBgColor: theme.nodeBg,
        isFrame: false,
      });
    },
    [theme.nodeBg, reactFlowWrapperRef]
  );

  const onNodeDoubleClick = useCallback(
    (event: any, node: Node) => {
      event.preventDefault();
      if (window.innerWidth < 768) {
        setNodes((ns) => ns.map((n) => ({ ...n, selected: n.id === node.id })));
        setShowMobileProps(true);
        return;
      }
      if (!reactFlowWrapperRef.current) return;
      const rect = reactFlowWrapperRef.current.getBoundingClientRect();
      setMenuState({
        isOpen: true,
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
        nodeId: node.id,
        nodeLabel: (node.data as any).label || "",
        nodeShape: (node.data as any).shape || "rect",
        nodeBgColor: (node.data as any).bgColor || theme.nodeBg,
        isFrame: node.type === "frame",
      });
    },
    [theme.nodeBg, setNodes, setShowMobileProps, reactFlowWrapperRef]
  );

  const onPaneDoubleClick = useCallback(
    (event: any) => {
      event.preventDefault();
      if (!reactFlowWrapperRef.current) return;
      const rect = reactFlowWrapperRef.current.getBoundingClientRect();
      setMenuState({
        isOpen: true,
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
        nodeId: null,
        nodeLabel: "",
        nodeShape: "rect",
        nodeBgColor: theme.nodeBg,
        isFrame: false,
      });
    },
    [theme.nodeBg, reactFlowWrapperRef]
  );

  return {
    menuState,
    setMenuState,
    handleCloseMenu,
    handlePaneClick,
    handleRenameNode,
    handleChangeNodeShape,
    handleChangeNodeColor,
    handleSpawnNode,
    handleSpawnFrame,
    handleAddFrame,
    handleCreateFigure,
    handleGroupSelection,
    onNodeContextMenu,
    onPaneContextMenu,
    onNodeDoubleClick,
    onPaneDoubleClick,
  };
}