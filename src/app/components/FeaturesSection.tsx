import { motion } from "motion/react";
import { useInView } from "motion/react";
import { useRef } from "react";
import { MousePointerClick, Users, Download, Cloud, LayoutTemplate, Share2 } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

const FEATURES = [
  { icon: MousePointerClick, title: "Intuitive drag-and-drop", description: "Build complex diagrams effortlessly. Drag nodes, connect edges, and arrange layouts with zero learning curve.", color: "#acadb1" },
  { icon: Users, title: "Real-time collaboration", description: "Work together with your team simultaneously. See changes live, add comments, and co-create without conflicts.", color: "#4f46e5" },
  { icon: Download, title: "Multi-format export", description: "Export your diagrams as PNG, SVG, or PDF with a single click. Share or embed anywhere, anytime.", color: "#0891b2" },
  { icon: Cloud, title: "Local-first storage", description: "Your data stays on your device. No cloud required — all diagrams stored in IndexedDB for full privacy.", color: "#059669" },
  { icon: LayoutTemplate, title: "Customizable templates", description: "Start faster with 100+ professionally designed templates. Customize colors, shapes, and layouts to match your brand.", color: "#d97706" },
  { icon: Share2, title: "Advanced relationship mapping", description: "Define custom connection types, add labels to edges, set directional relationships, and visualize complex hierarchies.", color: "#e11d48" },
];

function FeatureCard({ feature, index }: { feature: (typeof FEATURES)[0]; index: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const { isDark, theme } = useTheme();
  const Icon = feature.icon;

  const cardBg = theme.panel;
  const cardBorder = isDark ? "border-white/8 hover:border-white/20" : "border-gray-200 hover:border-primary/20 shadow-sm hover:shadow-md";
  const titleColor = "text-foreground";
  const descColor = "text-muted-foreground";

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className={`group relative rounded-2xl border overflow-hidden transition-all duration-300 @container ${cardBorder}`}
      style={{ background: cardBg }}
    >
      <motion.div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: `radial-gradient(circle at 30% 30%, ${feature.color}${isDark ? "15" : "08"}, transparent 70%)` }}
      />
      <div className="flex flex-col @[400px]:flex-row @[400px]:items-start p-5 @[320px]:p-6 gap-0 @[400px]:gap-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 @[400px]:mb-0 @[400px]:shrink-0 transition-transform duration-300 group-hover:scale-110"
          style={{ background: `${feature.color}${isDark ? "20" : "12"}`, border: `1px solid ${feature.color}40` }}
        >
          <Icon className="w-5 h-5" style={{ color: feature.color }} />
        </div>
        <div className="min-w-0">
          <h3 className={`mb-2 ${titleColor}`} style={{ fontWeight: 600, fontSize: "0.95rem", fontFamily: "Plus Jakarta Sans, sans-serif" }}>
            {feature.title}
          </h3>
          <p className={`leading-relaxed ${descColor}`} style={{ fontSize: "0.85rem" }}>
            {feature.description}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export function FeaturesSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const { isDark, theme } = useTheme();

  const bg = isDark
    ? `linear-gradient(180deg, ${theme.canvas} 0%, ${theme.dot} 100%)`
    : `linear-gradient(180deg, ${theme.canvas} 0%, #ede9ff 100%)`;
  const gridColor = `${theme.accent}${isDark ? "33" : "10"}`;
  const badgeStyle = {
    borderColor: `${theme.accent}40`,
    background: `${theme.accent}${isDark ? "1a" : "14"}`,
    color: theme.accent,
  };
  const titleColor = "text-foreground";
  const subtitleColor = "text-muted-foreground";

  return (
    <section className="py-28 relative" style={{ background: bg }}>
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(${gridColor} 1px, transparent 1px), linear-gradient(90deg, ${gridColor} 1px, transparent 1px)`,
          backgroundSize: "80px 80px",
        }}
      />
      <div className="relative max-w-7xl mx-auto px-6">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-5" style={badgeStyle}>
            <span className="text-xs">Powerful features</span>
          </div>
          <h2 className={`mb-4 ${titleColor}`} style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "clamp(2rem, 4vw, 2.75rem)", fontWeight: 800, lineHeight: 1.15, letterSpacing: "-0.02em" }}>
            Everything you need to diagram
          </h2>
          <p className={`max-w-xl mx-auto ${subtitleColor}`} style={{ fontSize: "1rem", lineHeight: 1.7 }}>
            Experience the difference with our powerful yet easy-to-use diagramming tools.
          </p>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((feature, i) => (
            <FeatureCard key={feature.title} feature={feature} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
