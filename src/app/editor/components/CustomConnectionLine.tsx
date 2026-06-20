import React from "react";
import { type ConnectionLineComponentProps, getBezierPath } from "@xyflow/react";
import { useEditorTheme } from "../context/EditorThemeContext";

export function CustomConnectionLine({
  fromX,
  fromY,
  toX,
  toY,
  fromPosition,
  toPosition,
}: ConnectionLineComponentProps) {
  const { theme } = useEditorTheme();

  const [path] = getBezierPath({
    sourceX: fromX,
    sourceY: fromY,
    sourcePosition: fromPosition,
    targetX: toX,
    targetY: toY,
    targetPosition: toPosition,
  });

  return (
    <g>
      {/* Glow behind the line */}
      <path
        d={path}
        fill="none"
        stroke={theme.accent}
        strokeWidth={6}
        strokeOpacity={0.15}
        className="animated"
      />
      {/* Main connection line */}
      <path
        d={path}
        fill="none"
        stroke={theme.accent}
        strokeWidth={2}
        strokeDasharray="6 3"
        strokeLinecap="round"
        className="animated"
      />
      {/* Endpoint circle at cursor position */}
      <circle
        cx={toX}
        cy={toY}
        r={4}
        fill={theme.accent}
        stroke="white"
        strokeWidth={1.5}
        style={{
          filter: `drop-shadow(0 0 4px ${theme.accent})`,
        }}
      />
    </g>
  );
}
