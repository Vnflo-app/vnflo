"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "motion/react";
import { useInView } from "motion/react";
import { Search, ArrowRight, Loader2 } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../stores/authStore";
import { useDiagramStore } from "../../stores/diagramStore";
import { DIAGRAM_TEMPLATES, TEMPLATE_CATEGORIES, type DiagramTemplate } from "../../editor/templates/diagramTemplates";
import { generateId } from "../../db/index";
import { type Node, type Edge } from "@xyflow/react";
import { applyElkLayout } from "../../editor/hooks/useElkLayout";

function buildReactFlowNodes(template: DiagramTemplate): Node[] {
  return template.nodes.map((n, i) => ({
    id: n.id,
    type: "custom",
    position: { x: 120 + (i % 4) * 220, y: 80 + Math.floor(i / 4) * 140 },
    width: 160,
    height: 80,
    data: {
      label: n.label,
      shape: n.shape,
      bgColor: n.bgColor,
      borderColor: `${n.bgColor}cc`,
      textColor: "#e2e8f0",
      borderWidth: 2,
      borderStyle: "solid",
      fontSize: 13,
      width: 160,
      height: 80,
    },
  }));
}

function buildReactFlowEdges(template: DiagramTemplate): Edge[] {
  return template.edges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    label: e.label,
    style: { stroke: template.color, strokeWidth: 2 },
    markerEnd: { type: "arrowclosed", color: template.color },
  }));
}

function TemplateCard({
  tpl,
  index,
  onUse,
  loading,
}: {
  tpl: DiagramTemplate;
  index: number;
  onUse: (tpl: DiagramTemplate) => void;
  loading: boolean;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const { isDark, theme } = useTheme();

  const textPrimary = "text-foreground";
  const textSecondary = "text-muted-foreground";

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4, delay: (index % 4) * 0.08 }}
      className="group rounded-2xl border overflow-hidden transition-all duration-300 shadow-sm hover:shadow-md hover:border-primary/50"
      style={{ backgroundColor: theme.panel, borderColor: theme.border }}
    >
      {/* SVG Preview */}
      <div className="relative h-40 flex items-center justify-center p-6" style={{ background: `${tpl.color}08` }}>
        <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
          {tpl.previewEdges.map(([from, to], i) => {
            const a = tpl.previewNodes[from];
            const b = tpl.previewNodes[to];
            if (!a || !b) return null;
            return (
              <line
                key={i}
                x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                stroke={tpl.color} strokeWidth="0.8" strokeOpacity="0.45" strokeDasharray="2.5 2"
              />
            );
          })}
          {tpl.previewNodes.map((n, i) => (
            <g key={i}>
              <rect
                x={n.x - n.w / 2} y={n.y - 5.5} width={n.w} height={11} rx="3"
                fill={`${tpl.color}18`} stroke={tpl.color} strokeWidth="0.5" strokeOpacity="0.75"
              />
            </g>
          ))}
        </svg>
        <div className="absolute top-3 right-3">
          <span
            className="text-xs px-2 py-0.5 rounded-full border"
            style={{
              color: tpl.color, borderColor: `${tpl.color}40`,
              background: `${tpl.color}15`, fontSize: "0.7rem",
            }}
          >
            {tpl.category}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3
          className={`mb-1 ${textPrimary}`}
          style={{ fontWeight: 600, fontSize: "0.9rem", fontFamily: "Plus Jakarta Sans, sans-serif" }}
        >
          {tpl.title}
        </h3>
        <p className={`mb-3 ${textSecondary}`} style={{ fontSize: "0.78rem", lineHeight: 1.5 }}>
          {tpl.description}
        </p>
        <div className="flex items-center justify-between">
          <span className={textSecondary} style={{ fontSize: "0.75rem" }}>
            {tpl.nodeCount} nodes
          </span>
          <button
            onClick={() => onUse(tpl)}
            disabled={loading}
            className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg transition-all disabled:opacity-50"
            style={{ background: `${tpl.color}18`, color: tpl.color, fontWeight: 500 }}
          >
            {loading ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <>Use template <ArrowRight className="w-3 h-3" /></>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function TemplatesPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const { isDark, theme } = useTheme();
  const router = useRouter();
  const navigate = (path: string) => router.push(path);
  const { user } = useAuthStore();
  const createDiagram = useDiagramStore((s) => s.createDiagram);
  const diagrams = useDiagramStore((s) => s.diagrams);
  const loadDiagrams = useDiagramStore((s) => s.loadDiagrams);
  const heroRef = useRef(null);
  const heroInView = useInView(heroRef, { once: true });

  useEffect(() => {
    if (user) loadDiagrams(user.id);
  }, [user]);

  const handleUseTemplate = useCallback(
    async (tpl: DiagramTemplate) => {
      if (!user) {
        navigate("/auth");
        return;
      }

      const isPro = user.subscriptionStatus === "active";
      const trialExpired = user ? (Date.now() - user.createdAt > 24 * 60 * 60 * 1000) : false;

      if (!isPro) {
        if (trialExpired) {
          alert("Your free trial has expired. Upgrade to Pro to create more diagrams.");
          navigate("/pricing");
          return;
        }
        if (diagrams.length >= 3) {
          alert("You have reached the limit of 3 diagrams on the Free Trial. Upgrade to Pro for unlimited diagrams.");
          navigate("/pricing");
          return;
        }
      }

      setLoadingId(tpl.id);
      try {
        let rfNodes = buildReactFlowNodes(tpl);
        const rfEdges = buildReactFlowEdges(tpl);
        if (rfNodes.length > 0) {
          rfNodes = await applyElkLayout(rfNodes, rfEdges, "TB");
        }
        const diagram = await createDiagram(tpl.title, user.id, rfNodes, rfEdges);
        navigate(`/editor/${diagram.id}`);
      } finally {
        setLoadingId(null);
      }
    },
    [user, createDiagram, navigate, diagrams]
  );

  const filtered = DIAGRAM_TEMPLATES.filter((t) => {
    const matchCat = activeCategory === "All" || t.category === activeCategory;
    const matchSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const bg = "bg-background text-foreground";
  const textPrimary = "text-foreground";
  const textSecondary = "text-muted-foreground";
  const pillInactive = "border-border text-muted-foreground hover:border-border/80 hover:text-foreground bg-transparent";
  const pillActive = "border-primary text-primary bg-primary/10";

  return (
    <div className={`min-h-screen pt-16 ${bg}`} style={{ backgroundColor: theme.canvas }}>
      {/* Hero */}
      <div className="relative overflow-hidden py-20">
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{ background: `radial-gradient(ellipse at 50% 0%, ${theme.accent} 0%, transparent 70%)` }}
        />
        <div className="relative max-w-3xl mx-auto px-6 text-center" ref={heroRef}>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-6"
              style={{ borderColor: `${theme.accent}4d`, background: `${theme.accent}1a`, color: theme.accent }}>
              <span className="text-xs">{DIAGRAM_TEMPLATES.length} ready-made templates</span>
            </div>
            <h1
              className={`mb-4 ${textPrimary}`}
              style={{
                fontFamily: "Plus Jakarta Sans, sans-serif",
                fontWeight: 800,
                fontSize: "clamp(2rem,5vw,3.2rem)",
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
              }}
            >
              Start faster with ready-made templates
            </h1>
            <p className={`max-w-xl mx-auto mb-8 ${textSecondary}`} style={{ fontSize: "1rem", lineHeight: 1.7 }}>
              Choose from professionally designed templates and customize every detail to fit your needs.
            </p>
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
              <input
                type="text"
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder-muted-foreground focus:border-primary outline-none transition-colors text-sm"
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Category filters */}
      <div className="max-w-6xl mx-auto px-6 mb-8">
        <div className="flex flex-wrap gap-2">
          {TEMPLATE_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full border text-sm transition-all ${activeCategory === cat ? pillActive : pillInactive}`}
              style={{ fontWeight: activeCategory === cat ? 600 : 400 }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-6xl mx-auto px-6 pb-24">
        {filtered.length === 0 ? (
          <div className={`text-center py-20 ${textSecondary}`}>
            No templates found for "{searchQuery}"
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((tpl, i) => (
              <TemplateCard
                key={tpl.id}
                tpl={tpl}
                index={i}
                onUse={handleUseTemplate}
                loading={loadingId === tpl.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
