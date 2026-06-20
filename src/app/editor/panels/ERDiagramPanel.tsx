import { useCallback, useRef, useState } from "react";
import { motion } from "motion/react";
import {
  Database, Table, Import, Plus, Trash2, Columns, Key, ArrowRight,
  RefreshCw, Download, Check,
} from "lucide-react";
import { useEditorTheme } from "../context/EditorThemeContext";
import { generateId } from "../../db/index";
import type { GeneratedNode, GeneratedEdge } from "./ToolsPanel";

// ─── ER Entity types ───────────────────────────────────────────────────────────

export interface AREntity {
  id: string;
  name: string;
  attributes: ARAttribute[];
}

export interface ARAttribute {
  id: string;
  name: string;
  type: string;
  isPK: boolean;
  isFK: boolean;
}

export interface ARRelationship {
  id: string;
  source: string;
  target: string;
  type: "1:1" | "1:N" | "N:M";
  label: string;
}

// ─── ER Diagram Panel ───────────────────────────────────────────────────────────

interface ERDiagramPanelProps {
  onGenerate: (nodes: GeneratedNode[], edges: GeneratedEdge[]) => void;
}

const DATA_TYPES = [
  "INT", "BIGINT", "VARCHAR(255)", "TEXT", "BOOLEAN",
  "DATE", "TIMESTAMP", "DECIMAL(10,2)", "FLOAT", "UUID",
  "JSON", "ENUM", "BLOB",
];

export function ERDiagramPanel({ onGenerate }: ERDiagramPanelProps) {
  const { theme } = useEditorTheme();
  const [entities, setEntities] = useState<AREntity[]>([
    { id: generateId(), name: "Entity1", attributes: [{ id: generateId(), name: "id", type: "INT", isPK: true, isFK: false }] },
  ]);
  const [relationships, setRelationships] = useState<ARRelationship[]>([]);
  const [relSource, setRelSource] = useState("");
  const [relTarget, setRelTarget] = useState("");
  const [relType, setRelType] = useState<"1:1" | "1:N" | "N:M">("1:N");
  const [relLabel, setRelLabel] = useState("");

  const addEntity = () => {
    setEntities((prev) => [
      ...prev,
      { id: generateId(), name: `Entity${prev.length + 1}`, attributes: [{ id: generateId(), name: "id", type: "INT", isPK: true, isFK: false }] },
    ]);
  };

  const removeEntity = (id: string) => {
    setEntities((prev) => prev.filter((e) => e.id !== id));
    setRelationships((prev) => prev.filter((r) => r.source !== id && r.target !== id));
  };

  const updateEntityName = (id: string, name: string) => {
    setEntities((prev) => prev.map((e) => (e.id === id ? { ...e, name } : e)));
  };

  const addAttribute = (entityId: string) => {
    setEntities((prev) =>
      prev.map((e) =>
        e.id === entityId
          ? { ...e, attributes: [...e.attributes, { id: generateId(), name: "new_field", type: "VARCHAR(255)", isPK: false, isFK: false }] }
          : e
      )
    );
  };

  const removeAttribute = (entityId: string, attrId: string) => {
    setEntities((prev) =>
      prev.map((e) =>
        e.id === entityId
          ? { ...e, attributes: e.attributes.filter((a) => a.id !== attrId) }
          : e
      )
    );
  };

  const updateAttribute = (entityId: string, attrId: string, partial: Partial<ARAttribute>) => {
    setEntities((prev) =>
      prev.map((e) =>
        e.id === entityId
          ? {
              ...e,
              attributes: e.attributes.map((a) =>
                a.id === attrId ? { ...a, ...partial } : a
              ),
            }
          : e
      )
    );
  };

  const addRelationship = () => {
    if (!relSource || !relTarget || relSource === relTarget) return;
    const exists = relationships.find(
      (r) =>
        (r.source === relSource && r.target === relTarget) ||
        (r.source === relTarget && r.target === relSource)
    );
    if (exists) return;

    setRelationships((prev) => [
      ...prev,
      {
        id: generateId(),
        source: relSource,
        target: relTarget,
        type: relType,
        label: relLabel || relType,
      },
    ]);
    setRelLabel("");
  };

  const removeRelationship = (id: string) => {
    setRelationships((prev) => prev.filter((r) => r.id !== id));
  };

  const generateFromER = useCallback(() => {
    const entityColors = [
      "#080808", "#4f46e5", "#0284c7", "#059669", "#d97706",
      "#dc2626", "#db2777", "#080808", "#0d9488", "#a21caf",
    ];

    const nodes: GeneratedNode[] = entities.map((entity, i) => {
      const color = entityColors[i % entityColors.length];
      // Build attribute text for multi-line display
      const attrLines = entity.attributes.map((a) => {
        const pk = a.isPK ? "PK " : "";
        const fk = a.isFK ? "FK " : "";
        const key = pk || fk ? `[${pk}${fk}]` : "";
        return `${key}${a.name}: ${a.type}`;
      });
      const label = `${entity.name}\n${"-".repeat(entity.name.length)}\n${attrLines.join("\n")}`;

      return {
        id: entity.id,
        label,
        shape: "rect" as const,
        bgColor: color,
      };
    });

    const edges: GeneratedEdge[] = relationships.map((r) => ({
      id: r.id,
      source: r.source,
      target: r.target,
      label: r.type,
    }));

    onGenerate(nodes, edges);
  }, [entities, relationships, onGenerate]);

  const labelCls = "text-xs mb-1.5 block";
  const inputCls = "w-full px-3 py-2 rounded-lg text-sm focus:outline-none";
  const inputStyle = {
    background: theme.surfaceHover,
    border: `1px solid ${theme.border}`,
    color: theme.textPrimary,
  };
  const smallInputCls = "px-2 py-1.5 rounded-lg text-xs focus:outline-none";

  return (
    <div className="flex flex-col gap-4 text-sm" style={{ maxHeight: "calc(100vh - 200px)", overflowY: "auto", scrollbarWidth: "thin" }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4" style={{ color: theme.accent }} />
          <span className="text-sm font-semibold" style={{ color: theme.textPrimary }}>
            ER Diagram Designer
          </span>
        </div>
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={addEntity}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs"
            style={{ background: `${theme.accent}22`, border: `1px solid ${theme.accent}44`, color: theme.accent }}
          >
            <Plus className="w-3 h-3" /> Entity
          </motion.button>
        </div>
      </div>

      {/* Entities */}
      <div className="flex flex-col gap-3">
        {entities.map((entity) => (
          <div
            key={entity.id}
            className="rounded-xl p-3"
            style={{ border: `1px solid ${theme.border}`, background: theme.surfaceHover,
              maxWidth: '100%'  }}
              >
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 flex-1">
                <Table className="w-3.5 h-3.5" style={{ color: theme.accent }} />
                <input
                  value={entity.name}
                  onChange={(e) => updateEntityName(entity.id, e.target.value)}
                  className="flex-1 text-sm font-semibold bg-transparent border-none outline-none px-1"
                  style={{ color: theme.textPrimary }}
                  placeholder="Entity name"
                />
              </div>
              <button
                onClick={() => removeEntity(entity.id)}
                className="transition-colors"
                style={{ color: theme.textMuted }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#f87171")}
                onMouseLeave={(e) => (e.currentTarget.style.color = theme.textMuted)}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Attributes */}
            <div className="flex flex-col gap-1.5">
              {entity.attributes.map((attr) => (
                <div key={attr.id} className="flex flex-wrap items-center gap-1.5">
                  {/* Allow wrapping on small screens */}
                  <Columns className="w-3 h-3" style={{ color: theme.textMuted, flexShrink: 0 }} />
                  {attr.isPK && <Key className="w-3 h-3" style={{ color: "#fbbf24", flexShrink: 0 }} />}
                  
                  {/* Use min-width instead of fixed width */}
                  <input
                    value={attr.name}
                    onChange={(e) => updateAttribute(entity.id, attr.id, { name: e.target.value })}
                    className={smallInputCls}
                    style={{ ...inputStyle, minWidth: 90, width: 'auto', flexShrink: 0 }}
                    placeholder="field"
                  />
                  
                  <select
                    value={attr.type}
                    onChange={(e) => updateAttribute(entity.id, attr.id, { type: e.target.value })}
                    className={smallInputCls}
                    style={{ ...inputStyle, minWidth: 100, width: 'auto', flexShrink: 0 }}
                  >
                    {DATA_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  
                  {/* Remove ml-auto or use margin-left: auto with flex-wrap */}
                  <div className="flex items-center gap-1" style={{ marginLeft: 'auto' }}>
                    <label className="text-xs flex items-center gap-0.5 whitespace-nowrap" style={{ color: theme.textMuted }}>
                      <input
                        type="checkbox"
                        checked={attr.isPK}
                        onChange={(e) => updateAttribute(entity.id, attr.id, { isPK: e.target.checked })}
                        className="w-3 h-3"
                      />
                      PK
                    </label>
                    <label className="text-xs flex items-center gap-0.5 whitespace-nowrap" style={{ color: theme.textMuted }}>
                      <input
                        type="checkbox"
                        checked={attr.isFK}
                        onChange={(e) => updateAttribute(entity.id, attr.id, { isFK: e.target.checked })}
                        className="w-3 h-3"
                      />
                      FK
                    </label>
                    <button
                      onClick={() => removeAttribute(entity.id, attr.id)}
                      className="transition-colors flex-shrink-0"
                      style={{ color: "rgba(239,68,68,0.5)" }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "#f87171")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(239,68,68,0.5)")}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => addAttribute(entity.id)}
              className="mt-2 flex items-center gap-1 text-xs transition-colors"
              style={{ color: theme.textMuted }}
              onMouseEnter={(e) => (e.currentTarget.style.color = theme.accent)}
              onMouseLeave={(e) => (e.currentTarget.style.color = theme.textMuted)}
            >
              <Plus className="w-3 h-3" /> Add attribute
            </button>
          </div>
        ))}
      </div>

      {/* Relationships */}
      <div className="rounded-xl p-3" style={{ border: `1px solid ${theme.border}`, background: theme.surfaceHover }}>
        <div className="flex items-center gap-2 mb-3">
          <ArrowRight className="w-3.5 h-3.5" style={{ color: theme.accent }} />
          <span className="text-xs font-semibold" style={{ color: theme.textPrimary }}>Relationships</span>
        </div>

        <div className="flex flex-wrap gap-2 mb-3">
          <select
            value={relSource}
            onChange={(e) => setRelSource(e.target.value)}
            className={smallInputCls}
            style={{ ...inputStyle, flex: 1, minWidth: 80 }}
          >
            <option value="">From...</option>
            {entities.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
          <select
            value={relType}
            onChange={(e) => setRelType(e.target.value as "1:1" | "1:N" | "N:M")}
            className={smallInputCls}
            style={{ ...inputStyle, width: 60 }}
          >
            <option value="1:1">1:1</option>
            <option value="1:N">1:N</option>
            <option value="N:M">N:M</option>
          </select>
          <select
            value={relTarget}
            onChange={(e) => setRelTarget(e.target.value)}
            className={smallInputCls}
            style={{ ...inputStyle, flex: 1, minWidth: 80 }}
          >
            <option value="">To...</option>
            {entities.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
          <button
            onClick={addRelationship}
            disabled={!relSource || !relTarget || relSource === relTarget}
            className="px-2 py-1.5 rounded-lg text-xs disabled:opacity-40 transition-colors"
            style={{ background: `${theme.accent}22`, border: `1px solid ${theme.accent}44`, color: theme.accent }}
          >
            Add
          </button>
        </div>

        {relationships.length === 0 ? (
          <p className="text-xs" style={{ color: theme.textMuted }}>No relationships yet. Add entities and connect them.</p>
        ) : (
          <div className="flex flex-col gap-1.5">
            {relationships.map((rel) => {
              const src = entities.find((e) => e.id === rel.source);
              const tgt = entities.find((e) => e.id === rel.target);
              return (
                <div
                  key={rel.id}
                  className="flex items-center justify-between px-2 py-1.5 rounded-lg"
                  style={{ background: theme.canvas }}
                >
                  <span className="text-xs" style={{ color: theme.textPrimary }}>
                    {src?.name || "?"} <span style={{ color: theme.accent }}>{rel.type}</span> {tgt?.name || "?"}
                  </span>
                  <button
                    onClick={() => removeRelationship(rel.id)}
                    className="transition-colors"
                    style={{ color: "rgba(239,68,68,0.5)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#f87171")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(239,68,68,0.5)")}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Generate button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onClick={generateFromER}
        disabled={entities.length === 0}
        className="w-full flex flex-col items-center justify-center gap-1 py-3 px-4 rounded-xl text-primary-foreground text-sm disabled:opacity-40 font-medium"
        style={{ 
          background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}cc)`,
        }}
      >
        <div className="flex items-center gap-1">
          <RefreshCw className="w-4 h-4" />
          <span>Generate ER Diagram</span>
        </div>
        <div className="opacity-80 text-xs">
          {entities.length} entitie{entities.length !== 1 ? 's' : ''}, {relationships.length} relationship{relationships.length !== 1 ? 's' : ''}
        </div>
      </motion.button>
    </div>
  );
}