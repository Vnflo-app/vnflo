import { useMemo, useState } from "react";
import { useReactFlow, useNodes, useEdges } from "@xyflow/react";
import { Code, X, Copy, Check } from "lucide-react";
import { useEditorTheme } from "../context/EditorThemeContext";
import { generateFlowchartDSL, parseFlowchartDSL, generateERD_DSL, parseERD_DSL } from "../utils/dsl";

interface ScopedCodeEditorPanelProps {
  frameId: string;
  onClose: () => void;
}

export function ScopedCodeEditorPanel({ frameId, onClose }: ScopedCodeEditorPanelProps) {
  const { theme } = useEditorTheme();
  const { setNodes, setEdges } = useReactFlow();
  const nodes = useNodes();
  const edges = useEdges();
  const activeFrame = nodes.find((n) => n.id === frameId);
  const frameType = activeFrame?.data?.frameType || "flowchart";

  const frameNodes = useMemo(() => nodes.filter((n) => n.parentId === frameId), [nodes, frameId]);
  const frameEdges = useMemo(
    () => edges.filter((e) => frameNodes.some((fn) => fn.id === e.source || fn.id === e.target)),
    [edges, frameNodes]
  );

  const initialDsl = useMemo(() => {
    if (frameType === "er") return generateERD_DSL(frameNodes, frameEdges);
    return generateFlowchartDSL(frameNodes, frameEdges);
  }, [frameNodes, frameEdges, frameType]);

  const [dslCode, setDslCode] = useState(initialDsl);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleApply = () => {
    try {
      setError(null);
      const parsed = frameType === "er" ? parseERD_DSL(dslCode, frameId) : parseFlowchartDSL(dslCode, frameId);

      setNodes((ns) => {
        const otherNodes = ns.filter((n) => n.parentId !== frameId && n.id !== frameId);
        const layoutedNodes = parsed.nodes.map((n, idx) => ({
          ...n,
          position: { x: 40 + (idx % 3) * 200, y: 80 + Math.floor(idx / 3) * 120 },
        }));
        const currentFrameNode = ns.find((fn) => fn.id === frameId);
        return [...otherNodes, ...(currentFrameNode ? [currentFrameNode] : []), ...layoutedNodes];
      });

      setEdges((es) => {
        const otherEdges = es.filter((e) => !frameNodes.some((fn) => fn.id === e.source || fn.id === e.target));
        return [...otherEdges, ...parsed.edges];
      });
    } catch (err: any) {
      setError(err.message || "Parse error");
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(dslCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden text-xs">
      <div className="p-4 flex items-center justify-between border-b flex-shrink-0" style={{ borderColor: theme.border }}>
        <div className="flex items-center gap-2">
          <Code className="w-4 h-4" style={{ color: theme.accent }} />
          <span className="font-semibold text-sm" style={{ color: theme.textPrimary }}>
            {frameType === "er" ? "ERD DSL Editor" : "Flowchart DSL Editor"}
          </span>
        </div>
        <button onClick={onClose} className="p-1 rounded hover:bg-white/5" style={{ color: theme.textMuted }}>
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 p-4 flex flex-col gap-3 overflow-hidden">
        <div className="flex items-center justify-between text-[10px] text-gray-400 uppercase tracking-wider font-semibold flex-shrink-0">
          <span>Source Code</span>
          <button onClick={handleCopy} className="flex items-center gap-1 hover:text-white transition-colors">
            {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>

        <textarea
          value={dslCode}
          onChange={(e) => setDslCode(e.target.value)}
          className="flex-1 w-full rounded-xl p-3 font-mono leading-relaxed outline-none border resize-none overflow-y-auto"
          style={{
            background: theme.surfaceHover,
            borderColor: theme.border,
            color: theme.textPrimary,
          }}
          spellCheck={false}
        />

        {error && (
          <div className="p-2.5 rounded-lg border border-red-500/20 bg-red-500/10 text-red-300 flex-shrink-0">
            {error}
          </div>
        )}
      </div>

      <div className="p-4 border-t flex-shrink-0" style={{ borderColor: theme.border }}>
        <button
          onClick={handleApply}
          className="w-full py-2.5 rounded-xl font-semibold text-primary-foreground transition-transform hover:scale-[1.01] active:scale-[0.99]"
          style={{
            background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}cc)`,
          }}
        >
          Compile & Apply to Frame
        </button>
      </div>
    </div>
  );
}