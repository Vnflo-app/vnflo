import { motion } from "motion/react";
import { useInView } from "motion/react";
import { useRef, useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";

interface DemoNode { id: string; x: number; y: number; label: string; color: string; bg: string; }
interface DemoEdge { from: string; to: string; }

const TABS = ["Family Tree", "Org Chart", "Mind Map", "Network"];

const DEMOS: Record<string, { nodes: DemoNode[]; edges: DemoEdge[] }> = {
  "Family Tree": {
    nodes: [
      { id: "gf", x: 360, y: 60, label: "👴 Grandfather", color: "#a78bfa", bg: "#080808" },
      { id: "gm", x: 540, y: 60, label: "👵 Grandmother", color: "#a78bfa", bg: "#080808" },
      { id: "dad", x: 360, y: 170, label: "👨 Father", color: "#818cf8", bg: "#4f46e5" },
      { id: "mom", x: 540, y: 170, label: "👩 Mother", color: "#818cf8", bg: "#4f46e5" },
      { id: "you", x: 280, y: 280, label: "🧑 You", color: "#67e8f9", bg: "#0891b2" },
      { id: "sis", x: 450, y: 280, label: "👧 Sister", color: "#67e8f9", bg: "#0891b2" },
      { id: "bro", x: 620, y: 280, label: "👦 Brother", color: "#67e8f9", bg: "#0891b2" },
    ],
    edges: [
      { from: "gf", to: "dad" }, { from: "gm", to: "dad" },
      { from: "dad", to: "you" }, { from: "dad", to: "sis" }, { from: "dad", to: "bro" },
      { from: "mom", to: "you" }, { from: "mom", to: "sis" },
    ],
  },
  "Org Chart": {
    nodes: [
      { id: "ceo", x: 450, y: 50, label: "👤 CEO", color: "#fbbf24", bg: "#d97706" },
      { id: "cto", x: 270, y: 160, label: "💻 CTO", color: "#a78bfa", bg: "#080808" },
      { id: "cfo", x: 450, y: 160, label: "💰 CFO", color: "#34d399", bg: "#059669" },
      { id: "cmo", x: 630, y: 160, label: "📣 CMO", color: "#f87171", bg: "#dc2626" },
      { id: "dev1", x: 180, y: 270, label: "👨‍💻 Frontend", color: "#818cf8", bg: "#4f46e5" },
      { id: "dev2", x: 340, y: 270, label: "👩‍💻 Backend", color: "#818cf8", bg: "#4f46e5" },
      { id: "fin", x: 520, y: 270, label: "📊 Finance", color: "#6ee7b7", bg: "#059669" },
    ],
    edges: [
      { from: "ceo", to: "cto" }, { from: "ceo", to: "cfo" }, { from: "ceo", to: "cmo" },
      { from: "cto", to: "dev1" }, { from: "cto", to: "dev2" }, { from: "cfo", to: "fin" },
    ],
  },
  "Mind Map": {
    nodes: [
      { id: "c", x: 450, y: 185, label: "💡 Big Idea", color: "#f9a8d4", bg: "#db2777" },
      { id: "a", x: 220, y: 90, label: "📚 Research", color: "#a78bfa", bg: "#080808" },
      { id: "b", x: 680, y: 90, label: "🎯 Strategy", color: "#67e8f9", bg: "#0891b2" },
      { id: "d", x: 220, y: 285, label: "⚡ Action", color: "#fbbf24", bg: "#d97706" },
      { id: "e", x: 680, y: 285, label: "📈 Growth", color: "#34d399", bg: "#059669" },
      { id: "f", x: 120, y: 185, label: "🔍 Analysis", color: "#818cf8", bg: "#4f46e5" },
      { id: "g", x: 780, y: 185, label: "🚀 Launch", color: "#f87171", bg: "#dc2626" },
    ],
    edges: [
      { from: "c", to: "a" }, { from: "c", to: "b" }, { from: "c", to: "d" },
      { from: "c", to: "e" }, { from: "c", to: "f" }, { from: "c", to: "g" },
    ],
  },
  "Network": {
    nodes: [
      { id: "srv", x: 450, y: 185, label: "🖥️ Server", color: "#a78bfa", bg: "#080808" },
      { id: "ca", x: 220, y: 80, label: "💻 Client A", color: "#67e8f9", bg: "#0891b2" },
      { id: "cb", x: 680, y: 80, label: "📱 Client B", color: "#67e8f9", bg: "#0891b2" },
      { id: "db", x: 220, y: 290, label: "🗄️ Database", color: "#34d399", bg: "#059669" },
      { id: "cache", x: 680, y: 290, label: "⚡ Cache", color: "#fbbf24", bg: "#d97706" },
      { id: "lb", x: 450, y: 50, label: "⚖️ Load Balancer", color: "#f9a8d4", bg: "#db2777" },
    ],
    edges: [
      { from: "lb", to: "srv" }, { from: "srv", to: "ca" }, { from: "srv", to: "cb" },
      { from: "srv", to: "db" }, { from: "srv", to: "cache" }, { from: "ca", to: "lb" },
    ],
  },
};

const NODE_WIDTH = 130;
const NODE_HEIGHT = 36;

export function DemoSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const [activeTab, setActiveTab] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const { isDark, theme } = useTheme();

  const data = DEMOS[TABS[activeTab]];

  useEffect(() => { setAnimKey((k) => k + 1); }, [activeTab]);

  const getNodePos = (id: string) => data.nodes.find((n) => n.id === id)!;

  const bg = theme.canvas;
  const glowStyle = {
    backgroundImage: `radial-gradient(ellipse at 50% 100%, ${theme.accent}${isDark ? "66" : "26"} 0%, transparent 70%)`
  };
  const badgeStyle = {
    borderColor: `${theme.accent}40`,
    background: `${theme.accent}${isDark ? "1a" : "14"}`,
    color: theme.accent,
  };
  const titleColor = "text-foreground";
  const subtitleColor = "text-muted-foreground";
  const canvasBg = theme.panel;
  const canvasBorder = isDark ? "border-white/10" : "border-gray-200";
  const toolbarBorder = isDark ? "border-white/8" : "border-gray-100";
  const titleBarText = "text-muted-foreground/50";
  const tabActiveStyle = {
    background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}dd)`,
    color: "var(--primary-foreground)",
    border: "1px solid transparent",
    fontWeight: 600
  };
  const tabInactiveStyle = isDark
    ? { background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.1)" }
    : { background: "rgba(0,0,0,0.04)", color: "rgba(0,0,0,0.5)", border: "1px solid rgba(0,0,0,0.1)" };
  const toolStyle = (active: boolean) => isDark
    ? { background: active ? `${theme.accent}4d` : "rgba(255,255,255,0.05)", color: active ? theme.textPrimary : "rgba(255,255,255,0.4)", border: `1px solid ${active ? `${theme.accent}66` : "rgba(255,255,255,0.08)"}` }
    : { background: active ? `${theme.accent}26` : "rgba(0,0,0,0.04)", color: active ? theme.accent : "rgba(0,0,0,0.4)", border: `1px solid ${active ? `${theme.accent}4d` : "rgba(0,0,0,0.08)"}` };
  const statsStyle = "text-muted-foreground/60";
  const edgeColor = isDark ? `${theme.accent}59` : `${theme.accent}40`;
  const arrowFill = isDark ? `${theme.accent}80` : `${theme.accent}66`;

  return (
    <section className="py-28 relative overflow-hidden" style={{ background: bg }}>
      <div className="absolute inset-0 opacity-20 pointer-events-none" style={glowStyle} />

      <div className="relative max-w-6xl mx-auto px-6">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-5" style={badgeStyle}>
            <span className="text-xs">Interactive preview</span>
          </div>
          <h2 className={`mb-4 ${titleColor}`} style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "clamp(2rem, 4vw, 2.75rem)", fontWeight: 800, lineHeight: 1.15, letterSpacing: "-0.02em" }}>
            See it in action
          </h2>
          <p className={`max-w-xl mx-auto ${subtitleColor}`} style={{ fontSize: "1rem" }}>
            Switch between diagram types and see how Visual Node Flow helps you visualize any structure.
          </p>
        </motion.div>

        <div className="flex items-center justify-center gap-2 mb-8 flex-wrap">
          {TABS.map((tab, i) => (
            <motion.button
              key={tab}
              onClick={() => setActiveTab(i)}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="px-5 py-2 rounded-xl text-sm transition-all duration-200"
              style={activeTab === i ? tabActiveStyle : tabInactiveStyle}
            >
              {tab}
            </motion.button>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.2 }}
          className={`relative rounded-2xl border overflow-hidden ${canvasBorder}`}
          style={{ background: canvasBg, backdropFilter: "blur(20px)" }}
        >
          <div className={`flex items-center gap-2 px-4 py-3 border-b ${toolbarBorder}`}>
            <div className="w-3 h-3 rounded-full bg-red-400/60" />
            <div className="w-3 h-3 rounded-full bg-yellow-400/60" />
            <div className="w-3 h-3 rounded-full bg-green-400/60" />
            <span className={`ml-3 ${titleBarText}`} style={{ fontSize: "0.75rem" }}>
              Visual Node Flow — {TABS[activeTab]}
            </span>
          </div>

          <div className="relative" style={{ height: 380 }}>
            <svg key={animKey} viewBox="0 0 900 370" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
              <defs>
                <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                  <path d="M0,0 L0,6 L8,3 z" fill={arrowFill} />
                </marker>
              </defs>
              {data.edges.map(({ from, to }, i) => {
                const a = getNodePos(from);
                const b = getNodePos(to);
                return (
                  <motion.line
                    key={`${from}-${to}`}
                    x1={a.x} y1={a.y + NODE_HEIGHT / 2}
                    x2={b.x} y2={b.y + NODE_HEIGHT / 2}
                    stroke={edgeColor} strokeWidth="1.5" strokeDasharray="5 4"
                    markerEnd="url(#arrow)"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 + i * 0.06 }}
                  />
                );
              })}
              {data.nodes.map((node, i) => (
                <motion.g
                  key={node.id}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: i * 0.07, type: "spring", stiffness: 200 }}
                  style={{ cursor: "pointer" }}
                >
                  <rect
                    x={node.x - NODE_WIDTH / 2} y={node.y}
                    width={NODE_WIDTH} height={NODE_HEIGHT} rx="8"
                    fill={theme.nodeBg}
                    stroke={isDark ? node.color : node.bg}
                    strokeWidth="1.5"
                    style={{ filter: isDark ? "none" : "drop-shadow(0 2px 4px rgba(0,0,0,0.04))" }}
                  />
                  <text
                    x={node.x} y={node.y + NODE_HEIGHT / 2 + 1}
                    textAnchor="middle" dominantBaseline="middle"
                    fill={theme.nodeText}
                    fontSize="11.5" fontFamily="Inter, sans-serif" fontWeight="500"
                  >
                    {node.label}
                  </text>
                </motion.g>
              ))}
            </svg>
          </div>

          <div className={`flex items-center justify-between px-4 py-3 border-t ${toolbarBorder}`}>
            <div className="flex items-center gap-3">
              {["Select", "Connect", "Add node", "Pan"].map((tool) => (
                <button key={tool} className="text-xs px-3 py-1 rounded-lg transition-colors" style={toolStyle(tool === "Select")}>
                  {tool}
                </button>
              ))}
            </div>
            <span className={`${statsStyle}`} style={{ fontSize: "0.7rem" }}>
              {data.nodes.length} nodes · {data.edges.length} connections
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
