import { type Node, type Edge } from "@xyflow/react";
import { X, AlignLeft, Plus, Trash2, Sparkles, Code, Layout } from "lucide-react";
import { type CustomNodeData, type NodeShape } from "../nodes/CustomNode";
import { ColorPanel } from "./ToolsPanel";
import { IconPanel } from "./ToolsPanel";
import { ImagePanel } from "./ToolsPanel";
import { ShapePanel } from "./ToolsPanel";
import { useEditorTheme } from "../context/EditorThemeContext";
import { useEditorStore } from "../../stores/editorStore";

interface PropertiesPanelProps {
  selectedNodes: Node[];
  selectedEdges: Edge[];
  onUpdateNode: (id: string, data: Partial<CustomNodeData>) => void;
  onUpdateEdge?: (id: string, data: Partial<Edge>) => void;
  onDeleteSelected: () => void;
  allNodes?: Node[];
}

interface ERDAttribute {
  name: string;
  type: string;
  isPK: boolean;
  isFK: boolean;
}

interface ParsedERDNode {
  tableName: string;
  attributes: ERDAttribute[];
}

const DATA_TYPES = [
  "INT", "BIGINT", "VARCHAR(255)", "TEXT", "BOOLEAN",
  "DATE", "TIMESTAMP", "DECIMAL(10,2)", "FLOAT", "UUID",
  "JSON", "ENUM", "BLOB",
];

function parseERDLabel(label: string): ParsedERDNode {
  const lines = label.split("\n");
  const tableName = lines[0]?.trim() || "Table";
  const attributes: ERDAttribute[] = [];
  
  const startIdx = lines[1]?.startsWith("-") ? 2 : 1;
  
  for (let i = startIdx; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const keyMatch = line.match(/^\[(.*?)\]/);
    const keysStr = keyMatch ? keyMatch[1].toUpperCase() : "";
    const isPK = keysStr.includes("PK");
    const isFK = keysStr.includes("FK");
    
    const cleanLine = line.replace(/^\[.*?\]/, "").trim();
    const parts = cleanLine.split(":");
    const name = parts[0]?.trim() || "field";
    const type = parts[1]?.trim() || "VARCHAR(255)";
    
    attributes.push({ name, type, isPK, isFK });
  }
  
  return { tableName, attributes };
}

function formatERDLabel(tableName: string, attributes: ERDAttribute[]): string {
  const attrLines = attributes.map((a) => {
    const pk = a.isPK ? "PK " : "";
    const fk = a.isFK ? "FK " : "";
    const key = pk || fk ? `[${pk.trim()}${fk ? " " + fk.trim() : ""}]` : "";
    return `${key}${a.name}: ${a.type}`;
  });
  return `${tableName}\n${"-".repeat(Math.max(tableName.length, 10))}\n${attrLines.join("\n")}`;
}

export function PropertiesPanel({
  selectedNodes, selectedEdges, onUpdateNode, onUpdateEdge, onDeleteSelected, allNodes = [],
}: PropertiesPanelProps) {
  const { theme } = useEditorTheme();
  const hasSelection = selectedNodes.length > 0 || selectedEdges.length > 0;
  const setActiveFrameId = useEditorStore((s) => s.setActiveFrameId);
  const setActiveFrameMode = useEditorStore((s) => s.setActiveFrameMode);

  const labelCls = "text-xs mb-1.5 block";
  const inputCls = "w-full px-3 py-2 rounded-xl text-sm focus:outline-none";
  const inputStyle = {
    background: theme.surfaceHover,
    border: `1px solid ${theme.border}`,
    color: theme.textPrimary,
  };
  const focusAccent = theme.accent;

  const handleFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.target.style.borderColor = focusAccent + "66";
  };
  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.target.style.borderColor = theme.border;
  };

  if (!hasSelection) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-6">
        <AlignLeft className="w-7 h-7 mb-3" style={{ color: theme.textMuted, opacity: 0.5 }} />
        <p style={{ color: theme.textMuted, fontSize: "0.8rem" }}>Select a node or connection to edit its properties</p>
      </div>
    );
  }

  if (selectedEdges.length === 1 && selectedNodes.length === 0) {
    const edge = selectedEdges[0];
    const updateEdge = (partial: Partial<Edge>) => onUpdateEdge?.(edge.id, partial);

    return (
      <div className="flex flex-col h-full overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
        <div
          className="p-4 flex items-center justify-between flex-shrink-0"
          style={{ borderBottom: `1px solid ${theme.border}` }}
        >
          <span className="text-sm font-semibold" style={{ fontFamily: "Plus Jakarta Sans, sans-serif", color: theme.textPrimary }}>
            Edge Properties
          </span>
          <button
            onClick={onDeleteSelected}
            className="text-xs flex items-center gap-1 px-2 py-1 rounded-lg transition-colors"
            style={{ color: "#f87171" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(239,68,68,0.1)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <X className="w-3 h-3" /> Delete
          </button>
        </div>

        <div className="p-4 flex flex-col gap-5">
          {/* Label / Note */}
          <div>
            <label className={labelCls} style={{ color: theme.textMuted }}>Note / Label</label>
            <textarea
              rows={2}
              value={typeof edge.label === "string" ? edge.label : ""}
              onChange={(e) => updateEdge({ label: e.target.value })}
              onFocus={handleFocus}
              onBlur={handleBlur}
              placeholder="Add connection note..."
              className="w-full px-3 py-2 rounded-xl text-sm resize-none focus:outline-none"
              style={{ ...inputStyle, lineHeight: 1.4 }}
            />
          </div>

          {/* Line Type */}
          <div>
            <label className={labelCls} style={{ color: theme.textMuted }}>Line Type</label>
            <select
              value={edge.type || "default"}
              onChange={(e) => updateEdge({ type: e.target.value })}
              onFocus={handleFocus}
              onBlur={handleBlur}
              className="w-full px-3 py-2 rounded-xl text-sm focus:outline-none"
              style={inputStyle}
            >
              <option value="default">Curved</option>
              <option value="step">Elbow (Step)</option>
            </select>
          </div>

          {/* Style Options */}
          <div>
            <label className={labelCls} style={{ color: theme.textMuted }}>Style Options</label>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 text-xs cursor-pointer" style={{ color: theme.textPrimary }}>
                <input
                  type="checkbox"
                  checked={!!edge.animated}
                  onChange={(e) => updateEdge({ animated: e.target.checked })}
                  style={{ accentColor: theme.accent }}
                  className="rounded"
                />
                Animated Flow
              </label>
            </div>
          </div>

          {/* Color */}
          <div>
            <label className={labelCls} style={{ color: theme.textMuted }}>Line Color</label>
            <ColorPanel
              bgColor={edge.style?.stroke || theme.accent}
              borderColor={edge.style?.stroke || theme.accent}
              textColor={edge.style?.stroke || theme.accent}
              onChange={(_, val) => {
                updateEdge({
                  style: {
                    ...edge.style,
                    stroke: val,
                    strokeWidth: edge.style?.strokeWidth || 2
                  }
                });
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  if (selectedNodes.length === 1) {
    const node = selectedNodes[0];
    const d = (node.data || {}) as unknown as CustomNodeData;
    const update = (partial: Partial<CustomNodeData>) => onUpdateNode(node.id, partial);

    const isFrame = node.type === "frame";

    if (isFrame) {
      return (
        <div className="flex flex-col h-full overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
          <div
            className="p-4 flex items-center justify-between flex-shrink-0"
            style={{ borderBottom: `1px solid ${theme.border}` }}
          >
            <span className="text-sm font-semibold" style={{ fontFamily: "Plus Jakarta Sans, sans-serif", color: theme.textPrimary }}>
              Frame Properties
            </span>
            <button
              onClick={onDeleteSelected}
              className="text-xs flex items-center gap-1 px-2 py-1 rounded-lg transition-colors cursor-pointer"
              style={{ color: "#f87171" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(239,68,68,0.1)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>
          </div>

          <div className="p-4 flex flex-col gap-5">
            {/* Title / Name */}
            <div>
              <label className={labelCls} style={{ color: theme.textMuted }}>Frame Title</label>
              <input
                type="text"
                value={d.label || ""}
                onChange={(e) => update({ label: e.target.value })}
                onFocus={handleFocus}
                onBlur={handleBlur}
                className={inputCls}
                style={inputStyle}
              />
            </div>

            {/* Frame Type Badge */}
            <div>
              <label className={labelCls} style={{ color: theme.textMuted }}>Frame Type</label>
              <div
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold"
                style={{
                  background: theme.surfaceHover,
                  border: `1px solid ${theme.border}`,
                  color: theme.accent,
                }}
              >
                <Layout className="w-3.5 h-3.5" />
                <span>{d.frameType === "er" ? "Entity Relationship (ERD)" : "Flowchart"}</span>
              </div>
            </div>

            {/* Framer Workspace Panels */}
            <div className="flex flex-col gap-2">
              <label className={labelCls} style={{ color: theme.textMuted }}>Framer Workspace Panels</label>
              <div className="flex flex-col gap-2.5">
                <button
                  onClick={() => {
                    setActiveFrameId(node.id);
                    setActiveFrameMode("ai");
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all cursor-pointer"
                  style={{
                    background: theme.surfaceHover,
                    borderColor: theme.border,
                    color: theme.textPrimary,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = theme.accent + "55";
                    e.currentTarget.style.background = `${theme.accent}08`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = theme.border;
                    e.currentTarget.style.background = theme.surfaceHover;
                  }}
                >
                  <div className="flex items-center gap-2.5">
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: `${theme.accent}15`, color: theme.accent }}
                    >
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold">AI Assistant</div>
                      <div className="text-[10px]" style={{ color: theme.textMuted }}>Prompt AI to build this frame</div>
                    </div>
                  </div>
                  <div className="text-xs font-semibold mr-1" style={{ color: theme.accent }}>Open &rarr;</div>
                </button>

                <button
                  onClick={() => {
                    setActiveFrameId(node.id);
                    setActiveFrameMode("dsl");
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all cursor-pointer"
                  style={{
                    background: theme.surfaceHover,
                    borderColor: theme.border,
                    color: theme.textPrimary,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = theme.accent + "55";
                    e.currentTarget.style.background = `${theme.accent}08`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = theme.border;
                    e.currentTarget.style.background = theme.surfaceHover;
                  }}
                >
                  <div className="flex items-center gap-2.5">
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: `${theme.accent}15`, color: theme.accent }}
                    >
                      <Code className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold">Code Editor</div>
                      <div className="text-[10px]" style={{ color: theme.textMuted }}>View & edit diagram DSL code</div>
                    </div>
                  </div>
                  <div className="text-xs font-semibold mr-1" style={{ color: theme.accent }}>Open &rarr;</div>
                </button>
              </div>
            </div>

            {/* Frame Background Color */}
            <div>
              <label className={labelCls} style={{ color: theme.textMuted }}>Background Color</label>
              <ColorPanel
                bgColor={d.bgColor || "#C7C7C7"}
                borderColor={d.borderColor || theme.nodeBorder}
                textColor={d.textColor || theme.nodeText}
                onChange={(f, v) => update({ [f]: v })}
              />
            </div>

            {/* Dimensions */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls} style={{ color: theme.textMuted }}>Width</label>
                <input
                  type="number" min={280} max={2000} step={50}
                  value={d.width || 480}
                  onChange={(e) => update({ width: Number(e.target.value) })}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  className={inputCls}
                  style={inputStyle}
                />
              </div>
              <div>
                <label className={labelCls} style={{ color: theme.textMuted }}>Height</label>
                <input
                  type="number" min={280} max={2000} step={50}
                  value={d.height || 600}
                  onChange={(e) => update({ height: Number(e.target.value) })}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  className={inputCls}
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className={labelCls} style={{ color: theme.textMuted }}>Notes</label>
              <textarea
                rows={3}
                placeholder="Add notes for this frame..."
                value={d.notes || ""}
                onChange={(e) => update({ notes: e.target.value })}
                onFocus={handleFocus}
                onBlur={handleBlur}
                className="w-full px-3 py-2 rounded-xl text-sm resize-none focus:outline-none"
                style={{ ...inputStyle, lineHeight: 1.5 }}
              />
            </div>
          </div>
        </div>
      );
    }

    const parentFrame = allNodes.find((n) => n.id === node.parentId);
    const isInERD = parentFrame?.type === "frame" && parentFrame.data?.frameType === "er";

    if (isInERD) {
      const parsedERD = parseERDLabel(d.label || "");

      const updateERDName = (newName: string) => {
        const newLabel = formatERDLabel(newName, parsedERD.attributes);
        update({ label: newLabel });
      };
      
      const updateERDAttribute = (index: number, partial: Partial<ERDAttribute>) => {
        const updated = parsedERD.attributes.map((a, idx) => 
          idx === index ? { ...a, ...partial } : a
        );
        const newLabel = formatERDLabel(parsedERD.tableName, updated);
        update({ label: newLabel });
      };
      
      const addERDAttribute = () => {
        const newAttr: ERDAttribute = {
          name: "new_field",
          type: "VARCHAR(255)",
          isPK: false,
          isFK: false
        };
        const newLabel = formatERDLabel(parsedERD.tableName, [...parsedERD.attributes, newAttr]);
        update({ label: newLabel });
      };
      
      const removeERDAttribute = (index: number) => {
        const updated = parsedERD.attributes.filter((_, idx) => idx !== index);
        const newLabel = formatERDLabel(parsedERD.tableName, updated);
        update({ label: newLabel });
      };

      return (
        <div className="flex flex-col h-full overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
          <div
            className="p-4 flex items-center justify-between flex-shrink-0"
            style={{ borderBottom: `1px solid ${theme.border}` }}
          >
            <span className="text-sm font-semibold" style={{ fontFamily: "Plus Jakarta Sans, sans-serif", color: theme.textPrimary }}>
              Entity Properties
            </span>
            <button
              onClick={onDeleteSelected}
              className="text-xs flex items-center gap-1 px-2 py-1 rounded-lg transition-colors"
              style={{ color: "#f87171" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(239,68,68,0.1)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <X className="w-3 h-3" /> Delete
            </button>
          </div>

          <div className="p-4 flex flex-col gap-5">
            {/* Table Name */}
            <div>
              <label className={labelCls} style={{ color: theme.textMuted }}>Table Name</label>
              <input
                type="text"
                value={parsedERD.tableName}
                onChange={(e) => updateERDName(e.target.value)}
                onFocus={handleFocus}
                onBlur={handleBlur}
                className={inputCls}
                style={inputStyle}
              />
            </div>

            {/* Relation Properties (Attributes) */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className={labelCls} style={{ color: theme.textMuted, marginBottom: 0 }}>Attributes</label>
                <button
                  onClick={addERDAttribute}
                  className="flex items-center gap-1 text-[11px] px-2 py-1 rounded border transition-colors"
                  style={{
                    background: `${theme.accent}15`,
                    borderColor: `${theme.accent}44`,
                    color: theme.accent
                  }}
                >
                  <Plus className="w-3 h-3" /> Add Attribute
                </button>
              </div>
              
              <div className="flex flex-col gap-2.5">
                {parsedERD.attributes.length === 0 ? (
                  <p className="text-xs" style={{ color: theme.textMuted }}>No attributes. Add attributes to this entity.</p>
                ) : (
                  parsedERD.attributes.map((attr, idx) => (
                    <div key={idx} className="flex flex-col gap-1.5 p-2 rounded-lg border" style={{ borderColor: theme.border, background: theme.canvas }}>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={attr.name}
                          onChange={(e) => updateERDAttribute(idx, { name: e.target.value })}
                          onFocus={handleFocus}
                          onBlur={handleBlur}
                          className="flex-1 px-2 py-1 rounded text-xs focus:outline-none"
                          style={inputStyle}
                          placeholder="field_name"
                        />
                        <select
                          value={attr.type}
                          onChange={(e) => updateERDAttribute(idx, { type: e.target.value })}
                          onFocus={handleFocus}
                          onBlur={handleBlur}
                          className="px-1.5 py-1 rounded text-xs focus:outline-none"
                          style={{ ...inputStyle, width: "110px" }}
                        >
                          {DATA_TYPES.map((t) => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                        <button
                          onClick={() => removeERDAttribute(idx)}
                          className="p-1 text-red-400 hover:bg-red-500/10 rounded transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="flex items-center gap-3 px-1">
                        <label className="text-[11px] flex items-center gap-1 cursor-pointer select-none" style={{ color: theme.textMuted }}>
                          <input
                            type="checkbox"
                            checked={attr.isPK}
                            onChange={(e) => updateERDAttribute(idx, { isPK: e.target.checked })}
                            className="rounded w-3 h-3"
                            style={{ accentColor: theme.accent }}
                          />
                          Primary Key (PK)
                        </label>
                        <label className="text-[11px] flex items-center gap-1 cursor-pointer select-none" style={{ color: theme.textMuted }}>
                          <input
                            type="checkbox"
                            checked={attr.isFK}
                            onChange={(e) => updateERDAttribute(idx, { isFK: e.target.checked })}
                            className="rounded w-3 h-3"
                            style={{ accentColor: theme.accent }}
                          />
                          Foreign Key (FK)
                        </label>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Size */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls} style={{ color: theme.textMuted }}>Width</label>
                <input
                  type="number" min={60} max={500} step={10}
                  value={d.width || 160}
                  onChange={(e) => update({ width: Number(e.target.value) })}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  className={inputCls}
                  style={inputStyle}
                />
              </div>
              <div>
                <label className={labelCls} style={{ color: theme.textMuted }}>Height</label>
                <input
                  type="number" min={40} max={400} step={10}
                  value={d.height || 80}
                  onChange={(e) => update({ height: Number(e.target.value) })}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  className={inputCls}
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Colors */}
            <div>
              <label className={labelCls} style={{ color: theme.textMuted }}>Colors</label>
              <ColorPanel
                bgColor={d.bgColor || theme.nodeBg}
                borderColor={d.borderColor || theme.nodeBorder}
                textColor={d.textColor || theme.nodeText}
                onChange={(f, v) => update({ [f]: v })}
              />
            </div>

            {/* Notes */}
            <div>
              <label className={labelCls} style={{ color: theme.textMuted }}>Notes</label>
              <textarea
                rows={3}
                placeholder="Add notes for this node..."
                value={d.notes || ""}
                onChange={(e) => update({ notes: e.target.value })}
                onFocus={handleFocus}
                onBlur={handleBlur}
                className="w-full px-3 py-2 rounded-xl text-sm resize-none focus:outline-none"
                style={{ ...inputStyle, lineHeight: 1.5 }}
              />
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col h-full overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
        <div
          className="p-4 flex items-center justify-between flex-shrink-0"
          style={{ borderBottom: `1px solid ${theme.border}` }}
        >
          <span className="text-sm font-semibold" style={{ fontFamily: "Plus Jakarta Sans, sans-serif", color: theme.textPrimary }}>
            Node Properties
          </span>
          <button
            onClick={onDeleteSelected}
            className="text-xs flex items-center gap-1 px-2 py-1 rounded-lg transition-colors"
            style={{ color: "#f87171" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(239,68,68,0.1)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <X className="w-3 h-3" /> Delete
          </button>
        </div>

        <div className="p-4 flex flex-col gap-5">
          {/* Label */}
          <div>
            <label className={labelCls} style={{ color: theme.textMuted }}>Label</label>
            <textarea
              rows={2}
              value={d.label || ""}
              onChange={(e) => update({ label: e.target.value })}
              onFocus={handleFocus}
              onBlur={handleBlur}
              className="w-full px-3 py-2 rounded-xl text-sm resize-none focus:outline-none"
              style={{ ...inputStyle, lineHeight: 1.4 }}
            />
          </div>

          {/* Font size */}
          <div>
            <label className={labelCls} style={{ color: theme.textMuted }}>
              <span className="flex items-center justify-between">
                Font Size
                <span style={{ color: theme.textPrimary }}>{d.fontSize || 13}px</span>
              </span>
            </label>
            <input
              type="range" min={9} max={24} step={1}
              value={d.fontSize || 13}
              onChange={(e) => update({ fontSize: Number(e.target.value) })}
              className="w-full"
              style={{ accentColor: theme.accent }}
            />
          </div>

          {/* Size */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls} style={{ color: theme.textMuted }}>Width</label>
              <input
                type="number" min={60} max={500} step={10}
                value={d.width || 160}
                onChange={(e) => update({ width: Number(e.target.value) })}
                onFocus={handleFocus}
                onBlur={handleBlur}
                className={inputCls}
                style={inputStyle}
              />
            </div>
            <div>
              <label className={labelCls} style={{ color: theme.textMuted }}>Height</label>
              <input
                type="number" min={40} max={400} step={10}
                value={d.height || 80}
                onChange={(e) => update({ height: Number(e.target.value) })}
                onFocus={handleFocus}
                onBlur={handleBlur}
                className={inputCls}
                style={inputStyle}
              />
            </div>
          </div>

          {/* Shape */}
          <div>
            <label className={labelCls} style={{ color: theme.textMuted }}>Shape</label>
            <ShapePanel value={d.shape || "rect"} onChange={(s) => update({ shape: s })} onAddNode={() => {}} />
          </div>

          {/* Colors */}
          <div>
            <label className={labelCls} style={{ color: theme.textMuted }}>Colors</label>
            <ColorPanel
              bgColor={d.bgColor || theme.nodeBg}
              borderColor={d.borderColor || theme.nodeBorder}
              textColor={d.textColor || theme.nodeText}
              onChange={(f, v) => update({ [f]: v })}
            />
          </div>

          {/* Border */}
          <div>
            <label className={labelCls} style={{ color: theme.textMuted }}>Border</label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs mb-1 block" style={{ color: theme.textMuted + "99" }}>Width</label>
                <input
                  type="range" min={0} max={8} step={1}
                  value={d.borderWidth || 2}
                  onChange={(e) => update({ borderWidth: Number(e.target.value) })}
                  className="w-full"
                  style={{ accentColor: theme.accent }}
                />
              </div>
              <div>
                <label className="text-xs mb-1 block" style={{ color: theme.textMuted + "99" }}>Style</label>
                <select
                  value={d.borderStyle || "solid"}
                  onChange={(e) => update({ borderStyle: e.target.value as "solid" | "dashed" | "dotted" })}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  className="w-full px-2 py-1.5 rounded-lg text-xs focus:outline-none"
                  style={inputStyle}
                >
                  <option value="solid">Solid</option>
                  <option value="dashed">Dashed</option>
                  <option value="dotted">Dotted</option>
                </select>
              </div>
            </div>
          </div>

          {/* Icon */}
          <div>
            <label className={labelCls} style={{ color: theme.textMuted }}>Icon</label>
            <IconPanel value={d.iconName} onChange={(n) => update({ iconName: n })} />
          </div>

          {/* Image */}
          <div>
            <label className={labelCls} style={{ color: theme.textMuted }}>Image</label>
            <ImagePanel value={d.imageData} onChange={(v) => update({ imageData: v })} />
          </div>

          {/* Notes */}
          <div>
            <label className={labelCls} style={{ color: theme.textMuted }}>Notes</label>
            <textarea
              rows={3}
              placeholder="Add notes for this node..."
              value={d.notes || ""}
              onChange={(e) => update({ notes: e.target.value })}
              onFocus={handleFocus}
              onBlur={handleBlur}
              className="w-full px-3 py-2 rounded-xl text-sm resize-none focus:outline-none"
              style={{ ...inputStyle, lineHeight: 1.5 }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold" style={{ color: theme.textPrimary }}>
          {selectedNodes.length} nodes, {selectedEdges.length} edges selected
        </span>
        <button onClick={onDeleteSelected} className="text-xs" style={{ color: "#f87171" }}>
          Delete all
        </button>
      </div>
    </div>
  );
}
