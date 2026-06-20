import { useState, useCallback, useMemo } from "react";
import { motion } from "motion/react";
import { Code, Play, Copy, Check, RefreshCw, FileCode, AlertCircle, Download } from "lucide-react";
import { useEditorTheme } from "../context/EditorThemeContext";
import { generateId } from "../../db/index";
import type { GeneratedNode, GeneratedEdge } from "./ToolsPanel";

// ─── DSL Types ─────────────────────────────────────────────────────────────────

export interface DSLNodeDef {
  id: string;
  label: string;
  shape: "rect" | "rounded" | "circle" | "diamond" | "hexagon" | "parallelogram" | "triangle" | "cylinder" | "cloud" | "process" | "decision";
  color?: string;
  group?: string;
  icon?: string;
}

export interface DSLEdgeDef {
  source: string;
  target: string;
  label?: string;
  dashed?: boolean;
}

export interface DSLDiagram {
  title?: string;
  nodes: DSLNodeDef[];
  edges: DSLEdgeDef[];
}

// ─── DSL Parser ─────────────────────────────────────────────────────────────────

const DEFAULT_SHAPES: Record<string, DSLNodeDef["shape"]> = {
  rect: "rect",
  rounded: "rounded",
  circle: "circle",
  diamond: "diamond",
  hexagon: "hexagon",
  parallelogram: "parallelogram",
  triangle: "triangle",
  cylinder: "cylinder",
  cloud: "cloud",
  process: "process",
  decision: "decision",
};

function parseDSL(source: string): DSLDiagram {
  const diagram: DSLDiagram = { nodes: [], edges: [] };
  const lines = source.split("\n");
  let currentGroup: string | undefined;

  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith("//") || line.startsWith("#")) continue;

    // Group: [groupName]
    const groupMatch = line.match(/^\[(.+)\]$/);
    if (groupMatch) {
      currentGroup = groupMatch[1];
      continue;
    }

    // Title: @title "My Title"
    const titleMatch = line.match(/^@title\s+"(.+)"$/);
    if (titleMatch) {
      diagram.title = titleMatch[1];
      continue;
    }

    // Edge: node1 -> node2 [label="xyz"] [dashed]
    const edgeMatch = line.match(
      /^(\w+)\s*(->|-->)\s*(\w+)(?:\s+\[label="([^"]*)"\])?(?:\s+\[(dashed)\])?$/
    );
    if (edgeMatch) {
      diagram.edges.push({
        source: edgeMatch[1],
        target: edgeMatch[3],
        label: edgeMatch[4] || undefined,
        dashed: edgeMatch[5] === "dashed",
      });
      continue;
    }

    // Node: nodeName [label="My Label"] [shape=rect] [color=#hex] [icon=IconName]
    const nodeMatch = line.match(
      /^(\w+)(?:\s+\[label="([^"]*)"\])?(?:\s+\[shape=(\w+)\])?(?:\s+\[color=([^\]]+)\])?(?:\s+\[icon=(\w+)\])?$/
    );
    if (nodeMatch) {
      const id = nodeMatch[1];
      const label = nodeMatch[2] || id;
      const shapeName = nodeMatch[3]?.toLowerCase() || "rect";
      const shape = DEFAULT_SHAPES[shapeName] || "rect";
      const color = nodeMatch[4] || undefined;
      const icon = nodeMatch[5] || undefined;

      diagram.nodes.push({
        id,
        label,
        shape,
        color,
        group: currentGroup,
        icon,
      });
      continue;
    }
  }

  // Add implicit nodes for edge endpoints
  for (const edge of diagram.edges) {
    if (!diagram.nodes.find((n) => n.id === edge.source)) {
      diagram.nodes.push({ id: edge.source, label: edge.source, shape: "rect" });
    }
    if (!diagram.nodes.find((n) => n.id === edge.target)) {
      diagram.nodes.push({ id: edge.target, label: edge.target, shape: "rect" });
    }
  }

  return diagram;
}

// ─── Presets / Examples ─────────────────────────────────────────────────────────

const EXAMPLE_DSLS: Record<string, string> = {
  "Simple Flow": `@title "User Login Flow"

[Frontend]
LoginPage [label="Login Page"] [shape=rounded]
AuthForm [label="Auth Form"] [shape=rect] [color=#4f46e5]

[Backend]
AuthAPI [label="Auth API"] [shape=rounded] [color=#080808]
UserDB [label="Users DB"] [shape=cylinder] [color=#059669]

LoginPage -> AuthForm
AuthForm -> AuthAPI [label="POST /login"]
AuthAPI -> UserDB [label="SELECT *"] [dashed]
AuthAPI -> LoginPage [label="token"]`,

  "Architecture": `@title "System Architecture"

[Frontend]
Client [label="Web Client"] [shape=rounded] [color=#4f46e5]
CDN [label="CDN"] [shape=cloud] [color=#080808]

[Backend]
LB [label="Load Balancer"] [shape=hexagon] [color=#0284c7]
API [label="API Server"] [shape=rect] [color=#0369a1]
Cache [label="Redis Cache"] [shape=cylinder] [color=#059669]

[Data]
DB [label="PostgreSQL"] [shape=cylinder] [color=#16a34a]
Queue [label="Message Queue"] [shape=parallelogram] [color=#d97706]

Client -> CDN
CDN -> LB
LB -> API
API -> Cache
API -> DB
API -> Queue [dashed]`,

  "ER Diagram": `@title "E-Commerce ER"

user [label="User"] [shape=rect] [color=#080808]
order [label="Order"] [shape=rect] [color=#4f46e5]
product [label="Product"] [shape=rect] [color=#0284c7]
category [label="Category"] [shape=rect] [color=#059669]

user -> order [label="1:N"]
order -> product [label="N:M"]
product -> category [label="N:1"]`,

  "Flow Chart": `@title "Decision Flow"

start [label="Start"] [shape=circle] [color=#080808]
input [label="Get Input"] [shape=process] [color=#4f46e5]
validate [label="Is Valid?"] [shape=decision] [color=#d97706]
process [label="Process Data"] [shape=rect] [color=#059669]
error [label="Show Error"] [shape=rounded] [color=#dc2626]
end [label="End"] [shape=circle] [color=#080808]

start -> input
input -> validate
validate -> process [label="Yes"]
validate -> error [label="No"]
process -> end
error -> input [dashed]`,
};

const SHAPE_TABLE: { shape: DSLNodeDef["shape"]; label: string }[] = [
  { shape: "rect", label: "rect" },
  { shape: "rounded", label: "rounded" },
  { shape: "circle", label: "circle" },
  { shape: "diamond", label: "diamond" },
  { shape: "hexagon", label: "hexagon" },
  { shape: "parallelogram", label: "parallelogram" },
  { shape: "triangle", label: "triangle" },
  { shape: "cylinder", label: "cylinder" },
  { shape: "cloud", label: "cloud" },
  { shape: "process", label: "process" },
  { shape: "decision", label: "decision" },
];

// ─── DSL Panel ──────────────────────────────────────────────────────────────────

interface DSLPanelProps {
  onGenerate: (nodes: GeneratedNode[], edges: GeneratedEdge[]) => void;
}

export function DSLPanel({ onGenerate }: DSLPanelProps) {
  const { theme } = useEditorTheme();
  const [source, setSource] = useState(EXAMPLE_DSLS["Simple Flow"]);
  const [parsed, setParsed] = useState<DSLDiagram | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [exampleKey, setExampleKey] = useState("Simple Flow");
  const [copied, setCopied] = useState(false);

  const parseSource = useCallback(() => {
    try {
      setError(null);
      const result = parseDSL(source);
      if (result.nodes.length === 0) {
        setError("No nodes found. Check your syntax.");
        return;
      }
      setParsed(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Parse error");
      setParsed(null);
    }
  }, [source]);

  const applyToCanvas = useCallback(() => {
    if (!parsed) return;

    const colorPalette = [
      "#080808", "#4f46e5", "#0284c7", "#059669", "#d97706",
      "#dc2626", "#db2777", "#0d9488", "#080808", "#a21caf",
    ];

    const nodes: GeneratedNode[] = parsed.nodes.map((n, i) => ({
      id: n.id,
      label: n.label,
      shape: n.shape,
      bgColor: n.color || colorPalette[i % colorPalette.length],
    }));

    const edges: GeneratedEdge[] = parsed.edges.map((e, i) => ({
      id: `dsl-e-${i}-${e.source}-${e.target}`,
      source: e.source,
      target: e.target,
      label: e.label,
    }));

    onGenerate(nodes, edges);
  }, [parsed, onGenerate]);

  const loadExample = (key: string) => {
    setExampleKey(key);
    setSource(EXAMPLE_DSLS[key]);
    setParsed(null);
  };

  const copySource = () => {
    navigator.clipboard.writeText(source);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const inputStyle = {
    background: theme.surfaceHover,
    border: `1px solid ${theme.border}`,
    color: theme.textPrimary,
  };

  return (
    <div className="flex flex-col gap-3 text-sm" style={{ height: "calc(100vh - 120px)", overflow: "hidden" }}>
      {/* Examples */}
      <div className="flex flex-wrap gap-1.5">
        {Object.keys(EXAMPLE_DSLS).map((key) => (
          <button
            key={key}
            onClick={() => loadExample(key)}
            className="px-2 py-1 rounded-lg text-xs transition-all whitespace-nowrap"
            style={{
              background: exampleKey === key ? `${theme.accent}22` : theme.surfaceHover,
              border: `1px solid ${exampleKey === key ? `${theme.accent}55` : theme.border}`,
              color: exampleKey === key ? theme.accent : theme.textMuted,
            }}
          >
            {key}
          </button>
        ))}
      </div>

      {/* Editor */}
      <div className="flex-1 flex flex-col gap-2" style={{ minHeight: 0 }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code className="w-3.5 h-3.5" style={{ color: theme.accent }} />
            <span className="text-xs font-semibold" style={{ color: theme.textPrimary }}>Diagram DSL</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={copySource}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-colors"
              style={{ color: theme.textMuted }}
              onMouseEnter={(e) => (e.currentTarget.style.color = theme.textPrimary)}
              onMouseLeave={(e) => (e.currentTarget.style.color = theme.textMuted)}
            >
              {copied ? <Check className="w-3 h-3" style={{ color: "#34d399" }} /> : <Copy className="w-3 h-3" />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </div>

        <textarea
          value={source}
          onChange={(e) => setSource(e.target.value)}
          className="w-full flex-1 px-3 py-3 rounded-xl text-xs font-mono leading-relaxed resize-none focus:outline-none"
          style={{
            ...inputStyle,
            minHeight: 160,
            lineHeight: 1.6,
            scrollbarWidth: "thin",
          }}
          placeholder="// Type your diagram DSL here..."
          spellCheck={false}
        />
      </div>

      {/* Syntax help */}
      <details className="group">
        <summary className="text-xs cursor-pointer" style={{ color: theme.textMuted }}>
          DSL Syntax Reference
        </summary>
        <div className="mt-2 p-3 rounded-xl text-xs" style={{ background: theme.surfaceHover, border: `1px solid ${theme.border}`, lineHeight: 1.8 }}>
          <p style={{ color: theme.textMuted }}>
            <span style={{ color: theme.accent }}>@title "My Diagram"</span> — Set title<br />
            <span style={{ color: theme.accent }}>[Group Name]</span> — Start a group<br />
            <span style={{ color: theme.accent }}>nodeId</span> — Define a node<br />
            <span style={{ color: theme.accent }}>[label="Text"]</span> — Set node label<br />
            <span style={{ color: theme.accent }}>[shape=rounded]</span> — Set shape<br />
            <span style={{ color: theme.accent }}>[color=#hex]</span> — Set color<br />
            <span style={{ color: theme.accent }}>a -&gt; b</span> — Directed edge<br />
            <span style={{ color: theme.accent }}>a --&gt; b [label="x"] [dashed]</span> — Edge options<br />
            <span style={{ color: theme.accent }}>// comment</span> — Comments
          </p>
        </div>
      </details>

      {/* Shapes reference */}
      <div className="flex flex-wrap gap-1">
        {SHAPE_TABLE.map((s) => (
          <span
            key={s.shape}
            className="px-1.5 py-0.5 rounded text-xs"
            style={{ background: theme.surfaceHover, border: `1px solid ${theme.border}`, color: theme.textMuted }}
          >
            {s.label}
          </span>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs" style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.25)", color: "#fca5a5" }}>
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Actions with overflow protection */}
      <div className="flex gap-2 overflow-hidden">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={parseSource}
          className="flex-1 flex items-center justify-center gap-1 py-2.5 px-2 rounded-xl text-xs sm:text-sm font-medium transition-colors min-w-0"
          style={{ 
            background: `${theme.accent}22`, 
            border: `1px solid ${theme.accent}44`, 
            color: theme.textPrimary 
          }}
        >
          <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
          <span className="hidden sm:inline">Parse</span>
          <span className="sm:hidden">Parse</span>
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={applyToCanvas}
          disabled={!parsed}
          className="flex-1 flex items-center justify-center gap-1 py-2.5 px-2 rounded-xl text-primary-foreground text-xs sm:text-sm font-medium disabled:opacity-40 min-w-0"
          style={{ 
            background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}cc)` 
          }}
        >
          <Play className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
          <span className="hidden sm:inline">Generate Diagram</span>
          <span className="sm:hidden">Generate</span>
        </motion.button>
      </div>

      {parsed && (
        <div className="px-3 py-2 rounded-lg text-xs" style={{ background: theme.surfaceHover, border: `1px solid ${theme.border}`, color: theme.textMuted }}>
          Parsed: {parsed.nodes.length} nodes, {parsed.edges.length} edges
          {parsed.title ? ` · "${parsed.title}"` : ""}
        </div>
      )}
    </div>
  );
}