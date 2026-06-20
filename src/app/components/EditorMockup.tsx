"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { 
  GitBranch, 
  MousePointer, 
  Plus, 
  Type, 
  Grid3X3, 
  ChevronDown, 
  Share2, 
  Layers, 
  Maximize2 
} from "lucide-react";

export function EditorMockup() {
  const { isDark, theme } = useTheme();
  const [hoveredPanel, setHoveredPanel] = useState<string | null>(null);

  // Floating animation settings for panels
  const floatAnim = (delay = 0, duration = 6) => ({
    animate: {
      y: [0, -8, 0],
    },
    transition: {
      duration: duration,
      repeat: Infinity,
      ease: "easeInOut" as const,
      delay: delay,
    }
  });

  // Theme-dependent styles
  const mainBg = isDark 
    ? "bg-card border-border shadow-[0_20px_50px_rgba(0,0,0,0.5)]" 
    : "bg-card border-border shadow-[0_20px_45px_rgba(15,23,42,0.08)]";
  const headerBg = isDark ? "bg-muted/15 border-border" : "bg-slate-50/90 border-border";
  const logoText = "text-foreground";
  const titleClass = "text-foreground/80 hover:bg-foreground/5";
  const avatarBorder = "border-card";
  const canvasBg = "bg-background";
  const gridColor = `${theme.accent}${isDark ? "26" : "0a"}`;
  
  // Connection line colors
  const strokeBlue = isDark ? "rgba(96, 165, 250, 0.4)" : "rgba(59, 130, 246, 0.5)";
  const strokePurple = isDark ? `${theme.accent}66` : `${theme.accent}80`;
  const strokeEmerald = isDark ? "rgba(52, 211, 153, 0.4)" : "rgba(16, 185, 129, 0.5)";
  const strokeAmber = isDark ? "rgba(245, 158, 11, 0.4)" : "rgba(217, 119, 6, 0.5)";

  const arrowBlue = isDark ? "#60a5fa" : "#3b82f6";
  const arrowPurple = theme.accent;
  const arrowEmerald = isDark ? "#34d399" : "#10b981";

  // Sidebar styles
  const sidebarClass = "bg-card/90 border-border text-foreground/70 shadow-md";
  const sidebarActiveIcon = isDark
    ? "bg-primary/20 text-primary border-primary/20"
    : "bg-primary/5 text-primary border-primary/10";
  const sidebarHoverIcon = "hover:bg-foreground/5 hover:text-foreground";

  // Node styles
  const nodeAmber = isDark
    ? "border-amber-500/30 bg-amber-500/8 text-amber-300 hover:border-amber-400"
    : "border-amber-400 bg-amber-50/90 text-amber-900 hover:border-amber-500 hover:bg-amber-100/60";
  const nodeBlue = isDark
    ? "border-blue-500/30 bg-blue-500/8 text-blue-300 hover:border-blue-400"
    : "border-blue-400 bg-blue-50/90 text-blue-900 hover:border-blue-500 hover:bg-blue-100/60";
  const nodePurple = isDark
    ? "border-primary/30 bg-primary/8 text-primary hover:border-primary"
    : "border-primary/40 bg-primary/5 text-primary hover:border-primary hover:bg-primary/10";
  const nodeEmerald = isDark
    ? "border-emerald-500/30 bg-emerald-500/8 text-emerald-300 hover:border-emerald-400"
    : "border-emerald-400 bg-emerald-50/90 text-emerald-900 hover:border-emerald-500 hover:bg-emerald-100/60";

  // Overlapping panel styles
  const panelBg = "bg-card border-border text-foreground shadow-2xl";
  const panelHeader = "bg-muted/15 border-border";
  const panelTitle = "text-foreground/75";
  const panelCanvas = "bg-background/70";
  const panelNode = "bg-muted/40 border-border text-foreground/80 hover:border-primary/50";
  
  const panelNodeDirector = isDark
    ? "bg-muted border-emerald-500/40 text-emerald-300"
    : "bg-emerald-50 border-emerald-400 text-emerald-900";

  const panelLine = `${theme.accent}66`;
  const panelLineCyan = isDark ? "rgba(6, 182, 212, 0.4)" : "rgba(6, 182, 212, 0.35)";
  const panelLineEmerald = isDark ? "rgba(16, 185, 129, 0.4)" : "rgba(16, 185, 129, 0.35)";

  return (
    <div className="relative w-full max-w-5xl mx-auto mt-16 px-4 md:px-8">
      {/* Container to handle the overall layout and scale */}
      <div className={`relative aspect-[4/3] sm:aspect-[16/10] md:aspect-[16/9] w-full rounded-2xl p-1 md:p-2 border transition-all duration-300 overflow-visible ${
        isDark ? "bg-background/20 border-border/30 backdrop-blur-sm shadow-2xl" : "bg-slate-100/50 border-slate-200/50 backdrop-blur-sm"
      }`}>
        
        {/* ========================================================
            MAIN WINDOW (Project Diagram)
           ======================================================== */}
        <div 
          className={`relative w-full md:w-[85%] h-full md:h-[90%] left-0 md:left-[5%] top-0 md:top-[5%] border rounded-xl flex flex-col overflow-hidden transition-all duration-300 hover:shadow-primary/5 group ${mainBg}`}
          style={{ zIndex: hoveredPanel === "main" ? 30 : 10 }}
          onMouseEnter={() => setHoveredPanel("main")}
        >
          {/* Main Window Header */}
          <div className={`h-12 border-b px-4 flex items-center justify-between transition-colors ${headerBg}`}>
            {/* Window Controls & Logo */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 mr-2">
                <span className="w-3 h-3 rounded-full bg-red-500/70 inline-block" />
                <span className="w-3 h-3 rounded-full bg-yellow-500/70 inline-block" />
                <span className="w-3 h-3 rounded-full bg-green-500/70 inline-block" />
              </div>
              <div className="h-4 w-[1px] bg-white/10 mx-1 hidden sm:block" />
              <div
                className="w-6 h-6 rounded flex items-center justify-center shadow-lg"
                style={{ background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}cc)`, boxShadow: `0 10px 15px -3px ${theme.accent}33` }}
              >
                <GitBranch className="w-3.5 h-3.5 text-white" />
              </div>
            </div>

            {/* Dropdown Title */}
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${titleClass}`}>
              <span className={`text-xs font-semibold tracking-wide`} style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}>
                Project Diagram
              </span>
              <ChevronDown className="w-3.5 h-3.5 opacity-50" />
            </div>

            {/* Users & Share Button */}
            <div className="flex items-center gap-3">
              {/* Avatars */}
              <div className="flex -space-x-1.5 items-center">
                <div
                  className={`w-6 h-6 rounded-full border flex items-center justify-center text-[10px] font-bold text-white shadow-md ${avatarBorder}`}
                  style={{ backgroundColor: theme.accent }}
                >
                  JD
                </div>
                <div
                  className={`w-6 h-6 rounded-full border flex items-center justify-center text-[10px] font-bold text-white shadow-md ${avatarBorder}`}
                  style={{ backgroundColor: `${theme.accent}dd` }}
                >
                  AM
                </div>
                <div className={`w-6 h-6 rounded-full border bg-cyan-600 flex items-center justify-center text-[10px] font-bold text-white shadow-md ${avatarBorder}`}>
                  EL
                </div>
                <div className={`w-6 h-6 rounded-full border bg-emerald-600 flex items-center justify-center text-[10px] font-bold text-white shadow-md ${avatarBorder}`}>
                  +2
                </div>
              </div>

              {/* Share button */}
              <button
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-xs font-semibold transition-all shadow-md hover:opacity-90"
                style={{ background: theme.accent, boxShadow: `0 4px 6px -1px ${theme.accent}33` }}
              >
                <Share2 className="w-3 h-3" />
                <span className="hidden sm:inline">Share</span>
              </button>
            </div>
          </div>

          {/* Main Canvas Body */}
          <div className={`flex-1 relative p-4 overflow-hidden select-none transition-colors ${canvasBg}`}>
            {/* Grid Background */}
            <div 
              className="absolute inset-0 opacity-15 pointer-events-none" 
              style={{
                backgroundImage: `linear-gradient(${gridColor} 1px, transparent 1px), linear-gradient(90deg, ${gridColor} 1px, transparent 1px)`,
                backgroundSize: "30px 30px",
              }}
            />

            {/* Scaling diagram container for mobile responsiveness */}
            <div className="absolute inset-0 w-full h-full origin-center scale-[0.72] sm:scale-[0.88] md:scale-100 transition-all duration-300">
              {/* Canvas Nodes Flow (SVG lines first for rendering behind nodes) */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                <defs>
                  <marker id="arrow-blue" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                    <path d="M0,0 L0,6 L6,3 z" fill={arrowBlue} />
                  </marker>
                  <marker id="arrow-purple" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                    <path d="M0,0 L0,6 L6,3 z" fill={arrowPurple} />
                  </marker>
                  <marker id="arrow-emerald" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                    <path d="M0,0 L0,6 L6,3 z" fill={arrowEmerald} />
                  </marker>
                </defs>

                {/* Animated Connection Lines */}
                <line 
                  x1="45%" y1="18%" x2="25%" y2="45%" 
                  stroke={strokeBlue} strokeWidth="1.5" strokeDasharray="5 3"
                  className="animated" markerEnd="url(#arrow-blue)"
                />
                <line 
                  x1="45%" y1="18%" x2="50%" y2="45%" 
                  stroke={strokePurple} strokeWidth="1.5" strokeDasharray="5 3"
                  className="animated" markerEnd="url(#arrow-purple)"
                />
                <line 
                  x1="45%" y1="18%" x2="75%" y2="45%" 
                  stroke={strokeEmerald} strokeWidth="1.5" strokeDasharray="5 3"
                  className="animated" markerEnd="url(#arrow-emerald)"
                />
                <line 
                  x1="22%" y1="52%" x2="31.5%" y2="72%" 
                  stroke={strokeAmber} strokeWidth="1.5" strokeDasharray="5 3"
                  className="animated"
                />
                <line 
                  x1="50%" y1="52%" x2="56%" y2="72%" 
                  stroke={strokeBlue} strokeWidth="1.5" strokeDasharray="5 3"
                  className="animated"
                />
              </svg>

              {/* Sidebar Floating Toolbar */}
              <div className={`hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 border rounded-xl p-1.5 flex-col gap-2 shadow-xl backdrop-blur-md z-10 transition-colors ${sidebarClass}`}>
                <div className={`p-2 rounded cursor-pointer ${sidebarActiveIcon}`}>
                  <MousePointer className="w-4 h-4" />
                </div>
                <div className={`p-2 rounded transition-colors cursor-pointer ${sidebarHoverIcon}`}>
                  <Plus className="w-4 h-4" />
                </div>
                <div className={`p-2 rounded transition-colors cursor-pointer ${sidebarHoverIcon}`}>
                  <GitBranch className="w-4 h-4" />
                </div>
                <div className={`p-2 rounded transition-colors cursor-pointer ${sidebarHoverIcon}`}>
                  <Type className="w-4 h-4" />
                </div>
                <div className={`p-2 rounded transition-colors cursor-pointer ${sidebarHoverIcon}`}>
                  <Grid3X3 className="w-4 h-4" />
                </div>
              </div>

              {/* Nodes Wrapper */}
              <div className="absolute inset-0 w-full h-full pointer-events-none z-10">
                
                {/* TOP NODE: Project Goal */}
                <div 
                  className={`absolute left-[33%] md:left-[38%] top-[8%] w-[34%] sm:w-[24%] border rounded-lg p-2.5 flex items-center gap-2 shadow-lg pointer-events-auto transition-all cursor-pointer ${nodeAmber}`}
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  <div className="w-5 h-5 rounded bg-amber-500/20 flex items-center justify-center text-[10px]">🎯</div>
                  <div className="flex flex-col">
                    <span className="text-[10px] md:text-xs font-semibold leading-tight">Project Goal</span>
                    <span className="text-[8px] opacity-65 leading-none">System Delivery</span>
                  </div>
                </div>

                {/* MIDDLE NODE LEFT: Research */}
                <div 
                  className={`absolute left-[13%] top-[40%] w-[25%] sm:w-[18%] border rounded-lg p-2 flex items-center gap-2 shadow-lg pointer-events-auto transition-all cursor-pointer ${nodeBlue}`}
                >
                  <div className="w-5 h-5 rounded bg-blue-500/20 flex items-center justify-center text-[10px]">🔍</div>
                  <div className="flex flex-col">
                    <span className="text-[10px] md:text-xs font-semibold leading-tight">Research</span>
                    <span className="text-[8px] opacity-65 leading-none">Market Analysis</span>
                  </div>
                </div>

                {/* MIDDLE NODE CENTER: Develop */}
                <div 
                  className={`absolute left-[41%] top-[40%] w-[25%] sm:w-[18%] border rounded-lg p-2 flex items-center gap-2 shadow-lg pointer-events-auto transition-all cursor-pointer ${nodePurple}`}
                >
                  <div className="w-5 h-5 rounded bg-primary/20 flex items-center justify-center text-[10px]">💻</div>
                  <div className="flex flex-col">
                    <span className="text-[10px] md:text-xs font-semibold leading-tight">Develop</span>
                    <span className="text-[8px] opacity-65 leading-none">Core Modules</span>
                  </div>
                </div>

                {/* MIDDLE NODE RIGHT: Launch */}
                <div 
                  className={`absolute left-[69%] top-[40%] w-[25%] sm:w-[18%] border rounded-lg p-2 flex items-center gap-2 shadow-lg pointer-events-auto transition-all cursor-pointer ${nodeEmerald}`}
                >
                  <div className="w-5 h-5 rounded bg-emerald-500/20 flex items-center justify-center text-[10px]">🚀</div>
                  <div className="flex flex-col">
                    <span className="text-[10px] md:text-xs font-semibold leading-tight">Launch</span>
                    <span className="text-[8px] opacity-65 leading-none">Go Live Target</span>
                  </div>
                </div>

                {/* BOTTOM NODE LEFT: Design */}
                <div 
                  className={`absolute left-[24%] top-[72%] w-[22%] sm:w-[15%] border rounded-lg p-2 flex items-center gap-2 shadow-lg pointer-events-auto transition-all cursor-pointer ${nodeAmber}`}
                >
                  <div className="w-5 h-5 rounded bg-amber-500/20 flex items-center justify-center text-[10px]">🎨</div>
                  <div className="flex flex-col">
                    <span className="text-[10px] md:text-xs font-semibold leading-tight">Design</span>
                    <span className="text-[8px] opacity-65 leading-none">UI/UX Layout</span>
                  </div>
                </div>

                {/* BOTTOM NODE RIGHT: Implement */}
                <div 
                  className={`absolute left-[48%] top-[72%] w-[24%] sm:w-[16%] border rounded-lg p-2 flex items-center gap-2 shadow-lg pointer-events-auto transition-all cursor-pointer ${nodeBlue}`}
                >
                  <div className="w-5 h-5 rounded bg-blue-500/20 flex items-center justify-center text-[10px]">⚙️</div>
                  <div className="flex flex-col">
                    <span className="text-[10px] md:text-xs font-semibold leading-tight">Implement</span>
                    <span className="text-[8px] opacity-65 leading-none">Core Features</span>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* ========================================================
            OVERLAPPING PANEL 1: Mind Map (Bottom Right Radial Tree)
           ======================================================== */}
        <motion.div 
          {...floatAnim(0, 7)}
          className={`hidden md:flex absolute w-[42%] h-[48%] right-0 bottom-[-5%] border rounded-xl shadow-2xl backdrop-blur-md flex-col overflow-hidden transition-all duration-300 hover:scale-[1.03] hover:border-primary/30 group cursor-pointer ${panelBg}`}
          style={{ zIndex: hoveredPanel === "mindmap-right" ? 35 : 20 }}
          onMouseEnter={() => setHoveredPanel("mindmap-right")}
        >
          {/* Header */}
          <div className={`h-9 border-b px-3 flex items-center justify-between transition-colors ${panelHeader}`}>
            <div className="flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-primary" />
              <span className={`text-[10px] font-semibold tracking-wide ${panelTitle}`}>Mind Map</span>
            </div>
            <Maximize2 className="w-3 h-3 opacity-30 group-hover:opacity-75 transition-opacity" />
          </div>

          {/* Canvas Radial Structure */}
          <div className={`flex-1 relative p-2 overflow-hidden transition-colors ${panelCanvas}`}>
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <line x1="50%" y1="50%" x2="20%" y2="25%" stroke={panelLine} strokeWidth="1.2" />
              <line x1="50%" y1="50%" x2="80%" y2="25%" stroke={panelLine} strokeWidth="1.2" />
              <line x1="50%" y1="50%" x2="20%" y2="75%" stroke={panelLine} strokeWidth="1.2" />
              <line x1="50%" y1="50%" x2="80%" y2="75%" stroke={panelLine} strokeWidth="1.2" />
            </svg>

            {/* Central Node */}
            <div className="absolute left-[33%] top-[40%] w-[34%] py-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[9px] font-bold text-center shadow-lg shadow-emerald-500/20 hover:scale-105 transition-all">
              New Project
            </div>

            {/* Radial Nodes */}
            <div className={`absolute left-[8%] top-[15%] px-2 py-1 rounded border text-[8px] hover:border-primary/50 hover:scale-105 transition-all ${panelNode}`}>
              Ideas
            </div>
            <div className={`absolute right-[8%] top-[15%] px-2 py-1 rounded border text-[8px] hover:border-primary/50 hover:scale-105 transition-all ${panelNode}`}>
              Research
            </div>
            <div className={`absolute left-[8%] top-[68%] px-2 py-1 rounded border text-[8px] hover:border-primary/50 hover:scale-105 transition-all ${panelNode}`}>
              Plan
            </div>
            <div className={`absolute right-[8%] top-[68%] px-2 py-1 rounded border text-[8px] hover:border-primary/50 hover:scale-105 transition-all ${panelNode}`}>
              Growth
            </div>
          </div>
        </motion.div>

        {/* ========================================================
            OVERLAPPING PANEL 2: Mind Map (Bottom Left)
           ======================================================== */}
        <motion.div 
          {...floatAnim(2, 6.5)}
          className={`hidden md:flex absolute w-[30%] h-[38%] left-[-2%] bottom-[-8%] border rounded-xl shadow-2xl backdrop-blur-md flex-col overflow-hidden transition-all duration-300 hover:scale-[1.03] hover:border-cyan-500/30 group cursor-pointer ${panelBg}`}
          style={{ zIndex: hoveredPanel === "mindmap-left" ? 35 : 20 }}
          onMouseEnter={() => setHoveredPanel("mindmap-left")}
        >
          {/* Header */}
          <div className={`h-8 border-b px-2.5 flex items-center justify-between transition-colors ${panelHeader}`}>
            <div className="flex items-center gap-1.5">
              <Layers className="w-3 h-3 text-cyan-400" />
              <span className={`text-[9px] font-semibold tracking-wide ${panelTitle}`}>Mind Map</span>
            </div>
          </div>

          {/* Canvas Radial Structure */}
          <div className={`flex-1 relative p-2 overflow-hidden transition-colors ${panelCanvas}`}>
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <line x1="50%" y1="55%" x2="20%" y2="25%" stroke={panelLineCyan} strokeWidth="1" />
              <line x1="50%" y1="55%" x2="80%" y2="25%" stroke={panelLineCyan} strokeWidth="1" />
              <line x1="50%" y1="55%" x2="50%" y2="85%" stroke={panelLineCyan} strokeWidth="1" />
            </svg>

            {/* Central Node */}
            <div className="absolute left-[30%] top-[45%] w-[40%] py-1 rounded bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-[8px] font-bold text-center shadow-lg hover:scale-105 transition-all">
              Ideas
            </div>

            {/* Radial Nodes */}
            <div className={`absolute left-[5%] top-[12%] px-1.5 py-0.5 rounded border text-[7px] hover:border-cyan-500/50 hover:scale-105 transition-all ${panelNode}`}>
              Design
            </div>
            <div className={`absolute right-[5%] top-[12%] px-1.5 py-0.5 rounded border text-[7px] hover:border-cyan-500/50 hover:scale-105 transition-all ${panelNode}`}>
              Copy
            </div>
          </div>
        </motion.div>

        {/* ========================================================
            OVERLAPPING PANEL 3: Project Diagram (Top Right Org Chart)
           ======================================================== */}
        <motion.div 
          {...floatAnim(1, 8)}
          className={`hidden md:flex absolute w-[35%] h-[42%] right-[-3%] top-[-8%] border rounded-xl shadow-2xl backdrop-blur-md flex-col overflow-hidden transition-all duration-300 hover:scale-[1.03] hover:border-emerald-500/30 group cursor-pointer ${panelBg}`}
          style={{ zIndex: hoveredPanel === "orgchart-right" ? 35 : 20 }}
          onMouseEnter={() => setHoveredPanel("orgchart-right")}
        >
          {/* Header */}
          <div className={`h-8 border-b px-2.5 flex items-center justify-between transition-colors ${panelHeader}`}>
            <div className="flex items-center gap-1.5">
              <Layers className="w-3 h-3 text-emerald-400" />
              <span className={`text-[9px] font-semibold tracking-wide ${panelTitle}`}>Org Chart</span>
            </div>
          </div>

          {/* Canvas Radial Structure */}
          <div className={`flex-1 relative p-2 overflow-hidden transition-colors ${panelCanvas}`}>
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <line x1="50%" y1="20%" x2="25%" y2="55%" stroke={panelLineEmerald} strokeWidth="1" />
              <line x1="50%" y1="20%" x2="75%" y2="55%" stroke={panelLineEmerald} strokeWidth="1" />
              <line x1="25%" y1="65%" x2="25%" y2="85%" stroke={panelLineEmerald} strokeWidth="1" />
            </svg>

            {/* Central Node */}
            <div className={`absolute left-[35%] top-[10%] w-[30%] py-1 rounded border text-[8px] font-bold text-center shadow-lg hover:scale-105 transition-all ${panelNodeDirector}`}>
              Director
            </div>

            {/* Radial Nodes */}
            <div className={`absolute left-[10%] top-[48%] px-1.5 py-0.5 rounded border text-[7px] hover:border-emerald-500/50 hover:scale-105 transition-all ${panelNode}`}>
              Manager A
            </div>
            <div className={`absolute right-[10%] top-[48%] px-1.5 py-0.5 rounded border text-[7px] hover:border-emerald-500/50 hover:scale-105 transition-all ${panelNode}`}>
              Manager B
            </div>
          </div>
        </motion.div>

      </div>

      {/* Styled connection lines pulsing in the background layout (from main container out) */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        {/* Ambient background glows for extra premium feel */}
        <div className="absolute -left-10 -bottom-10 w-48 h-48 rounded-full blur-[60px] transition-colors bg-primary/10" />
        <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full blur-[60px] transition-colors bg-primary/10" />
      </div>
    </div>
  );
}
