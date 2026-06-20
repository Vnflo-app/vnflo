"use client";

import { useRef } from "react";
import { motion } from "motion/react";
import { useInView } from "motion/react";
import { GitBranch, Building2, Brain, Network, Check, ArrowRight } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

const USE_CASES = [
  {
    icon: GitBranch,
    title: "Family Trees",
    tagline: "Preserve your family's story for generations",
    color: "#a78bfa",
    bg: "#080808",
    description: "Create detailed, beautiful family histories that bring generations together. Track ancestry lines, add biographical details, and attach photos to paint a complete picture of your heritage.",
    benefits: [
      "Multi-generational tree views with unlimited depth",
      "Attach photos and documents to each family member",
      "Track birth, death, marriage, and adoption events",
      "Import from GEDCOM files from other genealogy tools",
      "Share privately with family members via secure links",
      "Print-ready export for family reunion booklets",
    ],
    preview: {
      nodes: [
        { x: 50, y: 12, label: "👴 George", w: 90 },
        { x: 50, y: 38, label: "👨 Michael", w: 90 },
        { x: 22, y: 64, label: "🧑 James", w: 80 },
        { x: 50, y: 64, label: "👧 Sarah", w: 80 },
        { x: 78, y: 64, label: "👦 Chris", w: 80 },
        { x: 22, y: 90, label: "👶 Emma", w: 80 },
      ],
      edges: [[0,1],[1,2],[1,3],[1,4],[2,5]],
      color: "#a78bfa",
    },
  },
  {
    icon: Building2,
    title: "Organizational Charts",
    tagline: "Visualize your company structure with clarity",
    color: "#67e8f9",
    bg: "#0891b2",
    description: "Map your entire organization from C-suite to individual contributors. Keep charts up to date with real-time editing, and share them across departments to communicate structure effectively.",
    benefits: [
      "Hierarchical layout engine with smart auto-positioning",
      "Link nodes to employee profiles and contact info",
      "Color-code by department, location, or role type",
      "Zoom in on specific teams without losing context",
      "Export to PowerPoint for board presentations",
      "Sync with HRIS systems via API integrations",
    ],
    preview: {
      nodes: [
        { x: 50, y: 10, label: "CEO", w: 70 },
        { x: 25, y: 35, label: "CTO", w: 65 },
        { x: 50, y: 35, label: "CFO", w: 65 },
        { x: 75, y: 35, label: "CMO", w: 65 },
        { x: 15, y: 65, label: "Frontend", w: 80 },
        { x: 35, y: 65, label: "Backend", w: 80 },
        { x: 65, y: 65, label: "Finance", w: 80 },
      ],
      edges: [[0,1],[0,2],[0,3],[1,4],[1,5],[2,6]],
      color: "#67e8f9",
    },
  },
  {
    icon: Brain,
    title: "Mind Maps",
    tagline: "Turn ideas into structured thinking",
    color: "#f9a8d4",
    bg: "#db2777",
    description: "Capture, organize, and expand ideas visually. Whether brainstorming solo or with a team, mind maps help you see connections between concepts and transform scattered thoughts into clear plans.",
    benefits: [
      "Free-form and structured mind map modes",
      "Infinite canvas with no size limits",
      "Color coding and emoji labels for visual grouping",
      "Collapse and expand branches to manage complexity",
      "Export as outline to Markdown or Word",
      "Real-time collaborative brainstorming sessions",
    ],
    preview: {
      nodes: [
        { x: 50, y: 50, label: "💡 Idea", w: 70 },
        { x: 18, y: 20, label: "Research", w: 80 },
        { x: 82, y: 20, label: "Strategy", w: 80 },
        { x: 18, y: 80, label: "Action", w: 75 },
        { x: 82, y: 80, label: "Results", w: 75 },
        { x: 50, y: 15, label: "Planning", w: 78 },
      ],
      edges: [[0,1],[0,2],[0,3],[0,4],[0,5]],
      color: "#f9a8d4",
    },
  },
  {
    icon: Network,
    title: "Network Diagrams",
    tagline: "Map systems and relationships with precision",
    color: "#86efac",
    bg: "#16a34a",
    description: "Design, document, and communicate complex technical and social systems. From cloud architecture to relationship graphs, Visual Node Flow handles any network topology with ease.",
    benefits: [
      "100+ standard network topology shapes (ISO/IEC)",
      "Directional and bidirectional edge types",
      "Overlay labels and port definitions on connections",
      "Group and cluster nodes into logical regions",
      "Import from Terraform, Mermaid, or DOT syntax",
      "Version-controlled architecture documentation",
    ],
    preview: {
      nodes: [
        { x: 50, y: 50, label: "🖥️ Server", w: 80 },
        { x: 20, y: 18, label: "💻 Client", w: 75 },
        { x: 80, y: 18, label: "📱 Mobile", w: 75 },
        { x: 20, y: 82, label: "🗄️ DB", w: 65 },
        { x: 80, y: 82, label: "⚡ Cache", w: 75 },
        { x: 50, y: 10, label: "⚖️ LB", w: 65 },
      ],
      edges: [[5,0],[0,1],[0,2],[0,3],[0,4],[1,5]],
      color: "#86efac",
    },
  },
];

interface PreviewData {
  nodes: { x: number; y: number; label: string; w: number }[];
  edges: number[][];
  color: string;
}

function LargeDiagramPreview({ preview }: { preview: PreviewData }) {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      {preview.edges.map(([from, to], i) => {
        const a = preview.nodes[from];
        const b = preview.nodes[to];
        return (
          <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
            stroke={preview.color} strokeWidth="0.6" strokeOpacity="0.4" strokeDasharray="2 2" />
        );
      })}
      {preview.nodes.map((n, i) => (
        <g key={i}>
          <rect x={n.x - n.w / 2} y={n.y - 6} width={n.w} height={13} rx="3"
            fill={`${preview.color}18`} stroke={preview.color} strokeWidth="0.5" strokeOpacity="0.7" />
          <text x={n.x} y={n.y + 1} textAnchor="middle" dominantBaseline="middle"
            fill={preview.color} fontSize="4.5" fontFamily="Inter, sans-serif" fontWeight="500">
            {n.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

function UseCaseCard({ uc: rawUc, idx }: { uc: typeof USE_CASES[0]; idx: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const { isDark, theme } = useTheme();
  const uc = idx === 0 ? { ...rawUc, bg: theme.accent, color: theme.accent } : rawUc;
  const Icon = uc.icon;
  const isEven = idx % 2 === 0;
  const textPrimary = "text-foreground";
  const textSecondary = "text-muted-foreground";

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
      className="rounded-2xl border p-8 md:p-12"
      style={{ backgroundColor: theme.panel, borderColor: theme.border }}
    >
      <div className={`flex flex-col ${isEven ? "md:flex-row" : "md:flex-row-reverse"} gap-10 items-center`}>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${uc.bg}22`, border: `1px solid ${uc.color}50` }}>
              <Icon className="w-5 h-5" style={{ color: uc.color }} />
            </div>
            <span className="text-xs px-3 py-1 rounded-full border" style={{ color: uc.color, borderColor: `${uc.color}40`, background: `${uc.color}10` }}>
              {uc.tagline}
            </span>
          </div>
          <h2 className={`mb-3 ${textPrimary}`} style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 800, fontSize: "1.6rem", lineHeight: 1.2 }}>
            {uc.title}
          </h2>
          <p className={`mb-6 ${textSecondary}`} style={{ fontSize: "0.95rem", lineHeight: 1.7 }}>
            {uc.description}
          </p>
          <ul className="flex flex-col gap-2.5">
            {uc.benefits.map((b) => (
              <li key={b} className="flex items-start gap-2.5">
                <Check className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: uc.color }} />
                <span className={textSecondary} style={{ fontSize: "0.875rem" }}>{b}</span>
              </li>
            ))}
          </ul>
          <a href="#" className={`inline-flex items-center gap-2 mt-7 px-5 py-2.5 rounded-xl text-sm ${idx === 0 ? "text-primary-foreground" : "text-white"}`}
            style={{ background: `linear-gradient(135deg, ${uc.bg}, ${uc.bg}cc)`, fontWeight: 600 }}>
            Try {uc.title} <ArrowRight className="w-4 h-4" />
          </a>
        </div>
        <div className="flex-shrink-0 w-full md:w-72 h-64 rounded-2xl border flex items-center justify-center p-6"
          style={{ background: `${uc.color}08`, borderColor: `${uc.color}25` }}>
          <LargeDiagramPreview preview={uc.preview} />
        </div>
      </div>
    </motion.div>
  );
}

export default function UseCasesPage() {
  const { isDark, theme } = useTheme();
  const heroRef = useRef(null);
  const heroInView = useInView(heroRef, { once: true });

  const bg = "bg-background text-foreground";
  const textPrimary = "text-foreground";
  const textSecondary = "text-muted-foreground";

  return (
    <div className={`min-h-screen pt-16 ${bg}`} style={{ backgroundColor: theme.canvas }}>
      <div className="relative overflow-hidden py-24">
        <div className="absolute inset-0 opacity-20 pointer-events-none"
          style={{ background: `radial-gradient(ellipse at 50% 0%, ${theme.accent} 0%, transparent 70%)` }} />
        <div className="relative max-w-4xl mx-auto px-6 text-center" ref={heroRef}>
          <motion.div initial={{ opacity: 0, y: 24 }} animate={heroInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-6"
              style={{ borderColor: `${theme.accent}4d`, background: `${theme.accent}1a`, color: theme.accent }}>
              <span className="text-xs">Use cases</span>
            </div>
            <h1 className={`mb-5 ${textPrimary}`} style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 800, fontSize: "clamp(2.2rem,5vw,3.5rem)", lineHeight: 1.1, letterSpacing: "-0.02em" }}>
              Built for every
              <span style={{ backgroundImage: `linear-gradient(135deg, ${theme.accent}, #818cf8, #60a5fa)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}> visualization </span>
              need
            </h1>
            <p className={`max-w-xl mx-auto ${textSecondary}`} style={{ fontSize: "1.05rem", lineHeight: 1.7 }}>
              From personal projects to enterprise systems, Visual Node Flow adapts to how you think and what you need to communicate.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 pb-24 flex flex-col gap-8">
        {USE_CASES.map((uc, idx) => (
          <UseCaseCard key={uc.title} uc={uc} idx={idx} />
        ))}
      </div>
    </div>
  );
}
