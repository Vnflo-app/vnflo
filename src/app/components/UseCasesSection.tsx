import { motion } from "motion/react";
import { useInView } from "motion/react";
import { useRef } from "react";
import { GitBranch, Building2, Brain, Network } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

const USE_CASES = [
  {
    icon: GitBranch,
    title: "Family Trees",
    subtitle: "Trace your heritage",
    description: "Create detailed family histories, track ancestry and descendants across generations, add photos and biographical information for each family member.",
    gradient: "from-gray-500/20 to-gray-600/10",
    border: "border-gray-400/20",
    iconBg: "from-gray-500 to-gray-600",
    accent: "#080808",
    preview: {
      nodes: [
        { x: 50, y: 20, label: "👴 Grandpa", w: 80 },
        { x: 50, y: 50, label: "👨 Dad", w: 70 },
        { x: 20, y: 80, label: "👦 You", w: 60 },
        { x: 80, y: 80, label: "👧 Sis", w: 60 },
      ],
      edges: [[0, 1], [1, 2], [1, 3]],
    },
  },
  {
    icon: Building2,
    title: "Organizational Charts",
    subtitle: "Structure your team",
    description: "Map company structures, visualize reporting relationships, plan team organizations, and communicate hierarchy clearly across your organization.",
    gradient: "from-indigo-600/20 to-blue-600/10",
    border: "border-indigo-500/20",
    iconBg: "from-indigo-600 to-blue-600",
    accent: "#818cf8",
    preview: {
      nodes: [
        { x: 50, y: 15, label: "CEO", w: 60 },
        { x: 25, y: 45, label: "CTO", w: 55 },
        { x: 75, y: 45, label: "CFO", w: 55 },
        { x: 15, y: 75, label: "Dev", w: 50 },
        { x: 40, y: 75, label: "Design", w: 60 },
      ],
      edges: [[0, 1], [0, 2], [1, 3], [1, 4]],
    },
  },
  {
    icon: Brain,
    title: "Mind Maps",
    subtitle: "Visualize your ideas",
    description: "Brainstorm ideas visually, create knowledge graphs, plan projects and workflows, and unleash your creative thinking with unlimited branches.",
    gradient: "from-fuchsia-600/20 to-pink-600/10",
    border: "border-fuchsia-500/20",
    iconBg: "from-fuchsia-600 to-pink-600",
    accent: "#e879f9",
    preview: {
      nodes: [
        { x: 50, y: 50, label: "💡 Idea", w: 65 },
        { x: 15, y: 25, label: "Topic 1", w: 65 },
        { x: 85, y: 25, label: "Topic 2", w: 65 },
        { x: 15, y: 75, label: "Topic 3", w: 65 },
        { x: 85, y: 75, label: "Topic 4", w: 65 },
      ],
      edges: [[0, 1], [0, 2], [0, 3], [0, 4]],
    },
  },
  {
    icon: Network,
    title: "Network Diagrams",
    subtitle: "Map your systems",
    description: "Visualize relationships between entities, create system architecture diagrams, map social networks, and plan infrastructure with precision.",
    gradient: "from-cyan-600/20 to-teal-600/10",
    border: "border-cyan-500/20",
    iconBg: "from-cyan-600 to-teal-600",
    accent: "#67e8f9",
    preview: {
      nodes: [
        { x: 50, y: 50, label: "Server", w: 65 },
        { x: 20, y: 20, label: "Client A", w: 68 },
        { x: 80, y: 20, label: "Client B", w: 68 },
        { x: 20, y: 80, label: "DB", w: 50 },
        { x: 80, y: 80, label: "Cache", w: 60 },
      ],
      edges: [[0, 1], [0, 2], [0, 3], [0, 4], [1, 2]],
    },
  },
];

function MiniDiagram({ preview, accent }: { preview: (typeof USE_CASES)[0]["preview"]; accent: string }) {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full" style={{ overflow: "visible" }}>
      {preview.edges.map(([from, to], i) => {
        const a = preview.nodes[from];
        const b = preview.nodes[to];
        return (
          <line
            key={i}
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
            stroke={accent}
            strokeWidth="0.8"
            strokeOpacity="0.5"
            strokeDasharray="2 2"
          />
        );
      })}
      {preview.nodes.map((n, i) => (
        <g key={i}>
          <rect
            x={n.x - n.w / 2}
            y={n.y - 6}
            width={n.w}
            height={12}
            rx="3"
            fill={`${accent}22`}
            stroke={accent}
            strokeWidth="0.6"
            strokeOpacity="0.6"
          />
          <text
            x={n.x}
            y={n.y + 0.8}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={accent}
            fontSize="4.5"
            fontFamily="Inter, sans-serif"
          >
            {n.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

function UseCaseCard({ useCase, index }: { useCase: (typeof USE_CASES)[0]; index: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const { isDark, theme } = useTheme();
  const Icon = useCase.icon;

  const cardBg = theme.panel;
  const cardBorder = isDark ? useCase.border : "border-gray-200 hover:border-primary/20";
  const titleColor = "text-foreground";
  const descColor = "text-muted-foreground";

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className={`relative rounded-2xl border ${cardBorder} backdrop-blur-sm overflow-hidden group hover:scale-[1.02] transition-all duration-300 @container`}
      style={{ background: cardBg, boxShadow: isDark ? "none" : "0 2px 12px rgba(0,0,0,0.06)" }}
    >
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ boxShadow: `inset 0 0 0 1px ${useCase.accent}40` }}
      />

      <div className="flex flex-col @[480px]:flex-row @[480px]:items-start gap-4 @[480px]:gap-5 p-6">
        <div className="flex-1 min-w-0">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${useCase.iconBg} flex items-center justify-center mb-3 shadow-lg`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <p className="text-xs mb-1" style={{ color: useCase.accent }}>{useCase.subtitle}</p>
          <h3 className={titleColor} style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700, fontSize: "1.15rem" }}>
            {useCase.title}
          </h3>

          <p className={`leading-relaxed mt-3 ${descColor}`} style={{ fontSize: "0.875rem" }}>
            {useCase.description}
          </p>

          <div className="mt-4 flex items-center gap-1.5" style={{ color: useCase.accent, fontSize: "0.8rem", fontWeight: 500 }}>
            <span>Explore templates</span>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2.5 6h7M6.5 3l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
        <div className="w-full @[480px]:w-36 @[480px]:h-28 h-32 opacity-80 flex-shrink-0 @[480px]:mt-2">
          <MiniDiagram preview={useCase.preview} accent={useCase.accent} />
        </div>
      </div>
    </motion.div>
  );
}

export function UseCasesSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const { isDark, theme } = useTheme();

  const bg = theme.canvas;
  const glowOpacity = isDark ? "opacity-20" : "opacity-10";
  const badgeStyle = {
    borderColor: `${theme.accent}40`,
    background: `${theme.accent}${isDark ? "1a" : "14"}`,
    color: theme.accent,
  };
  const titleColor = "text-foreground";
  const subtitleColor = "text-muted-foreground";

  return (
    <section className="py-28 relative" style={{ background: bg }}>
      <div className={`absolute inset-0 ${glowOpacity}`} style={{
        backgroundImage: `radial-gradient(ellipse at 50% 0%, ${theme.accent}40 0%, transparent 70%)`
      }} />

      <div className="relative max-w-7xl mx-auto px-6">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-5" style={badgeStyle}>
            <span className="text-xs">Use cases</span>
          </div>
          <h2 className={`mb-4 ${titleColor}`} style={{
            fontFamily: "Plus Jakarta Sans, sans-serif",
            fontSize: "clamp(2rem, 4vw, 2.75rem)",
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: "-0.02em",
          }}>
            Built for every visualization need
          </h2>
          <p className={`max-w-xl mx-auto ${subtitleColor}`} style={{ fontSize: "1rem", lineHeight: 1.7 }}>
            From personal projects to enterprise systems, Visual Node Flow adapts to how you think and work.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {USE_CASES.map((useCase, i) => (
            <UseCaseCard key={useCase.title} useCase={useCase} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
