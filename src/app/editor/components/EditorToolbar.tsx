"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useRouter } from "next/navigation";
import {
  GitBranch, ChevronLeft, Undo2, Redo2, ZoomIn, ZoomOut, Maximize2,
  Download, Users, Check, Loader2, Wifi, Palette, ChevronDown,
  RotateCcw, Menu
} from "lucide-react";
import { type ReactFlowInstance } from "@xyflow/react";
import { useEditorStore } from "../../stores/editorStore";
import { type RTCStatus } from "../hooks/useWebRTC";
import { useEditorTheme, CANVAS_THEMES } from "../context/EditorThemeContext";

interface EditorToolbarProps {
  rfInstance: ReactFlowInstance | null;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onExport: (format: "png" | "jpg" | "pdf" | "mermaid") => void;
  onOpenWebRTC: () => void;
  webrtcStatus: RTCStatus;
  onReset: () => void;
}

export function EditorToolbar({
  rfInstance, canUndo, canRedo, onUndo, onRedo,
  onExport, onOpenWebRTC, webrtcStatus, onReset,
}: EditorToolbarProps) {
  const router = useRouter();
  const navigate = (path: string) => router.push(path);
  const diagramName = useEditorStore((s) => s.diagramName);
  const setDiagramName = useEditorStore((s) => s.setDiagramName);
  const isSaving = useEditorStore((s) => s.isSaving);
  const { theme, themeId, setThemeId } = useEditorTheme();
  const isLight = themeId === "light";

  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(diagramName);
  const [exportOpen, setExportOpen] = useState(false);
  const [canvasMenuOpen, setCanvasMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);

  const closeAll = () => {
    setExportOpen(false);
    setCanvasMenuOpen(false);
    setMobileMenuOpen(false);
    setShowThemeMenu(false);
  };

  const commitName = () => {
    if (nameValue.trim()) setDiagramName(nameValue.trim());
    setEditingName(false);
  };

  const btnCls = `h-8 px-3 rounded-lg flex items-center gap-1.5 text-sm transition-colors disabled:opacity-30 disabled:cursor-not-allowed`
    + ` ${isLight ? "text-gray-500 hover:text-gray-900 hover:bg-black/5" : "text-white/50 hover:text-white hover:bg-white/8"}`;
  const iconBtnCls = `w-8 h-8 rounded-lg flex items-center justify-center transition-colors disabled:opacity-30`
    + ` ${isLight ? "text-gray-500 hover:text-gray-900 hover:bg-black/5" : "text-white/50 hover:text-white hover:bg-white/8"}`;

  const isConnected = webrtcStatus === "connected";

  const dropdownCls = `absolute rounded-xl border py-1 z-30 shadow-2xl`;
  const dropdownStyle = { background: theme.panel, borderColor: theme.border } as React.CSSProperties;
  const dropItemCls = `w-full text-left px-3 py-2 text-sm transition-colors`
    + ` ${isLight ? "text-gray-500 hover:text-gray-900 hover:bg-black/5" : "text-white/60 hover:text-white hover:bg-white/6"}`;

  return (
    <header
      className="h-12 border-b flex items-center justify-between px-3 gap-2 flex-shrink-0 @container"
      style={{ background: theme.toolbar, borderColor: theme.border, backdropFilter: "blur(12px)" }}
    >
      {/* Left */}
      <div className="flex items-center gap-1.5 min-w-0">
        <button onClick={() => navigate("/dashboard")} className={iconBtnCls} title="Back to dashboard">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="w-px h-5" style={{ background: theme.border }} />
        <button
          onClick={() => navigate("/")}
          className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 transition-opacity hover:opacity-80"
          style={{ background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}cc)` }}
          title="Go to home"
        >
          <GitBranch className="w-3 h-3 text-white" />
        </button>
        {editingName ? (
          <input
            autoFocus
            value={nameValue}
            onChange={(e) => setNameValue(e.target.value)}
            onBlur={commitName}
            onKeyDown={(e) => { if (e.key === "Enter") commitName(); if (e.key === "Escape") setEditingName(false); }}
            className="bg-transparent border-b outline-none px-1 text-sm min-w-32"
            style={{ color: theme.textPrimary, borderColor: theme.accent, fontWeight: 600 }}
          />
        ) : (
          <button
            onClick={() => { setNameValue(diagramName); setEditingName(true); }}
            className="text-sm transition-colors truncate max-w-40 @[420px]:max-w-60"
            style={{ color: theme.textPrimary, fontWeight: 600 }}
            onMouseEnter={(e) => (e.currentTarget.style.color = theme.accent)}
            onMouseLeave={(e) => (e.currentTarget.style.color = theme.textPrimary)}
          >
            {diagramName}
          </button>
        )}
        <span className="hidden @[280px]:inline-flex">
        {isSaving ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: theme.textMuted }} />
        ) : (
          <span title="Saved"><Check className="w-3.5 h-3.5" style={{ color: theme.accent + "aa" }} /></span>
        )}
        </span>
      </div>

      {/* Center */}
      <div className="flex items-center gap-1">
        <button onClick={onUndo} disabled={!canUndo} className={iconBtnCls} title="Undo">
          <Undo2 className="w-3.5 h-3.5" />
        </button>
        <button onClick={onRedo} disabled={!canRedo} className={iconBtnCls} title="Redo">
          <Redo2 className="w-3.5 h-3.5" />
        </button>

        <span className="hidden @[400px]:inline-flex items-center gap-1">
          <div className="w-px h-5 mx-1" style={{ background: theme.border }} />

          <button onClick={() => rfInstance?.zoomIn()} className={iconBtnCls} title="Zoom in">
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => rfInstance?.zoomOut()} className={iconBtnCls} title="Zoom out">
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => rfInstance?.fitView({ padding: 0.1 })} className={iconBtnCls} title="Fit view">
            <Maximize2 className="w-3.5 h-3.5" />
          </button>

          <div className="w-px h-5 mx-1" style={{ background: theme.border }} />

          <button onClick={onReset} className={iconBtnCls} title="Reset Diagram">
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </span>

        {/* Canvas Options Dropdown for mobile */}
        <div className="inline-flex @[400px]:hidden relative">
          <button
            onClick={() => setCanvasMenuOpen(!canvasMenuOpen)}
            className={iconBtnCls}
            title="Canvas Options"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
          <AnimatePresence>
            {canvasMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.97 }}
                transition={{ duration: 0.12 }}
                className={`${dropdownCls} top-10 left-1/2 -translate-x-1/2 min-w-40`}
                style={dropdownStyle}
              >
                <button
                  onClick={() => { rfInstance?.zoomIn(); setCanvasMenuOpen(false); }}
                  className={dropItemCls}
                >
                  <div className="flex items-center gap-2">
                    <ZoomIn className="w-4 h-4" />
                    <span>Zoom In</span>
                  </div>
                </button>
                <button
                  onClick={() => { rfInstance?.zoomOut(); setCanvasMenuOpen(false); }}
                  className={dropItemCls}
                >
                  <div className="flex items-center gap-2">
                    <ZoomOut className="w-4 h-4" />
                    <span>Zoom Out</span>
                  </div>
                </button>
                <button
                  onClick={() => { rfInstance?.fitView({ padding: 0.1 }); setCanvasMenuOpen(false); }}
                  className={dropItemCls}
                >
                  <div className="flex items-center gap-2">
                    <Maximize2 className="w-4 h-4" />
                    <span>Fit View</span>
                  </div>
                </button>
                <div className="h-px my-1" style={{ background: theme.border }} />
                <button
                  onClick={() => { onReset(); setCanvasMenuOpen(false); }}
                  className={dropItemCls}
                >
                  <div className="flex items-center gap-2 text-red-400">
                    <RotateCcw className="w-4 h-4" />
                    <span>Reset Diagram</span>
                  </div>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1.5">
        {/* Color Theme Selector Dropdown */}
        <div className="relative">
          <motion.button
            onClick={() => setShowThemeMenu(!showThemeMenu)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`h-8 px-2.5 rounded-lg flex items-center gap-1.5 transition-colors ${
              isLight
                ? "text-gray-500 hover:text-gray-900 hover:bg-black/5"
                : "text-white/50 hover:text-white hover:bg-white/8"
            }`}
            title="Choose canvas color theme"
          >
            <Palette className="w-4.5 h-4.5" />
            <ChevronDown className="w-3 h-3 opacity-60" />
          </motion.button>

          {showThemeMenu && (
            <>
              <div className="fixed inset-0 z-45" onClick={() => setShowThemeMenu(false)} />
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute right-0 mt-1.5 w-40 rounded-xl border p-1.5 shadow-xl z-50 backdrop-blur-lg"
                style={dropdownStyle}
              >
                {Object.values(CANVAS_THEMES).map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setThemeId(t.id);
                      setShowThemeMenu(false);
                    }}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs transition-colors text-left ${
                      themeId === t.id
                        ? !isLight
                          ? "bg-white/10 text-white font-medium"
                          : "bg-black/5 text-black font-medium"
                        : !isLight
                        ? "text-white/60 hover:text-white hover:bg-white/5"
                        : "text-gray-600 hover:text-gray-900 hover:bg-black/5"
                    }`}
                  >
                    <span
                      className="w-3 h-3 rounded-full border border-black/10 dark:border-white/10"
                      style={{ backgroundColor: t.swatch }}
                    />
                    {t.label}
                  </button>
                ))}
              </motion.div>
            </>
          )}
        </div>

        {/* Desktop Controls (hidden on mobile) */}
        <div className="hidden md:flex items-center gap-1.5">
          {/* (Playback controls removed) */}

          {/* WebRTC */}
          <span className="hidden @[460px]:inline-flex">
            <button
              onClick={onOpenWebRTC}
              className={`${btnCls} ${isConnected ? "border" : ""}`}
              style={isConnected ? { color: "#34d399", background: "rgba(52,211,153,0.08)", borderColor: "rgba(52,211,153,0.25)" } : {}}
              title="Collaborate P2P"
            >
              {isConnected ? <Wifi className="w-3.5 h-3.5" /> : <Users className="w-3.5 h-3.5" />}
              <span className="hidden @[520px]:inline">{isConnected ? "Live" : "Collaborate"}</span>
            </button>
          </span>

          {/* Export */}
          <div
            className="relative"
            onMouseEnter={() => setExportOpen(true)}
            onMouseLeave={() => setExportOpen(false)}
          >
            <button onClick={() => setExportOpen(!exportOpen)} className={btnCls}>
              <Download className="w-3.5 h-3.5" />
              <span className="hidden @[380px]:inline">Export</span>
            </button>
            <AnimatePresence>
              {exportOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.97 }}
                  transition={{ duration: 0.12 }}
                  className={`${dropdownCls} top-10 right-0 min-w-48`}
                  style={dropdownStyle}
                >
                  <p className="px-3 pt-2 pb-1 text-[0.65rem] font-semibold" style={{ color: theme.textMuted }}>Export as</p>
                  {(["png", "jpg", "pdf", "mermaid"] as const).map((fmt) => {
                    const labels: Record<string, string> = {
                      png: "PNG — high-res image",
                      jpg: "JPG — compressed image",
                      pdf: "PDF — print ready",
                      mermaid: "Mermaid — text diagram",
                    };
                    return (
                      <button key={fmt} onClick={() => { onExport(fmt); closeAll(); }} className={dropItemCls}>
                        {labels[fmt]}
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Mobile Actions Menu (Hamburger) - visible on mobile only */}
        <div className="flex md:hidden relative">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`${iconBtnCls} ${mobileMenuOpen ? "border" : ""}`}
            style={mobileMenuOpen ? { borderColor: theme.accent + "55" } : {}}
            title="More actions"
          >
            <Menu className="w-4 h-4" />
          </button>
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.97 }}
                transition={{ duration: 0.12 }}
                className={`${dropdownCls} top-10 right-0 min-w-48`}
                style={dropdownStyle}
              >
                {/* (Playback trigger removed) */}

                {/* Collaborate Trigger */}
                <div className="h-px my-1" style={{ background: theme.border }} />
                <div className="px-3 pt-1 pb-1 text-[0.65rem] font-semibold uppercase tracking-wider" style={{ color: theme.textMuted }}>Collaboration</div>
                <button
                  onClick={() => {
                    onOpenWebRTC();
                    closeAll();
                  }}
                  className={dropItemCls}
                >
                  <div className="flex items-center gap-2">
                    {isConnected ? <Wifi className="w-4 h-4 text-green-400" /> : <Users className="w-4 h-4" />}
                    <span>{isConnected ? "Collaborate (Live)" : "Collaborate P2P"}</span>
                  </div>
                </button>

                {/* Export Options */}
                <div className="h-px my-1" style={{ background: theme.border }} />
                <div className="px-3 pt-1 pb-1 text-[0.65rem] font-semibold uppercase tracking-wider" style={{ color: theme.textMuted }}>Export Diagram</div>
                {(["png", "jpg", "pdf", "mermaid"] as const).map((fmt) => {
                  const labels: Record<string, string> = {
                    png: "Export as PNG",
                    jpg: "Export as JPG",
                    pdf: "Export as PDF",
                    mermaid: "Export as Mermaid",
                  };
                  return (
                    <button
                      key={fmt}
                      onClick={() => {
                        onExport(fmt);
                        closeAll();
                      }}
                      className={dropItemCls}
                    >
                      {labels[fmt]}
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}