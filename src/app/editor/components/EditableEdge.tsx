import React, { useState, useRef, useEffect, useCallback, memo, createContext, useContext } from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  getSmoothStepPath,
  type EdgeProps,
  useReactFlow,
  useConnection,
} from "@xyflow/react";
import { useEditorTheme } from "../context/EditorThemeContext";

export const EdgeEditContext = createContext<{
  editingEdgeId: string | null;
  setEditingEdgeId: (id: string | null) => void;
}>({
  editingEdgeId: null,
  setEditingEdgeId: () => {},
});

interface EditableEdgeProps extends EdgeProps {
  pathType: "bezier" | "step";
  zIndex?: number;
}

export const EditableEdge = memo(({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  label,
  selected,
  pathType,
  animated,
}: EditableEdgeProps) => {
  const { theme } = useEditorTheme();
  const { setEdges, getEdges } = useReactFlow();
  const connection = useConnection();
  const isConnecting = connection.inProgress;

  const thisEdge = getEdges().find((e) => e.id === id);
  const edgeZ = thisEdge?.zIndex;

  const { editingEdgeId, setEditingEdgeId } = useContext(EdgeEditContext);
  const isEditing = editingEdgeId === id;
  const [val, setVal] = useState(typeof label === "string" ? label : "");
  const inputRef = useRef<HTMLInputElement>(null);

  // Synchronize local input value with actual edge label whenever entering edit mode or label changes
  useEffect(() => {
    if (isEditing || typeof label === "string") {
      setVal(typeof label === "string" ? label : "");
    }
  }, [isEditing, label]);

  // Focus and select all text in input when entering editing mode
  useEffect(() => {
    if (isEditing) {
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
    }
  }, [isEditing]);

  const [edgePath, labelX, labelY] = pathType === "step"
    ? getSmoothStepPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
      })
    : getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
      });

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingEdgeId(id);
  }, [id, setEditingEdgeId]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.stopPropagation();
      commit();
    } else if (e.key === "Escape") {
      e.stopPropagation();
      setEditingEdgeId(null);
      setVal(typeof label === "string" ? label : "");
    }
  }, [label, setEditingEdgeId]);

  const commit = useCallback(() => {
    setEditingEdgeId(null);
    setEdges((eds) =>
      eds.map((e) => {
        if (e.id === id) {
          return {
            ...e,
            label: val.trim(),
          };
        }
        return e;
      })
    );
  }, [id, val, setEdges, setEditingEdgeId]);

  const hasLabel = typeof label === "string" && label.trim().length > 0;

  return (
    <>
      {/* Main edge path — wider invisible hit area for interaction */}
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={style}
        interactionWidth={20}
      />

      {/* Tracking dot/circle animation along the path */}
      {animated && (
        <circle r="4" fill={style.stroke || theme.accent} style={{ filter: `drop-shadow(0 0 3px ${style.stroke || theme.accent})` }}>
          <animateMotion
            dur="3s"
            repeatCount="indefinite"
            path={edgePath}
          />
        </circle>
      )}

      {/* Edge label renderer using portal-based HTML to stack in front of edge paths */}
      {(hasLabel || isEditing || selected) && (
        <EdgeLabelRenderer>
          <div
            className="nodrag nopan"
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: isConnecting ? "none" : "all",
              zIndex: Math.max(1, (edgeZ || 0) + 1),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {isEditing ? (
              <input
                ref={inputRef}
                type="text"
                value={val}
                onChange={(e) => setVal(e.target.value)}
                onBlur={commit}
                onKeyDown={handleKeyDown}
                style={{
                  background: theme.nodeBg,
                  color: theme.textPrimary,
                  border: `1px solid ${theme.accent}`,
                  borderRadius: "8px",
                  padding: "4px 10px",
                  fontSize: "11px",
                  fontFamily: "inherit",
                  fontWeight: 600,
                  outline: "none",
                  minWidth: "90px",
                  textAlign: "center",
                  boxShadow: "0 10px 25px -5px rgba(0,0,0,0.3), 0 8px 10px -6px rgba(0,0,0,0.3)",
                }}
              />
            ) : (
              <div
                onClick={handleClick}
                style={{
                  background: theme.nodeBg,
                  color: hasLabel ? theme.textPrimary : theme.textMuted,
                  border: hasLabel
                    ? `1px solid ${selected ? theme.accent : theme.border}`
                    : `1px dashed ${selected ? theme.accent : theme.border}`,
                  borderRadius: "8px",
                  padding: hasLabel ? "4px 10px" : "4px 8px",
                  fontSize: "11px",
                  fontWeight: 600,
                  cursor: "pointer",
                  userSelect: "none",
                  boxShadow: hasLabel ? "0 4px 12px -2px rgba(0,0,0,0.12)" : "none",
                  transition: "opacity 0.2s, border-color 0.2s, background-color 0.2s, box-shadow 0.2s",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: hasLabel ? 1 : 0.85,
                  transform: selected ? "scale(1.03)" : "scale(1)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = "1";
                  e.currentTarget.style.borderColor = theme.accent;
                  e.currentTarget.style.transform = "scale(1.05)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = hasLabel ? "1" : "0.85";
                  e.currentTarget.style.borderColor = selected ? theme.accent : theme.border;
                  e.currentTarget.style.transform = selected ? "scale(1.03)" : "scale(1)";
                }}
                title="Click to edit label"
              >
                {hasLabel ? label : "+ label"}
              </div>
            )}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
});

EditableEdge.displayName = "EditableEdge";
