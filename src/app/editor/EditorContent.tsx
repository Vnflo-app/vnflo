"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ReactFlow, Background, Controls, MiniMap, BackgroundVariant,
  useNodesState, useEdgesState, MarkerType,
  type Node, type Edge, type ReactFlowInstance,
  ReactFlowProvider, Panel, ConnectionMode, useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useParams, useRouter } from "next/navigation";
import { PanelRightClose, PanelRightOpen, Sparkles, X } from "lucide-react";

import { useAuthStore } from "../stores/authStore";
import { useDiagramStore } from "../stores/diagramStore";
import { useEditorStore } from "../stores/editorStore";
import { useEditorTheme } from "./context/EditorThemeContext";

import { CustomNode, type CustomNodeData, type NodeShape } from "./nodes/CustomNode";
import { FrameNode } from "./nodes/FrameNode";
import { ToolsPanel } from "./panels/ToolsPanel";
import { PropertiesPanel } from "./panels/PropertiesPanel";
import { EditorToolbar } from "./components/EditorToolbar";
import { WebRTCModal } from "./components/WebRTCModal";
import { CustomConnectionLine } from "./components/CustomConnectionLine";
import { CanvasContextMenu } from "./components/CanvasContextMenu";
import { EditableEdge, EdgeEditContext } from "./components/EditableEdge";
import { TouchDock } from "./components/TouchDock";

import { ScopedCodeEditorPanel } from "./panels/ScopedCodeEditorPanel";
import { ScopedAIChatPanel } from "./panels/ScopedAIChatPanel";

import { useWebRTC } from "./hooks/useWebRTC";
import { generateId } from "../db/index";

// Hooks
import { useEditorHistory } from "./hooks/useEditorHistory";
import { useClipboard } from "./hooks/useClipboard";
import { useNodeOperations } from "./hooks/useNodeOperations";
import { useEdgeOperations } from "./hooks/useEdgeOperations";
import { useExportDiagram } from "./hooks/useExportDiagram";
import { useContextMenu } from "./hooks/useContextMenu";
import { useAIDiagram } from "./hooks/useAIDiagram";
import { useAutoLayout } from "./hooks/useAutoLayout";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";

// Utils & Constants
import { NODE_TYPES, EDGE_TYPES } from "./constants";
import { cleanOrphanedNodes, getNodeZIndex, isNodeCoveredByAnyFrame } from "./utils/nodeUtils";
import type { StampedTemplate } from "./types";

export function EditorContent() {
  const { id: diagramId } = useParams<{ id: string }>();
  const router = useRouter();
  const navigate = (path: string) => router.push(path);
  
  const user = useAuthStore((s) => s.user);
  const getDiagram = useDiagramStore((s) => s.getDiagram);
  const updateDiagram = useDiagramStore((s) => s.updateDiagram);
  
  const diagramName = useEditorStore((s) => s.diagramName);
  const setDiagramName = useEditorStore((s) => s.setDiagramName);
  const setIsSaving = useEditorStore((s) => s.setIsSaving);
  const setIsDirty = useEditorStore((s) => s.setIsDirty);
  
  const activeFrameId = useEditorStore((s) => s.activeFrameId);
  const activeFrameMode = useEditorStore((s) => s.activeFrameMode);
  const setActiveFrameMode = useEditorStore((s) => s.setActiveFrameMode);
  const activePanel = useEditorStore((s) => s.activePanel);
  const setActivePanel = useEditorStore((s) => s.setActivePanel);

  const { theme } = useEditorTheme();

  const defaultNodeData = useMemo(() => ({
    shape: "rect" as NodeShape,
    bgColor: theme.nodeBg,
    borderColor: theme.nodeBorder,
    textColor: theme.nodeText,
    borderWidth: 2,
    borderStyle: "solid" as const,
    fontSize: 13,
    width: 160,
    height: 80,
    resizable: true,
  }), [theme]);

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);
  const [showWebRTC, setShowWebRTC] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [showMobileProps, setShowMobileProps] = useState(false);
  const [editingEdgeId, setEditingEdgeId] = useState<string | null>(null);
  
  const [selectedShape, setSelectedShape] = useState<NodeShape>("rect");
  const [toolColors, setToolColors] = useState({
    bgColor: theme.nodeBg, borderColor: theme.nodeBorder, textColor: theme.nodeText,
  });
  const [toolIcon, setToolIcon] = useState<string | undefined>();
  const [edgeType, setEdgeType] = useState<"default" | "step">("default");
  const [stampedTemplate, setStampedTemplate] = useState<StampedTemplate | null>(null);

  const reactFlowWrapperRef = useRef<HTMLDivElement>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rtc = useWebRTC();
  const fitViewOptions = useMemo(() => ({ padding: 0.1 }), []);

  // Sync tool colors when theme changes
  useEffect(() => {
    setToolColors({ bgColor: theme.nodeBg, borderColor: theme.nodeBorder, textColor: theme.nodeText });
  }, [theme.id]);

  useEffect(() => {
    setLoaded(false);
  }, [diagramId]);

  // ── Load Diagram ─────────────────────────────────────────
  useEffect(() => {
    if (!diagramId || !user || loaded) return;
    (async () => {
      const d = await getDiagram(diagramId);
      if (!d || d.ownerId !== user.id) { navigate("/dashboard"); return; }
      setDiagramName(d.name);
      setNodes(cleanOrphanedNodes((d.nodes as Node[]) ?? []));
      setEdges(((d.edges as Edge[]) ?? []).map((e) => ({ ...e, reconnectable: true })));
      setLoaded(true);
    })();
  }, [diagramId, user, loaded]);

  useEffect(() => {
    if (loaded && rfInstance) setTimeout(() => rfInstance.fitView(fitViewOptions), 150);
  }, [loaded, rfInstance]);

  useEffect(() => {
    setIsTouchDevice("ontouchstart" in window || navigator.maxTouchPoints > 0);
  }, []);

  useEffect(() => {
    if (activeFrameId && (activeFrameMode === "ai" || activeFrameMode === "dsl")) {
      setShowMobileProps(true);
    }
  }, [activeFrameId, activeFrameMode]);

  // ── WebRTC Remote Sync ───────────────────────────────────
  useEffect(() => {
    rtc.onRemoteUpdate((n, e) => {
      setNodes(cleanOrphanedNodes(n as Node[]));
      setEdges(((e as Edge[]) ?? []).map((edge) => ({ ...edge, reconnectable: true })));
    });
  }, []);

  // ── Auto-Save ────────────────────────────────────────────
  const scheduleSave = useCallback(() => {
    setIsDirty(true);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      if (!diagramId) return;
      setIsSaving(true);
      const d = await getDiagram(diagramId);
      if (!d) { setIsSaving(false); return; }
      await updateDiagram({ ...d, name: diagramName, nodes, edges });
      setIsSaving(false);
      setIsDirty(false);
      rtc.sendNodes(nodes, edges);
    }, 1500);
  }, [diagramId, diagramName, nodes, edges, getDiagram, updateDiagram, setIsSaving, setIsDirty, rtc]);

  useEffect(() => { if (loaded) scheduleSave(); }, [nodes, edges]);
  useEffect(() => { if (loaded) scheduleSave(); }, [diagramName]);

  // ── Z-Index & Visibility Calculations ────────────────────
  const nodesWithZIndex = useMemo(() => {
    return nodes.map((n) => {
      const zIndex = getNodeZIndex(n, nodes);
      if (n.type === "frame") {
        const cleaned = (n.className || "").replace(/\bnode-frame-container\b/g, "").replace(/\s+/g, " ").trim();
        return { ...n, zIndex, className: `${cleaned} node-frame-container`.trim() };
      }
      
      let isInsideFrame = false;
      let curr = n.parentId;
      while (curr) {
        const parent = nodes.find((pn) => pn.id === curr);
        if (parent) {
          if (parent.type === "frame") { isInsideFrame = true; break; }
          curr = parent.parentId;
        } else break;
      }

      const newClass = isInsideFrame ? "node-inside-frame" : "node-outside-frame";
      const cleanedClassName = (n.className || "").replace(/\b(node-inside-frame|node-outside-frame)\b/g, "").replace(/\s+/g, " ").trim();
      return { ...n, zIndex, className: `${cleanedClassName} ${newClass}`.trim() };
    });
  }, [nodes]);

  const edgesWithVisibility = useMemo(() => {
    return edges.map((e) => {
      const sourceNode = nodes.find((n) => n.id === e.source);
      const targetNode = nodes.find((n) => n.id === e.target);
      const isSourceCovered = sourceNode ? isNodeCoveredByAnyFrame(sourceNode, nodes) : false;
      const isTargetCovered = targetNode ? isNodeCoveredByAnyFrame(targetNode, nodes) : false;
      const sourceZ = sourceNode ? getNodeZIndex(sourceNode, nodes) : 0;
      const targetZ = targetNode ? getNodeZIndex(targetNode, nodes) : 0;
      const zIndex = Math.min(sourceZ, targetZ) - 1;
      
      if (isSourceCovered || isTargetCovered) return { ...e, zIndex, hidden: true };
      return { ...e, zIndex };
    });
  }, [edges, nodes]);

  // ── Initialize Hooks ─────────────────────────────────────
  const { pushHistory, handleUndo, handleRedo, canUndo, canRedo } = useEditorHistory(nodes, edges, setNodes, setEdges);

  const { 
    spawnNode, handleUpdateNode, handleDeleteSelected, handleDeleteNode, 
    handleNodesChange, onNodeDragStop 
  } = useNodeOperations({
    rfInstance, activeFrameId, nodes, edges, setNodes, setEdges, onNodesChange,
    pushHistory, defaultNodeData, toolColors, toolIcon, theme,
  });

  const { 
    onConnect, onEdgeUpdate, onReconnectStart, onReconnectEnd, handleEdgeTypeChange 
  } = useEdgeOperations({
    nodes, edges, setEdges, pushHistory, theme, edgeType,
  });

  const { 
    handleCopy, handleCut, handlePaste, handleDuplicate, handleSelectAll 
  } = useClipboard({
    nodes, edges, setNodes, setEdges, pushHistory, handleDeleteSelected,
  });

  const { 
    handleExport, handleCopyAsPNG, handleCopyAsSVG, handleCopyLink, 
    handleCopyMarkdown, handleCopyHTML 
  } = useExportDiagram({
    rfInstance, diagramName, theme, nodes, edges,
  });

  const handleCopyStyles = useCallback(() => {
    const selectedNodes = nodes.filter((n) => n.selected);
    if (selectedNodes.length === 1) {
      const data = selectedNodes[0].data as any;
      localStorage.setItem("vnflo_copied_styles", JSON.stringify({
        bgColor: data.bgColor, borderColor: data.borderColor, textColor: data.textColor,
        borderWidth: data.borderWidth, borderStyle: data.borderStyle, fontSize: data.fontSize, shape: data.shape,
      }));
    }
  }, [nodes]);

  const handlePasteStyles = useCallback(() => {
    const stylesStr = localStorage.getItem("vnflo_copied_styles");
    if (!stylesStr) return;
    try {
      const styles = JSON.parse(stylesStr);
      setNodes((ns) => ns.map((n) => n.selected && n.type === "custom" ? { ...n, data: { ...n.data, ...styles } } : n));
      pushHistory(nodes, edges);
    } catch (e) { console.error(e); }
  }, [nodes, edges, setNodes, pushHistory]);

  const { 
    menuState, handleCloseMenu, handlePaneClick, handleRenameNode, handleChangeNodeShape, 
    handleChangeNodeColor, handleSpawnNode, handleSpawnFrame, handleAddFrame, handleCreateFigure, 
    handleGroupSelection, onNodeContextMenu, onPaneContextMenu, onNodeDoubleClick, onPaneDoubleClick 
  } = useContextMenu({
    rfInstance, reactFlowWrapperRef, nodes, edges, setNodes, setEdges, pushHistory,
    handleUpdateNode, defaultNodeData, toolColors, toolIcon, theme, edgeType,
    stampedTemplate, setStampedTemplate, setShowMobileProps,
  });

  const { handleUpdateDiagram, handleAskAI, isGenerating } = useAIDiagram({
    nodes, edges, setNodes, setEdges, pushHistory, rfInstance, theme, edgeType, defaultNodeData,
  });

  const { handleAutoLayout } = useAutoLayout({
    nodes, edges, setNodes, rfInstance, pushHistory,
  });

  const handleReset = useCallback(() => {
    if (nodes.length === 0 && edges.length === 0) return;
    pushHistory(nodes, edges);
    setNodes([]);
    setEdges([]);
  }, [nodes, edges, pushHistory, setNodes, setEdges]);

  const handleChangeOrder = useCallback((action: "backward" | "forward" | "back" | "front") => {
    const selectedIds = new Set(nodes.filter(n => n.selected).map(n => n.id));
    if (selectedIds.size === 0) return;
    pushHistory(nodes, edges);
    
    if (action === "front") {
      setNodes(ns => [...ns.filter(n => !selectedIds.has(n.id)), ...ns.filter(n => selectedIds.has(n.id))]);
    } else if (action === "back") {
      setNodes(ns => [...ns.filter(n => n.type === "frame" && !selectedIds.has(n.id)), ...ns.filter(n => n.type === "frame" && selectedIds.has(n.id)), ...ns.filter(n => n.type !== "frame" && selectedIds.has(n.id)), ...ns.filter(n => n.type !== "frame" && !selectedIds.has(n.id))]);
    } else if (action === "forward") {
      setNodes(ns => {
        const next = [...ns];
        for (let i = next.length - 2; i >= 0; i--) {
          if (next[i].selected && !next[i + 1].selected) {
            [next[i], next[i + 1]] = [next[i + 1], next[i]];
          }
        }
        return next;
      });
    } else if (action === "backward") {
      setNodes(ns => {
        const next = [...ns];
        for (let i = 1; i < next.length; i++) {
          if (next[i].selected && !next[i - 1].selected) {
            [next[i], next[i - 1]] = [next[i - 1], next[i]];
          }
        }
        return next;
      });
    }
  }, [nodes, edges, setNodes, pushHistory]);

  const handleAddComment = useCallback(() => {
    alert("Comment feature: click anywhere to add a sticky note comment.");
  }, []);

  // ── Keyboard Shortcuts ───────────────────────────────────
  useKeyboardShortcuts({
    handleUndo, handleRedo, handleCut, handleCopy, handlePaste, handleDuplicate, handleSelectAll,
    handleChangeOrder, handleAddComment, handleGroupSelection, handleCreateFigure,
    activePanel, setActivePanel, rfInstance, handleReset, handleDeleteSelected, handleAutoLayout, spawnNode,
    diagramId, diagramName, nodes, edges, updateDiagram, getDiagram, setIsSaving, setIsDirty, rtc,
  });

  // ── Escape Key for Stamped Template ──────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setStampedTemplate(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // ── Derived State ────────────────────────────────────────
  const selectedNodes = nodes.filter((n) => n.selected);
  const selectedEdges = edges.filter((e) => e.selected);

  const defaultEdgeOptions = useMemo(() => ({
    style: { stroke: theme.accent, strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: theme.accent },
    selectable: true,
    type: edgeType,
    reconnectable: true,
  }), [theme.accent, edgeType]);

  const updateEditingEdgeId = useCallback((newId: string | null) => {
    setEditingEdgeId(newId);
    setEdges((eds) => eds.map((e) => ({ ...e })));
  }, [setEdges]);

  const onEdgeDoubleClick = useCallback((evt: React.MouseEvent, edge: Edge) => {
    evt.stopPropagation();
    updateEditingEdgeId(edge.id);
  }, [updateEditingEdgeId]);

  const handleSave = useCallback(() => {
    if (diagramId) {
      setIsSaving(true);
      getDiagram(diagramId).then(async (d) => {
        if (!d) { setIsSaving(false); return; }
        await updateDiagram({ ...d, name: diagramName, nodes, edges });
        setIsSaving(false);
        setIsDirty(false);
        rtc.sendNodes(nodes, edges);
      });
    }
  }, [diagramId, getDiagram, updateDiagram, diagramName, nodes, edges, setIsSaving, setIsDirty, rtc]);

  // ── Render Gates ─────────────────────────────────────────
  if (!loaded) {
    return (
      <div className="flex items-center justify-center h-full" style={{ background: theme.canvas }}>
        <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: `${theme.accent}33`, borderTopColor: theme.accent }} />
      </div>
    );
  }

  const isPro = user?.subscriptionStatus === "active";
  const trialExpired = user ? (Date.now() - user.createdAt > 24 * 60 * 60 * 1000) : false;

  if (loaded && !isPro && trialExpired) {
    return (
      <div className="fixed inset-0 flex items-center justify-center p-4 z-[9999] backdrop-blur-lg" style={{ background: "rgba(5, 5, 20, 0.85)" }}>
        <div className="max-w-md w-full p-8 rounded-3xl border text-center relative overflow-hidden" style={{ background: "rgba(15, 15, 35, 0.95)", borderColor: "rgba(255,255,255,0.08)", boxShadow: "0 20px 50px rgba(0,0,0,0.5)" }}>
          <div className="absolute -top-20 -left-20 w-40 h-40 rounded-full blur-3xl pointer-events-none" style={{ backgroundColor: `${theme.accent}33` }} />
          <div className="absolute -bottom-20 -right-20 w-40 h-40 rounded-full blur-3xl pointer-events-none" style={{ backgroundColor: `${theme.accent}33` }} />
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl" style={{ background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}cc)`, boxShadow: `0 20px 25px -5px ${theme.accent}33` }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-foreground">
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h2 className="text-white font-bold text-2xl mb-3" style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}>Free Trial Expired</h2>
          <p className="text-white/60 text-sm mb-8 leading-relaxed">Your 24-hour free trial has ended. Upgrade to Pro to unlock editing, unlimited diagrams, and AI-powered builders.</p>
          <div className="flex flex-col gap-3">
            <button onClick={() => navigate("/pricing")} className="w-full py-3.5 rounded-xl text-primary-foreground text-sm font-semibold shadow-lg transition-transform hover:scale-[1.02]" style={{ background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}cc)`, boxShadow: `0 10px 15px -3px ${theme.accent}40` }}>Upgrade to Pro</button>
            <button onClick={() => navigate("/dashboard")} className="w-full py-3.5 rounded-xl text-white/50 text-sm font-medium hover:text-white transition-colors">Back to Dashboard</button>
          </div>
        </div>
      </div>
    );
  }

  // ── Main Render ──────────────────────────────────────────
  return (
    <div className="flex flex-col relative" style={{ height: "100vh", zIndex: 1 }} data-canvas-theme={theme.id}>
      <div className="relative z-20">
        <EditorToolbar
          rfInstance={rfInstance}
          canUndo={canUndo}
          canRedo={canRedo}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onExport={handleExport}
          onOpenWebRTC={() => setShowWebRTC(true)}
          webrtcStatus={rtc.status}
          onReset={handleReset}
        />
      </div>

      <div ref={reactFlowWrapperRef} className="flex-1 relative overflow-hidden" onClick={handleCloseMenu}>
        {stampedTemplate && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2.5 rounded-full flex items-center gap-3 border shadow-2xl z-50 animate-in slide-in-from-top duration-300" style={{ background: theme.panel, borderColor: theme.accent, backdropFilter: "blur(12px)" }}>
            <div className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: theme.accent }} />
            <span style={{ color: theme.textPrimary, fontWeight: 500, fontSize: "11px" }}>
              Stamp Mode: Click canvas to place <strong>{stampedTemplate.title}</strong>
            </span>
            <span style={{ color: theme.textMuted, fontSize: "10px" }}>(Press ESC to exit)</span>
            <button onClick={(e) => { e.stopPropagation(); setStampedTemplate(null); }} className="ml-1 px-2.5 py-1 rounded-full text-xs font-semibold transition-all" style={{ background: "rgba(239, 68, 68, 0.1)", color: "#f87171", border: "none", cursor: "pointer" }}>Cancel</button>
          </div>
        )}

        <EdgeEditContext.Provider value={{ editingEdgeId, setEditingEdgeId: updateEditingEdgeId }}>
          <ReactFlow
            nodes={nodesWithZIndex}
            edges={edgesWithVisibility}
            onNodesChange={handleNodesChange}
            onNodeDragStop={onNodeDragStop}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onReconnect={onEdgeUpdate}
            onReconnectStart={onReconnectStart}
            onReconnectEnd={onReconnectEnd}
            edgesReconnectable={true}
            connectionMode={ConnectionMode.Loose}
            reconnectRadius={20}
            onInit={setRfInstance}
            nodeTypes={NODE_TYPES}
            edgeTypes={EDGE_TYPES}
            connectionLineComponent={CustomConnectionLine}
            onDoubleClick={onPaneDoubleClick}
            onPaneContextMenu={onPaneContextMenu}
            onNodeContextMenu={onNodeContextMenu}
            onNodeDoubleClick={onNodeDoubleClick}
            onEdgeDoubleClick={onEdgeDoubleClick}
            onPaneClick={handlePaneClick}
            fitView
            fitViewOptions={fitViewOptions}
            deleteKeyCode="Delete"
            multiSelectionKeyCode="Shift"
            style={{ background: theme.canvas }}
            defaultEdgeOptions={defaultEdgeOptions}
          >
            <Background variant={BackgroundVariant.Dots} color={theme.dot} gap={24} size={1.5} />
            <Controls style={{ bottom: 20, left: 80 }} />
            
            {isTouchDevice && (
              <Panel position="bottom-center" style={{ marginBottom: 20 }} className="nodrag nopan">
                <TouchDock
                  canUndo={canUndo}
                  canRedo={canRedo}
                  onUndo={handleUndo}
                  onRedo={handleRedo}
                  spawnNode={spawnNode}
                  rfInstance={rfInstance}
                  handleAutoLayout={handleAutoLayout}
                  selectedNodes={selectedNodes}
                  handleDeleteSelected={handleDeleteSelected}
                  handleSave={handleSave}
                />
              </Panel>
            )}

            <MiniMap
              nodeColor={(n) => (n.data as unknown as CustomNodeData)?.bgColor ?? theme.nodeBg}
              maskColor={theme.minimapMask}
              style={{
                background: theme.minimap,
                border: `1px solid ${theme.border}`,
                borderRadius: 12,
                bottom: 20,
                right: (() => {
                  const hasSelection = selectedNodes.length > 0 || selectedEdges.length > 0;
                  const hasFramePanel = !!activeFrameId && (activeFrameMode === "ai" || activeFrameMode === "dsl");
                  if (!hasSelection && !hasFramePanel) return 20;
                  if (hasFramePanel) return 470;
                  return 300;
                })(),
                transition: "right 0.3s ease-in-out",
              }}
            />
            
            <Panel position="bottom-right">
              <button
                onClick={() => setShowMobileProps(!showMobileProps)}
                className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl border transition-all"
                style={{
                  background: theme.panel,
                  borderColor: showMobileProps ? theme.accent : theme.border,
                  color: showMobileProps ? theme.accent : theme.textMuted,
                }}
              >
                {showMobileProps ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
              </button>
            </Panel>

            {nodes.length === 0 && (
              <Panel position="top-center">
                <div className="mt-6 px-5 py-2.5 rounded-xl border text-sm" style={{ borderColor: theme.border, background: theme.surfaceHover, color: theme.textMuted }}>
                  Double-click anywhere to add a node · Use the left panel for more shapes & tools
                </div>
              </Panel>
            )}

            <Panel position="top-left" style={{ marginLeft: 64, marginTop: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px", borderRadius: 10, border: `1px solid ${theme.border}`, background: theme.panel, backdropFilter: "blur(10px)", boxShadow: "0 2px 8px rgba(0,0,0,0.18)" }}>
                {(["default", "step"] as const).map((type) => {
                  const isActive = edgeType === type;
                  const label = type === "default" ? "Curved" : "Step";
                  const icon = type === "default" ? (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M2 13 C4 13, 5 3, 8 8 S12 3, 14 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" fill="none"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M2 13 H8 V3 H14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                    </svg>
                  );
                  return (
                    <button
                      key={type}
                      title={`${label} edge`}
                      onClick={() => handleEdgeTypeChange(type)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                        padding: "4px 10px",
                        borderRadius: 7,
                        border: "none",
                        cursor: "pointer",
                        fontSize: 12,
                        fontWeight: 500,
                        fontFamily: "Inter, sans-serif",
                        transition: "all 0.15s",
                        background: isActive ? theme.accent : "transparent",
                        color: isActive ? "var(--primary-foreground)" : theme.textMuted,
                        boxShadow: isActive ? `0 1px 4px ${theme.accent}66` : "none",
                      }}
                    >
                      {icon}
                      {label}
                    </button>
                  );
                })}
              </div>
            </Panel>
          </ReactFlow>
        </EdgeEditContext.Provider>

        {/* Left tools panel */}
        <ToolsPanel
          selectedShape={selectedShape}
          colors={toolColors}
          iconName={toolIcon}
          onShapeChange={setSelectedShape}
          onAddNode={(s) => spawnNode(s)}
          onColorChange={(f, v) => {
            setToolColors((c) => ({ ...c, [f]: v }));
            selectedNodes.forEach((n) => handleUpdateNode(n.id, { [f]: v }));
          }}
          onIconChange={(name) => {
            setToolIcon(name);
            selectedNodes.forEach((n) => handleUpdateNode(n.id, { iconName: name }));
          }}
          onAIGenerate={handleUpdateDiagram}
          onAddFrame={handleAddFrame}
          currentNodes={nodes}
          currentEdges={edges}
          selectedNodeId={selectedNodes.length === 1 ? selectedNodes[0].id : null}
        />

        {/* Right properties panel - desktop */}
        {(() => {
          const hasSelection = selectedNodes.length > 0 || selectedEdges.length > 0;
          const hasFramePanel = !!activeFrameId && (activeFrameMode === "ai" || activeFrameMode === "dsl");
          const isExpanded = hasSelection || hasFramePanel;
          const panelWidth = !isExpanded ? 0 : hasFramePanel ? 450 : 288;

          return (
            <div
              className="hidden md:flex absolute right-0 top-0 bottom-0 overflow-hidden flex-col transition-all duration-300 ease-in-out"
              style={{
                width: panelWidth,
                opacity: isExpanded ? 1 : 0,
                pointerEvents: isExpanded ? "auto" : "none",
                background: theme.panel,
                borderLeft: isExpanded ? `1px solid ${theme.border}` : "none",
                backdropFilter: "blur(12px)",
                zIndex: 10,
              }}
            >
              <div style={{ minWidth: 288, height: "100%" }}>
                {activeFrameId && activeFrameMode === "ai" ? (
                  <ScopedAIChatPanel
                    frameId={activeFrameId}
                    onClose={() => setActiveFrameMode("diagram")}
                  />
                ) : activeFrameId && activeFrameMode === "dsl" ? (
                  <ScopedCodeEditorPanel
                    frameId={activeFrameId}
                    onClose={() => setActiveFrameMode("diagram")}
                  />
                ) : (
                  <PropertiesPanel
                    selectedNodes={selectedNodes}
                    selectedEdges={selectedEdges}
                    onUpdateNode={handleUpdateNode}
                    onUpdateEdge={(id, data) => setEdges((es) => es.map((e) => (e.id === id ? { ...e, ...data } : e)))}
                    onDeleteSelected={handleDeleteSelected}
                    allNodes={nodes}
                  />
                )}
              </div>
            </div>
          );
        })()}

        {/* Right properties panel - mobile slide */}
        <AnimatePresence>
          {showMobileProps && (
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="md:hidden absolute right-0 top-0 bottom-0 w-[85vw] sm:w-[400px] overflow-hidden flex flex-col"
              style={{
                background: theme.panel,
                borderLeft: `1px solid ${theme.border}`,
                backdropFilter: "blur(12px)",
                zIndex: 50,
              }}
            >
              {activeFrameId && activeFrameMode === "ai" ? (
                <ScopedAIChatPanel
                  frameId={activeFrameId}
                  onClose={() => {
                    setActiveFrameMode("diagram");
                    setShowMobileProps(false);
                  }}
                />
              ) : activeFrameId && activeFrameMode === "dsl" ? (
                <ScopedCodeEditorPanel
                  frameId={activeFrameId}
                  onClose={() => {
                    setActiveFrameMode("diagram");
                    setShowMobileProps(false);
                  }}
                />
              ) : (
                <>
                  <div className="p-3 border-b flex items-center justify-between" style={{ borderColor: theme.border }}>
                    <span className="text-sm font-semibold" style={{ color: theme.textPrimary, fontFamily: "Plus Jakarta Sans, sans-serif" }}>
                      Properties
                    </span>
                    <button
                      onClick={() => setShowMobileProps(false)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors"
                      style={{ color: theme.textMuted }}
                    >
                      <PanelRightClose className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <PropertiesPanel
                      selectedNodes={selectedNodes}
                      selectedEdges={selectedEdges}
                      onUpdateNode={handleUpdateNode}
                      onUpdateEdge={(id, data) => setEdges((es) => es.map((e) => (e.id === id ? { ...e, ...data } : e)))}
                      onDeleteSelected={handleDeleteSelected}
                      allNodes={nodes}
                    />
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Context Menu */}
        {menuState.isOpen && (
          <CanvasContextMenu
            x={menuState.x}
            y={menuState.y}
            nodeId={menuState.nodeId}
            nodeLabel={menuState.nodeLabel}
            nodeShape={menuState.nodeShape}
            nodeBgColor={menuState.nodeBgColor}
            isFrame={menuState.isFrame}
            onClose={handleCloseMenu}
            onRenameNode={handleRenameNode}
            onChangeNodeShape={handleChangeNodeShape}
            onChangeNodeColor={handleChangeNodeColor}
            onDeleteNode={handleDeleteNode}
            onSpawnNode={handleSpawnNode}
            onSpawnFrame={handleSpawnFrame}
            onAskAI={handleAskAI}
            aiLoading={isGenerating}
            onCut={handleCut}
            onCopy={handleCopy}
            onPaste={handlePaste}
            onDuplicate={handleDuplicate}
            onSelectAll={handleSelectAll}
            onChangeOrder={handleChangeOrder}
            onCopyAsPNG={handleCopyAsPNG}
            onCopyAsSVG={handleCopyAsSVG}
            onCopyLink={handleCopyLink}
            onCopyMarkdown={handleCopyMarkdown}
            onCopyHTML={handleCopyHTML}
            onCopyStyles={handleCopyStyles}
            onPasteStyles={handlePasteStyles}
            onAddComment={handleAddComment}
            onCreateFigure={handleCreateFigure}
            onGroupSelection={handleGroupSelection}
          />
        )}
      </div>

      {showWebRTC && <WebRTCModal rtc={rtc} onClose={() => setShowWebRTC(false)} />}
    </div>
  );
}