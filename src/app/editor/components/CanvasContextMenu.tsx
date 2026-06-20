import { useEffect, useRef, useState } from "react";
import { Trash2, Sparkles, Send, Type, Layout, Database, ChevronRight } from "lucide-react";
import { useEditorTheme } from "../context/EditorThemeContext";
import { type NodeShape } from "../nodes/CustomNode";

interface CanvasContextMenuProps {
  x: number;
  y: number;
  nodeId: string | null;
  nodeLabel?: string;
  nodeShape?: NodeShape;
  nodeBgColor?: string;
  isFrame?: boolean;
  onClose: () => void;
  onRenameNode: (id: string, newLabel: string) => void;
  onChangeNodeShape: (id: string, shape: NodeShape) => void;
  onChangeNodeColor: (id: string, color: string) => void;
  onDeleteNode: (id: string) => void;
  onSpawnNode: (shape: NodeShape) => void;
  onSpawnFrame?: (frameType: "flowchart") => void;
  onAskAI: (prompt: string, nodeId: string | null) => Promise<void>;
  aiLoading?: boolean;

  // New Actions
  onCut?: () => void;
  onCopy?: () => void;
  onPaste?: () => void;
  onDuplicate?: () => void;
  onSelectAll?: () => void;
  onChangeOrder?: (action: "backward" | "forward" | "back" | "front") => void;
  onCopyAsPNG?: () => void;
  onCopyAsSVG?: () => void;
  onCopyLink?: () => void;
  onCopyMarkdown?: () => void;
  onCopyHTML?: () => void;
  onCopyStyles?: () => void;
  onPasteStyles?: () => void;
  onAddComment?: () => void;
  onCreateFigure?: () => void;
  onGroupSelection?: () => void;
}

const PRESET_SHAPES: { id: NodeShape; label: string }[] = [
  { id: "rect", label: "Rectangle" },
  { id: "rounded", label: "Rounded" },
  { id: "circle", label: "Circle" },
  { id: "diamond", label: "Diamond" },
  { id: "hexagon", label: "Hexagon" },
  { id: "parallelogram", label: "Parallelogram" },
  { id: "triangle", label: "Triangle" },
  { id: "cylinder", label: "Cylinder" },
  { id: "cloud", label: "Cloud" },
  { id: "process", label: "Process" },
  { id: "decision", label: "Decision" },
];

const PRESET_COLORS = [
  { value: "#7c3aed", name: "Violet" },
  { value: "#4f46e5", name: "Indigo" },
  { value: "#0ea5e9", name: "Sky" },
  { value: "#059669", name: "Emerald" },
  { value: "#d97706", name: "Amber" },
  { value: "#db2777", name: "Pink" },
  { value: "#9ca3af", name: "Gray" },
];

export function CanvasContextMenu({
  x,
  y,
  nodeId,
  nodeLabel = "",
  nodeShape = "rect",
  nodeBgColor = "#080808",
  isFrame = false,
  onClose,
  onRenameNode,
  onChangeNodeShape,
  onChangeNodeColor,
  onDeleteNode,
  onSpawnNode,
  onSpawnFrame,
  onAskAI,
  aiLoading = false,

  // New Actions
  onCut,
  onCopy,
  onPaste,
  onDuplicate,
  onSelectAll,
  onChangeOrder,
  onCopyAsPNG,
  onCopyAsSVG,
  onCopyLink,
  onCopyMarkdown,
  onCopyHTML,
  onCopyStyles,
  onPasteStyles,
  onAddComment,
  onCreateFigure,
  onGroupSelection,
}: CanvasContextMenuProps) {
  const { theme } = useEditorTheme();
  const menuRef = useRef<HTMLDivElement>(null);
  const [labelText, setLabelText] = useState(nodeLabel);
  const [aiPrompt, setAiPrompt] = useState("");
  const [activeSubMenu, setActiveSubMenu] = useState<"copyPasteAs" | "changeOrder" | null>(null);
  const [adjustedPos, setAdjustedPos] = useState<{ x: number; y: number }>({ x, y });

  useEffect(() => {
    setLabelText(nodeLabel);
  }, [nodeLabel]);

  // Clamp menu position so it stays within the parent container / viewport
  useEffect(() => {
    const MARGIN = 12;
    const el = menuRef.current;
    if (!el) {
      setAdjustedPos({ x, y });
      return;
    }

    // Use requestAnimationFrame so the DOM has painted and dimensions are accurate
    requestAnimationFrame(() => {
      const menuRect = el.getBoundingClientRect();
      const parent = el.offsetParent as HTMLElement | null;
      const containerW = parent ? parent.clientWidth : window.innerWidth;
      const containerH = parent ? parent.clientHeight : window.innerHeight;

      let clampedX = x;
      let clampedY = y;

      // Prevent overflow on the right
      if (clampedX + menuRect.width + MARGIN > containerW) {
        clampedX = containerW - menuRect.width - MARGIN;
      }
      // Prevent overflow on the bottom
      if (clampedY + menuRect.height + MARGIN > containerH) {
        clampedY = containerH - menuRect.height - MARGIN;
      }
      // Prevent overflow on the left / top
      if (clampedX < MARGIN) clampedX = MARGIN;
      if (clampedY < MARGIN) clampedY = MARGIN;

      setAdjustedPos({ x: clampedX, y: clampedY });
    });
  }, [x, y]);

  // Close context menu when user clicks outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    window.addEventListener("mousedown", handleOutsideClick);
    return () => window.removeEventListener("mousedown", handleOutsideClick);
  }, [onClose]);

  const handleRenameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nodeId && labelText.trim() && labelText.trim() !== nodeLabel) {
      onRenameNode(nodeId, labelText.trim());
    }
  };

  const handleAISubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;
    await onAskAI(aiPrompt.trim(), nodeId);
    setAiPrompt("");
    onClose();
  };

  const menuStyle: React.CSSProperties = {
    position: "absolute",
    left: adjustedPos.x,
    top: adjustedPos.y,
    zIndex: 1000,
    width: "256px",
    background: theme.panel,
    borderColor: theme.border,
    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.4)",
    backdropFilter: "blur(12px)",
  };

  const itemCls = "flex items-center justify-between w-full px-3 py-1.5 rounded-md hover:bg-white/5 text-left transition-colors select-none text-xs";

  return (
    <div
      ref={menuRef}
      className="rounded-xl border p-2 flex flex-col gap-1.5 text-xs transition-all animate-in fade-in zoom-in-95 duration-100"
      style={menuStyle}
      onClick={(e) => e.stopPropagation()}
    >
      {/* ── AI PROMPT BAR ── */}
      <form onSubmit={handleAISubmit} className="flex flex-col gap-1.5 p-1.5">
        <label className="text-[10px] uppercase tracking-wider font-bold" style={{ color: theme.textMuted }}>
          {nodeId ? "Ask AI to edit this node" : "Ask AI to generate nodes"}
        </label>
        <div className="relative flex items-center">
          <input
            type="text"
            placeholder={nodeId ? "e.g. Change color to emerald..." : "e.g. Draw a login flow..."}
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            disabled={aiLoading}
            className="w-full pl-3 pr-8 py-1.5 rounded-lg border outline-none text-xs transition-colors"
            style={{
              background: theme.surfaceHover,
              borderColor: theme.border,
              color: theme.textPrimary,
            }}
          />
          <button
            type="submit"
            disabled={!aiPrompt.trim() || aiLoading}
            className="absolute right-1.5 p-1 rounded text-primary hover:bg-primary/10 disabled:opacity-40 transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>

      <div className="w-full h-px" style={{ background: theme.border }} />

      {/* ── CLIPBOARD OPERATIONS ── */}
      <div className="flex flex-col">
        <button
          onClick={() => { onCut?.(); onClose(); }}
          className={itemCls}
          style={{ color: theme.textPrimary }}
        >
          <span>Cut</span>
          <span className="text-[10.5px]" style={{ color: theme.textMuted }}>⌘ X</span>
        </button>
        <button
          onClick={() => { onCopy?.(); onClose(); }}
          className={itemCls}
          style={{ color: theme.textPrimary }}
        >
          <span>Copy</span>
          <span className="text-[10.5px]" style={{ color: theme.textMuted }}>⌘ C</span>
        </button>
        <button
          onClick={() => { onPaste?.(); onClose(); }}
          className={itemCls}
          style={{ color: theme.textPrimary }}
        >
          <span>Paste</span>
          <span className="text-[10.5px]" style={{ color: theme.textMuted }}>⌘ V</span>
        </button>
        <button
          onClick={() => { onDuplicate?.(); onClose(); }}
          className={itemCls}
          style={{ color: theme.textPrimary }}
        >
          <span>Duplicate</span>
          <span className="text-[10.5px]" style={{ color: theme.textMuted }}>⌘ D</span>
        </button>
        <button
          onClick={() => { onSelectAll?.(); onClose(); }}
          className={itemCls}
          style={{ color: theme.textPrimary }}
        >
          <span>Select all</span>
          <span className="text-[10.5px]" style={{ color: theme.textMuted }}>⌘ A</span>
        </button>
      </div>

      <div className="w-full h-px" style={{ background: theme.border }} />

      {/* ── COPY/PASTE AS SUB-MENU ── */}
      <div
        className="relative"
        onMouseEnter={() => setActiveSubMenu("copyPasteAs")}
        onMouseLeave={() => setActiveSubMenu(null)}
      >
        <button
          className={`${itemCls} ${activeSubMenu === "copyPasteAs" ? "bg-white/5" : ""}`}
          style={{ color: theme.textPrimary }}
        >
          <span>Copy/Paste As</span>
          <ChevronRight className="w-3.5 h-3.5" style={{ color: theme.textMuted }} />
        </button>
        {activeSubMenu === "copyPasteAs" && (
          <div
            className="absolute left-full top-[-8px] ml-1 rounded-xl border p-2 flex flex-col gap-1 text-xs shadow-2xl backdrop-blur-md"
            style={{
              background: theme.panel,
              borderColor: theme.border,
              width: "180px",
              zIndex: 1100,
            }}
          >
            <button
              onClick={() => { onCopyAsPNG?.(); onClose(); }}
              className="flex items-center justify-between w-full px-3 py-1.5 rounded hover:bg-white/5 text-left text-xs"
              style={{ color: theme.textPrimary }}
            >
              <span>Copy as PNG</span>
              <span className="text-[10px]" style={{ color: theme.textMuted }}>⇧ ⌥ C</span>
            </button>
            <button
              onClick={() => { onCopyAsSVG?.(); onClose(); }}
              className="flex items-center justify-between w-full px-3 py-1.5 rounded hover:bg-white/5 text-left text-xs"
              style={{ color: theme.textPrimary }}
            >
              <span>Copy as SVG</span>
            </button>
            <button
              onClick={() => { onCopyLink?.(); onClose(); }}
              className="flex items-center justify-between w-full px-3 py-1.5 rounded hover:bg-white/5 text-left text-xs"
              style={{ color: theme.textPrimary }}
            >
              <span>Copy link</span>
              <span className="text-[10px]" style={{ color: theme.textMuted }}>^ ⇧ K</span>
            </button>
            <button
              onClick={() => { onCopyMarkdown?.(); onClose(); }}
              className="flex items-center justify-between w-full px-3 py-1.5 rounded hover:bg-white/5 text-left text-xs"
              style={{ color: theme.textPrimary }}
            >
              <span>Copy Markdown</span>
            </button>
            <button
              onClick={() => { onCopyHTML?.(); onClose(); }}
              className="flex items-center justify-between w-full px-3 py-1.5 rounded hover:bg-white/5 text-left text-xs"
              style={{ color: theme.textPrimary }}
            >
              <span>Copy HTML</span>
            </button>
            <div className="w-full h-px my-1" style={{ background: theme.border }} />
            <button
              onClick={() => { onCopyStyles?.(); onClose(); }}
              className="flex items-center justify-between w-full px-3 py-1.5 rounded hover:bg-white/5 text-left text-xs"
              style={{ color: theme.textPrimary }}
            >
              <span>Copy styles</span>
              <span className="text-[10px]" style={{ color: theme.textMuted }}>⌘ ⌥ C</span>
            </button>
            <button
              onClick={() => { onPasteStyles?.(); onClose(); }}
              className="flex items-center justify-between w-full px-3 py-1.5 rounded hover:bg-white/5 text-left text-xs"
              style={{ color: theme.textPrimary }}
            >
              <span>Paste styles</span>
              <span className="text-[10px]" style={{ color: theme.textMuted }}>⌘ ⌥ V</span>
            </button>
          </div>
        )}
      </div>

      {/* ── LAYOUT & GROUP ACTIONS ── */}
      <button
        onClick={() => { onAddComment?.(); onClose(); }}
        className={itemCls}
        style={{ color: theme.textPrimary }}
      >
        <span>Add comment</span>
        <span className="text-[10.5px]" style={{ color: theme.textMuted }}>⌘ ⇧ M</span>
      </button>
      <button
        onClick={() => { onCreateFigure?.(); onClose(); }}
        className={itemCls}
        style={{ color: theme.textPrimary }}
      >
        <span>Create Figure</span>
        <span className="text-[10.5px]" style={{ color: theme.textMuted }}>⇧ F</span>
      </button>
      <button
        onClick={() => { onGroupSelection?.(); onClose(); }}
        className={itemCls}
        style={{ color: theme.textPrimary }}
      >
        <span>Group selection</span>
        <span className="text-[10.5px]" style={{ color: theme.textMuted }}>⌘ G</span>
      </button>

      <div className="w-full h-px" style={{ background: theme.border }} />

      {/* ── CHANGE ORDER SUB-MENU ── */}
      <div
        className="relative"
        onMouseEnter={() => setActiveSubMenu("changeOrder")}
        onMouseLeave={() => setActiveSubMenu(null)}
      >
        <button
          className={`${itemCls} ${activeSubMenu === "changeOrder" ? "bg-white/5" : ""}`}
          style={{ color: theme.textPrimary }}
        >
          <span>Change Order</span>
          <ChevronRight className="w-3.5 h-3.5" style={{ color: theme.textMuted }} />
        </button>
        {activeSubMenu === "changeOrder" && (
          <div
            className="absolute left-full top-[-8px] ml-1 rounded-xl border p-2 flex flex-col gap-1 text-xs shadow-2xl backdrop-blur-md"
            style={{
              background: theme.panel,
              borderColor: theme.border,
              width: "160px",
              zIndex: 1100,
            }}
          >
            <button
              onClick={() => { onChangeOrder?.("backward"); onClose(); }}
              className="flex items-center justify-between w-full px-3 py-1.5 rounded hover:bg-white/5 text-left text-xs"
              style={{ color: theme.textPrimary }}
            >
              <span>Send backward</span>
              <span className="text-[10px]" style={{ color: theme.textMuted }}>⌘ [</span>
            </button>
            <button
              onClick={() => { onChangeOrder?.("forward"); onClose(); }}
              className="flex items-center justify-between w-full px-3 py-1.5 rounded hover:bg-white/5 text-left text-xs"
              style={{ color: theme.textPrimary }}
            >
              <span>Bring forward</span>
              <span className="text-[10px]" style={{ color: theme.textMuted }}>⌘ ]</span>
            </button>
            <button
              onClick={() => { onChangeOrder?.("back"); onClose(); }}
              className="flex items-center justify-between w-full px-3 py-1.5 rounded hover:bg-white/5 text-left text-xs"
              style={{ color: theme.textPrimary }}
            >
              <span>Send to back</span>
              <span className="text-[10px]" style={{ color: theme.textMuted }}>[</span>
            </button>
            <button
              onClick={() => { onChangeOrder?.("front"); onClose(); }}
              className="flex items-center justify-between w-full px-3 py-1.5 rounded hover:bg-white/5 text-left text-xs"
              style={{ color: theme.textPrimary }}
            >
              <span>Bring to front</span>
              <span className="text-[10px]" style={{ color: theme.textMuted }}>]</span>
            </button>
          </div>
        )}
      </div>

      <div className="w-full h-px" style={{ background: theme.border }} />

      {/* ── CONVERT / COLOR EDIT TOOLS (NODE SPECIFIC) ── */}
      {nodeId ? (
        <div className="flex flex-col gap-3 p-1.5">
          {/* Label Rename */}
          <form onSubmit={handleRenameSubmit} className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase tracking-wider font-bold" style={{ color: theme.textMuted }}>
              {isFrame ? "Rename Frame" : "Node Text"}
            </label>
            <div className="relative flex items-center">
              <input
                type="text"
                value={labelText}
                onChange={(e) => setLabelText(e.target.value)}
                onBlur={() => {
                  if (labelText.trim() && labelText.trim() !== nodeLabel) {
                    onRenameNode(nodeId, labelText.trim());
                  }
                }}
                className="w-full pl-3 pr-8 py-1.5 rounded-lg border outline-none text-xs"
                style={{
                  background: theme.surfaceHover,
                  borderColor: theme.border,
                  color: theme.textPrimary,
                }}
              />
              <Type className="absolute right-2.5 w-3.5 h-3.5" style={{ color: theme.textMuted }} />
            </div>
          </form>

          {isFrame ? (
            /* Spawn New Node Inside Frame */
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-wider font-bold" style={{ color: theme.textMuted }}>
                Spawn New Node Inside Frame
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {PRESET_SHAPES.slice(0, 4).map((sh) => (
                  <button
                    key={sh.id}
                    onClick={() => {
                      onSpawnNode(sh.id);
                      onClose();
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-left hover:bg-primary/10 hover:border-primary/30 transition-all text-xs"
                    style={{
                      background: theme.surfaceHover,
                      borderColor: theme.border,
                      color: theme.textPrimary,
                    }}
                  >
                    <div
                      className="w-3 h-3 rounded bg-primary/20 border border-primary flex-shrink-0"
                      style={{
                        borderRadius: sh.id === "circle" ? "50%" : sh.id === "rounded" ? "3px" : "0px",
                      }}
                    />
                    <span className="truncate">{sh.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* Shapes grid */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-wider font-bold" style={{ color: theme.textMuted }}>
                  Convert Shape
                </label>
                <div className="grid grid-cols-3 gap-1 max-h-24 overflow-y-auto pr-1" style={{ scrollbarWidth: "none" }}>
                  {PRESET_SHAPES.map((sh) => (
                    <button
                      key={sh.id}
                      onClick={() => {
                        onChangeNodeShape(nodeId, sh.id);
                      }}
                      className="px-2 py-1 rounded border text-left truncate transition-colors text-[10.5px]"
                      style={{
                        borderColor: nodeShape === sh.id ? theme.accent : theme.border,
                        background: nodeShape === sh.id ? `${theme.accent}1a` : theme.surfaceHover,
                        color: nodeShape === sh.id ? theme.accent : theme.textPrimary,
                      }}
                    >
                      {sh.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color palette */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-wider font-bold" style={{ color: theme.textMuted }}>
                  Change Color
                </label>
                <div className="flex gap-1.5 flex-wrap">
                  {PRESET_COLORS.map((col) => (
                    <button
                      key={col.value}
                      onClick={() => {
                        onChangeNodeColor(nodeId, col.value);
                      }}
                      className="w-5 h-5 rounded-full border transition-transform hover:scale-110 flex items-center justify-center"
                      style={{
                        background: col.value,
                        borderColor: nodeBgColor === col.value ? "#ffffff" : "transparent",
                        boxShadow: nodeBgColor === col.value ? `0 0 0 1px ${theme.accent}` : undefined,
                      }}
                      title={col.name}
                    />
                  ))}
                </div>
              </div>
            </>
          )}

          <div className="w-full h-px my-1" style={{ background: theme.border }} />

          {/* Delete Node / Frame */}
          <button
            onClick={() => {
              onDeleteNode(nodeId);
              onClose();
            }}
            className="flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-red-400 hover:bg-red-500/10 border border-transparent transition-colors font-medium text-xs"
          >
            <Trash2 className="w-3.5 h-3.5" />
            {isFrame ? "Delete Frame" : "Delete Node"}
          </button>
        </div>
      ) : (
        // ── PANE SPAWN TOOLS (IF NO NODE SELECTED) ──
        <div className="flex flex-col gap-2.5 p-1.5">
          <label className="text-[10px] uppercase tracking-wider font-bold" style={{ color: theme.textMuted }}>
            Spawn New Node
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {PRESET_SHAPES.slice(0, 4).map((sh) => (
              <button
                key={sh.id}
                onClick={() => {
                  onSpawnNode(sh.id);
                  onClose();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-left hover:bg-primary/10 hover:border-primary/30 transition-all text-xs"
                style={{
                  background: theme.surfaceHover,
                  borderColor: theme.border,
                  color: theme.textPrimary,
                }}
              >
                <div
                  className="w-3 h-3 rounded bg-primary/20 border border-primary flex-shrink-0"
                  style={{
                    borderRadius: sh.id === "circle" ? "50%" : sh.id === "rounded" ? "3px" : "0px",
                  }}
                />
                <span className="truncate">{sh.label}</span>
              </button>
            ))}
          </div>

          <div className="w-full h-px my-1" style={{ background: theme.border }} />

          <label className="text-[10px] uppercase tracking-wider font-bold" style={{ color: theme.textMuted }}>
            Spawn New Workspace Frame
          </label>
          <div className="flex flex-col gap-1.5">
            <button
              onClick={() => {
                onSpawnFrame?.("flowchart");
                onClose();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-left hover:bg-primary/10 hover:border-primary/30 transition-all text-xs"
              style={{
                background: theme.surfaceHover,
                borderColor: theme.border,
                color: theme.textPrimary,
              }}
            >
              <Layout className="w-3.5 h-3.5 flex-shrink-0 text-primary" />
              <span className="truncate">Flowchart</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
