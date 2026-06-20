import { memo, useState, useRef, useEffect, useCallback } from "react";
import { Handle, Position, type NodeProps, NodeResizer, useConnection, useReactFlow } from "@xyflow/react";
import { useEditorTheme } from "../context/EditorThemeContext";

import * as Icons from "lucide-react";

export type NodeShape =
  | "rect" | "rounded" | "circle" | "diamond"
  | "hexagon" | "parallelogram" | "triangle" | "cylinder"
  | "cloud" | "process" | "decision";

export interface CustomNodeData {
  label: string;
  shape: NodeShape;
  bgColor: string;
  borderColor: string;
  textColor: string;
  borderWidth: number;
  borderStyle: "solid" | "dashed" | "dotted";
  fontSize: number;
  iconName?: string;
  imageData?: string;
  notes?: string;
  width?: number;
  height?: number;
  frameType?: "flowchart" | "er";
}

const HANDLE_STYLE = {
  width: 10,
  height: 10,
  background: "transparent",
  border: "none",
  borderRadius: "50%",
  opacity: 0,
  transition: "opacity 0.2s ease, background 0.15s ease, border 0.15s ease",
};

/* Visible handle used only during active connection dragging */
const HANDLE_CONNECTING_STYLE = {
  width: 10,
  height: 10,
  background: "rgba(124, 58, 237, 0.25)",
  border: "2px solid rgba(124, 58, 237, 0.6)",
  borderRadius: "50%",
  opacity: 1,
  transition: "opacity 0.2s ease, background 0.15s ease, border 0.15s ease",
};

function ShapePath(props: {
  shape: NodeShape;
  w: number;
  h: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
  strokeDasharray?: string;
}) {
  const { shape, w, h, fill, stroke, strokeWidth, strokeDasharray } = props;
  const sd = strokeDasharray;
  const sw = strokeWidth;

  switch (shape) {
    case "circle":
      return <ellipse cx={w / 2} cy={h / 2} rx={w / 2 - sw} ry={h / 2 - sw} fill={fill} stroke={stroke} strokeWidth={sw} strokeDasharray={sd} />;
    case "diamond":
      return <polygon points={`${w/2},${sw} ${w-sw},${h/2} ${w/2},${h-sw} ${sw},${h/2}`} fill={fill} stroke={stroke} strokeWidth={sw} strokeDasharray={sd} />;
    case "hexagon":
      return <polygon points={`${w*0.25},${sw} ${w*0.75},${sw} ${w-sw},${h/2} ${w*0.75},${h-sw} ${w*0.25},${h-sw} ${sw},${h/2}`} fill={fill} stroke={stroke} strokeWidth={sw} strokeDasharray={sd} />;
    case "parallelogram":
      return <polygon points={`${w*0.15},${sw} ${w-sw},${sw} ${w*0.85},${h-sw} ${sw},${h-sw}`} fill={fill} stroke={stroke} strokeWidth={sw} strokeDasharray={sd} />;
    case "triangle":
      return <polygon points={`${w/2},${sw} ${w-sw},${h-sw} ${sw},${h-sw}`} fill={fill} stroke={stroke} strokeWidth={sw} strokeDasharray={sd} />;
    case "process":
      return <polygon points={`${w*0.1},${sw} ${w-sw},${sw} ${w-sw},${h-sw} ${w*0.1},${h-sw}`} fill={fill} stroke={stroke} strokeWidth={sw} strokeDasharray={sd} />;
    case "decision":
      return <polygon points={`${w/2},${sw} ${w-sw},${h/2} ${w/2},${h-sw} ${sw},${h/2}`} fill={fill} stroke={stroke} strokeWidth={sw} strokeDasharray={sd} />;
    case "cylinder":
      return (
        <g>
          <rect x={sw} y={h*0.15} width={w-sw*2} height={h-h*0.15-sw} fill={fill} stroke={stroke} strokeWidth={sw} strokeDasharray={sd} />
          <ellipse cx={w/2} cy={h*0.15} rx={w/2-sw} ry={h*0.12} fill={fill} stroke={stroke} strokeWidth={sw} />
          <ellipse cx={w/2} cy={h-sw} rx={w/2-sw} ry={h*0.12} fill={fill} stroke="none" />
        </g>
      );
    case "cloud":
      return (
        <g>
          <path
            d={`M${w*0.25},${h*0.75} Q${w*0.1},${h*0.75} ${w*0.1},${h*0.55} Q${w*0.1},${h*0.35} ${w*0.3},${h*0.3} Q${w*0.3},${h*0.1} ${w*0.5},${h*0.1} Q${w*0.7},${h*0.1} ${w*0.7},${h*0.3} Q${w*0.88},${h*0.28} ${w*0.9},${h*0.45} Q${w*0.98},${h*0.45} ${w*0.95},${h*0.6} Q${w*0.95},${h*0.75} ${w*0.78},${h*0.75} Z`}
            fill={fill} stroke={stroke} strokeWidth={sw} strokeDasharray={sd}
          />
        </g>
      );
    default: // rect / rounded
      return <rect x={sw/2} y={sw/2} width={w-sw} height={h-sw} rx={shape === "rounded" ? 12 : 6} fill={fill} stroke={stroke} strokeWidth={sw} strokeDasharray={sd} />;
  }
}

function getDashArray(style: string, width: number): string | undefined {
  if (style === "dashed") return `${width * 4},${width * 3}`;
  if (style === "dotted") return `${width},${width * 2}`;
  return undefined;
}

export const CustomNode = memo(({ id, data, selected, width: nodeWidth, height: nodeHeight }: NodeProps) => {
  const d = data as unknown as CustomNodeData;
  const { theme } = useEditorTheme();
  const [hovered, setHovered] = useState(false);
  // Prefer node-level width/height (set by NodeResizer) over data fields
  const w = nodeWidth ?? d.width ?? 160;
  const h = nodeHeight ?? d.height ?? 80;
  const connection = useConnection();
  const isConnecting = connection.inProgress;

  const { setNodes, getNode } = useReactFlow();
  const thisNode = getNode(id);
  const parentNode = thisNode?.parentId ? getNode(thisNode.parentId) : null;
  const isSubNode = parentNode && parentNode.type !== "frame";
  const isInERD = parentNode && parentNode.type === "frame" && (parentNode.data as any)?.frameType === "er";
  const canHaveSubNodes = (!parentNode || parentNode.type === "frame") && !isInERD;

  const showHandles = hovered || selected || isConnecting;
  const dashArray = getDashArray(d.borderStyle || "solid", d.borderWidth || 2);

  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(d.label || "");
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync state if label changes externally
  useEffect(() => {
    if (!isEditing) {
      setInputValue(d.label || "");
    }
  }, [d.label, isEditing]);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing) {
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 30);
    }
  }, [isEditing]);

  const saveLabel = useCallback(() => {
    setIsEditing(false);
    const trimmed = inputValue.trim();
    if (trimmed === d.label) return;
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
  }, [id, inputValue, d.label, setNodes]);

  const cancelLabel = useCallback(() => {
    setIsEditing(false);
    setInputValue(d.label || "");
  }, [d.label]);

  const handleAddSubNode = useCallback(() => {
    const newId = Math.random().toString(36).substring(2, 9);
    setNodes((ns) => {
      const parentNode = ns.find((n) => n.id === id);
      const parentWidth = parentNode?.width ?? 160;
      const parentHeight = parentNode?.height ?? 80;

      const newSubNode = {
        id: newId,
        type: "custom",
        parentId: id,
        extent: "parent" as const,
        position: {
          x: 10 + Math.random() * (parentWidth - 90),
          y: 35 + Math.random() * (parentHeight - 55),
        },
        width: 80,
        height: 36,
        data: {
          label: "Sub-node",
          shape: "rounded",
          bgColor: theme.id === "light" ? "#e0f2fe" : "#0c4a6e",
          borderColor: theme.accent,
          textColor: theme.id === "light" ? "#0369a1" : "#e0f2fe",
          borderWidth: 1.5,
          borderStyle: "solid",
          fontSize: 10,
        },
      };
      return [...ns, newSubNode];
    });
  }, [id, setNodes, theme]);

  const LucideIcon = d.iconName ? (Icons as unknown as Record<string, React.ElementType>)[d.iconName] : null;

  const handleStyle = isConnecting
    ? {
        ...HANDLE_STYLE,
        width: 10,
        height: 10,
        background: `${theme.accent}40`,
        border: `2px solid ${theme.accent}99`,
        borderRadius: "50%",
        opacity: 1,
      }
    : { ...HANDLE_STYLE, opacity: showHandles ? 1 : 0 };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ width: w, height: h, position: "relative", userSelect: "none" }}
    >
      {selected && canHaveSubNodes && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleAddSubNode();
          }}
          className="absolute top-[-24px] right-0 w-6 h-6 flex items-center justify-center rounded-lg text-white z-50 transition-all shadow-md nodrag nopan hover:opacity-90"
          style={{ background: theme.accent }}
          title="Add Sub-node"
        >
          <Icons.Plus className="w-4 h-4" />
        </button>
      )}
      <NodeResizer
        isVisible={selected}
        minWidth={isSubNode ? 40 : 60}
        minHeight={isSubNode ? 20 : 40}
        handleStyle={{ width: 6, height: 6, background: `${theme.accent}4d`, border: `1.5px solid ${theme.accent}99`, borderRadius: "50%" }}
        lineStyle={{ borderColor: theme.accent, borderWidth: 1 }}
      />
      {/* Shape SVG */}
      <svg
        width={w}
        height={h}
        style={{ position: "absolute", inset: 0, overflow: "visible" }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <ShapePath
          shape={d.shape || "rect"}
          w={w}
          h={h}
          fill={d.bgColor || theme.nodeBg}
          stroke={selected ? theme.accent : (d.borderColor || theme.accent)}
          strokeWidth={selected ? Math.max(d.borderWidth || 2, 2) : (d.borderWidth || 2)}
          strokeDasharray={dashArray}
        />
      </svg>

      {/* Selection glow */}
      {selected && (
        <div
          style={{
            position: "absolute",
            inset: -3,
            borderRadius: d.shape === "circle" ? "50%" : 10,
            boxShadow: `0 0 0 2px ${theme.accent}60, 0 0 16px ${theme.accent}40`,
            pointerEvents: "none",
          }}
        />
      )}

      {/* Content Container */}
      <div
        style={{
          position: "absolute",
          inset: (d.borderWidth || 2) + 0.5,
          borderRadius: d.shape === "circle" ? "50%" : (d.shape === "rounded" ? 11 : 5),
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          pointerEvents: "none",
        }}
      >
        {d.imageData ? (
          <>
            {/* Image section */}
            <div style={{ flex: 1, width: "100%", position: "relative", overflow: "hidden" }}>
              <img
                src={d.imageData}
                alt=""
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </div>
            {/* Text/Label section at the bottom */}
            <div
              style={{
                height: Math.max(28, (d.fontSize || 13) + 12),
                width: "100%",
                background: "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 4,
                padding: "2px 8px",
              }}
            >
              {isEditing ? (
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onBlur={saveLabel}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveLabel();
                    if (e.key === "Escape") cancelLabel();
                  }}
                  className="nodrag nopan"
                  style={{
                    width: "90%",
                    background: "rgba(255, 255, 255, 0.1)",
                    color: d.textColor || theme.nodeText,
                    fontSize: d.fontSize || 13,
                    fontWeight: 500,
                    border: `1px solid ${selected ? theme.accent : (d.borderColor || theme.accent)}`,
                    borderRadius: "4px",
                    padding: "2px 6px",
                    textAlign: "center",
                    outline: "none",
                    fontFamily: "Inter, sans-serif",
                    pointerEvents: "all",
                  }}
                />
              ) : (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    pointerEvents: "all",
                    cursor: "text",
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditing(true);
                  }}
                  title="Click to edit label"
                >
                  {LucideIcon && (
                    <LucideIcon
                      style={{
                        width: (d.fontSize || 13) + 2,
                        height: (d.fontSize || 13) + 2,
                        color: d.textColor || theme.nodeText,
                        flexShrink: 0,
                      }}
                    />
                  )}
                  <span
                    style={{
                      color: d.textColor || theme.nodeText,
                      fontSize: d.fontSize || 13,
                      fontWeight: 500,
                      textAlign: "center",
                      wordBreak: "break-word",
                      lineHeight: 1.2,
                      maxWidth: "100%",
                      fontFamily: "Inter, sans-serif",
                    }}
                  >
                    {d.label || "Node"}
                  </span>
                </div>
              )}
            </div>
          </>
        ) : (
          /* Normal content (no image) centered vertically */
          <div
            style={{
              flex: 1,
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 3,
              padding: "6px 10px",
            }}
          >
            {isEditing ? (
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onBlur={saveLabel}
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveLabel();
                  if (e.key === "Escape") cancelLabel();
                }}
                className="nodrag nopan"
                style={{
                  width: "90%",
                  background: "rgba(255, 255, 255, 0.05)",
                  color: d.textColor || theme.nodeText,
                  fontSize: d.fontSize || 13,
                  fontWeight: 500,
                  border: `1px solid ${selected ? theme.accent : (d.borderColor || theme.accent)}`,
                  borderRadius: "4px",
                  padding: "4px 8px",
                  textAlign: "center",
                  outline: "none",
                  fontFamily: "Inter, sans-serif",
                  pointerEvents: "all",
                }}
              />
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 3,
                  pointerEvents: "all",
                  cursor: "text",
                  width: "100%",
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(true);
                }}
                title="Click to edit label"
              >
                {LucideIcon && (
                  <LucideIcon
                    style={{
                      width: (d.fontSize || 13) + 4,
                      height: (d.fontSize || 13) + 4,
                      color: d.textColor || theme.nodeText,
                      flexShrink: 0,
                    }}
                  />
                )}
                <span
                  style={{
                    color: d.textColor || theme.nodeText,
                    fontSize: d.fontSize || 13,
                    fontWeight: 500,
                    textAlign: "center",
                    wordBreak: "break-word",
                    lineHeight: 1.3,
                    maxWidth: "100%",
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  {d.label || "Node"}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Connection handles — 1 per side (Top/Left: target, Bottom/Right: source) using Loose Connection Mode */}
      {/* Top */}
      <Handle type="target" position={Position.Top} id="top-target"
        style={{ ...handleStyle, top: -5, left: "50%", transform: "translateX(-50%)" }}
        className={isConnecting ? "connection-target-active" : ""} />
      {/* Bottom */}
      <Handle type="source" position={Position.Bottom} id="bottom-source"
        style={{ ...handleStyle, bottom: -5, left: "50%", transform: "translateX(-50%)" }}
        className={isConnecting ? "connection-target-active" : ""} />
      {/* Left */}
      <Handle type="target" position={Position.Left} id="left-target"
        style={{ ...handleStyle, left: -5, top: "50%", transform: "translateY(-50%)" }}
        className={isConnecting ? "connection-target-active" : ""} />
      {/* Right */}
      <Handle type="source" position={Position.Right} id="right-source"
        style={{ ...handleStyle, right: -5, top: "50%", transform: "translateY(-50%)" }}
        className={isConnecting ? "connection-target-active" : ""} />
    </div>
  );
});


CustomNode.displayName = "CustomNode";