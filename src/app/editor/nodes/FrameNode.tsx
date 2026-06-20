import { memo, useState, useRef, useEffect, useCallback } from "react";
import { NodeProps, NodeResizer, useReactFlow, Handle, Position, useConnection } from "@xyflow/react";
import { Sparkles, Code, Layout, Edit3 } from "lucide-react";
import { useEditorStore } from "../../stores/editorStore";
import { useEditorTheme } from "../context/EditorThemeContext";

export interface FrameNodeData {
  label: string;
  frameType: "flowchart" | "er";
  width?: number;
  height?: number;
}

const HANDLE_STYLE = {
  width: 8,
  height: 8,
  background: "#080808",
  border: "2px solid #a78bfa",
  borderRadius: "50%",
  opacity: 0,
  transition: "opacity 0.2s ease",
};

export const FrameNode = memo(({ id, data, selected, width: nodeWidth, height: nodeHeight }: NodeProps) => {
  const d = data as unknown as FrameNodeData;
  const { theme } = useEditorTheme();
  const { setNodes } = useReactFlow();
  const connection = useConnection();
  const [hovered, setHovered] = useState(false);
  
  const activeFrameId = useEditorStore((s) => s.activeFrameId);
  const activeFrameMode = useEditorStore((s) => s.activeFrameMode);
  const setActiveFrameId = useEditorStore((s) => s.setActiveFrameId);
  const setActiveFrameMode = useEditorStore((s) => s.setActiveFrameMode);

  const isActive = activeFrameId === id;
  const w = nodeWidth ?? d.width ?? 480;
  const h = nodeHeight ?? d.height ?? 600;

  const [isEditing, setIsEditing] = useState(false);
  const [titleInput, setTitleInput] = useState(d.label || "Flowchart");
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync title externally
  useEffect(() => {
    if (!isEditing) {
      setTitleInput(d.label || (d.frameType === "er" ? "Entity Relationship Diagram" : "Flowchart"));
    }
  }, [d.label, d.frameType, isEditing]);

  // Focus title edit input
  useEffect(() => {
    if (isEditing) {
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
    }
  }, [isEditing]);

  const saveTitle = useCallback(() => {
    setIsEditing(false);
    const trimmed = titleInput.trim();
    if (!trimmed || trimmed === d.label) return;
    setNodes((ns) =>
      ns.map((n) => {
        if (n.id === id) {
          return {
            ...n,
            data: {
              ...(n.data as Record<string, unknown>),
              label: trimmed,
            },
          };
        }
        return n;
      })
    );
  }, [id, titleInput, d.label, setNodes]);

  const handleTabClick = (mode: "diagram" | "ai" | "dsl") => {
    setActiveFrameId(id);
    setActiveFrameMode(mode);
  };

  const isLight = theme.id === "light";
  const isConnecting = connection.inProgress;
  const showHandles = hovered || selected || isConnecting;
  const handleStyle = {
    ...HANDLE_STYLE,
    background: theme.accent,
    border: `2px solid ${theme.accent}cc`,
    opacity: showHandles ? 1 : 0,
  };

  return (
    <div
      onClick={() => {
        if (activeFrameId !== id) {
          setActiveFrameId(id);
        }
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="rounded-2xl transition-all duration-300 relative"
      style={{
        width: w,
        height: h,
        border: isActive
          ? `2px solid ${theme.accent}`
          : `1px solid ${theme.border}`,
        boxShadow: isActive
          ? `0 0 0 3px ${theme.accent}25, 0 10px 30px -10px rgba(0,0,0,0.5)`
          : "none",
        background: "#C7C7C7",
        backdropFilter: "blur(4px)",
      }}
    >
      <NodeResizer
        isVisible={selected}
        minWidth={280}
        minHeight={280}
        handleStyle={{ width: 8, height: 8, background: theme.accent, border: `2px solid ${theme.panel}`, borderRadius: "50%" }}
        lineStyle={{ borderColor: theme.accent, borderWidth: 1 }}
      />

      {/* Frame Header Bar */}
      <div
        className="absolute top-[-44px] left-0 right-0 h-10 rounded-xl flex items-center justify-between px-3 gap-2 border select-none nodrag"
        style={{
          background: theme.panel,
          borderColor: isActive ? theme.accent : theme.border,
          boxShadow: "0 4px 12px -2px rgba(0,0,0,0.2)",
          backdropFilter: "blur(12px)",
          zIndex: 100,
        }}
      >
        {/* Title Section */}
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          <Layout className="w-3.5 h-3.5 flex-shrink-0" style={{ color: theme.accent }} />
          {isEditing ? (
            <input
              ref={inputRef}
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              onBlur={saveTitle}
              onKeyDown={(e) => {
                if (e.key === "Enter") saveTitle();
                if (e.key === "Escape") setIsEditing(false);
              }}
              className="bg-transparent border-b outline-none px-0.5 text-xs font-bold w-full"
              style={{ color: theme.textPrimary, borderColor: theme.accent }}
            />
          ) : (
            <span
              onDoubleClick={() => setIsEditing(true)}
              className="text-xs font-bold truncate cursor-text hover:text-primary transition-colors"
              style={{ color: theme.textPrimary }}
              title="Double click to edit title"
            >
              {titleInput}
            </span>
          )}
        </div>

        {/* Action Tabs */}
        <div className="flex items-center gap-1 p-0.5 rounded-lg" style={{ background: theme.surfaceHover }}>
          {/* Mode Diagram */}
          <button
            onClick={() => handleTabClick("diagram")}
            className="px-2 py-1 rounded-md text-[10px] font-semibold transition-all flex items-center gap-1"
            style={{
              background: isActive && activeFrameMode === "diagram" ? theme.accent : "transparent",
              color: isActive && activeFrameMode === "diagram" ? "#ffffff" : theme.textMuted,
            }}
          >
            <Layout className="w-2.5 h-2.5" />
            <span>{d.frameType === "er" ? "ERD" : "Flowchart"}</span>
          </button>

          {/* Mode AI Chat */}
          <button
            onClick={() => handleTabClick("ai")}
            className="px-2 py-1 rounded-md text-[10px] font-semibold transition-all flex items-center gap-1"
            style={{
              background: isActive && activeFrameMode === "ai" ? theme.accent : "transparent",
              color: isActive && activeFrameMode === "ai" ? "#ffffff" : theme.textMuted,
            }}
          >
            <Sparkles className="w-2.5 h-2.5" />
            <span>AI Chat</span>
          </button>

          {/* Mode Code Editor */}
          <button
            onClick={() => handleTabClick("dsl")}
            className="px-2 py-1 rounded-md text-[10px] font-semibold transition-all flex items-center gap-1"
            style={{
              background: isActive && activeFrameMode === "dsl" ? theme.accent : "transparent",
              color: isActive && activeFrameMode === "dsl" ? "#ffffff" : theme.textMuted,
            }}
          >
            <Code className="w-2.5 h-2.5" />
            <span>Code Editor</span>
          </button>
        </div>
      </div>

      {/* Frame Active Background Indicator */}
      {isActive && (
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{
            border: `2px solid ${theme.accent}15`,
            boxShadow: `inset 0 0 40px ${theme.accent}05`,
          }}
        />
      )}

      {/* Connection Handles */}
      <Handle type="target" position={Position.Top} id="top-target"
        style={{ ...handleStyle, top: -5, left: "50%", transform: "translateX(-50%)" }}
        className={isConnecting ? "connection-target-active" : ""} />
      <Handle type="source" position={Position.Bottom} id="bottom-source"
        style={{ ...handleStyle, bottom: -5, left: "50%", transform: "translateX(-50%)" }}
        className={isConnecting ? "connection-target-active" : ""} />
      <Handle type="target" position={Position.Left} id="left-target"
        style={{ ...handleStyle, left: -5, top: "50%", transform: "translateY(-50%)" }}
        className={isConnecting ? "connection-target-active" : ""} />
      <Handle type="source" position={Position.Right} id="right-source"
        style={{ ...handleStyle, right: -5, top: "50%", transform: "translateY(-50%)" }}
        className={isConnecting ? "connection-target-active" : ""} />
    </div>
  );
});

FrameNode.displayName = "FrameNode";
