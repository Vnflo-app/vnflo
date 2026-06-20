"use client";

import { useState, useRef } from "react";
import { motion } from "motion/react";
import { useInView } from "motion/react";
import {
  MousePointerClick, Users, Download, Cloud, LayoutTemplate, Share2,
  Layers, Palette, Zap, Lock, History, Search, Filter, Link, ArrowRight
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

const CATEGORIES = ["Interface", "Collaboration", "Export & Data", "Security"];

const FEATURES_BY_CATEGORY: Record<string, { icon: React.ElementType; title: string; description: string; badge?: string }[]> = {
  Interface: [
    { icon: MousePointerClick, title: "Drag-and-drop builder", description: "Intuitively place nodes, draw connections, and rearrange layouts without any manual coding or setup." },
    { icon: Layers, title: "Smart layouts", description: "Auto-arrange your diagram into tree, hierarchical, force-directed, or radial layouts with a single click." },
    { icon: Palette, title: "Full visual customization", description: "Choose from 50+ node shapes, custom colors, border styles, fonts, and icon libraries to match your brand." },
    { icon: Search, title: "Instant search & zoom", description: "Find any node instantly with global search. Navigate large diagrams with smooth pan and zoom controls." },
    { icon: Filter, title: "Advanced filtering", description: "Filter by node type, attribute, depth level, or custom tags to focus on exactly what you need." },
    { icon: Zap, title: "Keyboard shortcuts", description: "Power-user shortcuts for every action — create, connect, delete, undo, redo, copy and paste nodes in seconds." },
  ],
  Collaboration: [
    { icon: Users, title: "Real-time multiplayer", description: "Multiple team members can edit the same diagram simultaneously. See cursors, selections, and changes live.", badge: "Pro" },
    { icon: Link, title: "Shareable links", description: "Generate view-only or editable share links with granular permission controls for any diagram." },
    { icon: History, title: "Version history", description: "Every change is versioned. Browse history, compare versions side by side, and restore to any point.", badge: "Pro" },
    { icon: Users, title: "Comments & threads", description: "Leave comments on any node or edge. Mention teammates, resolve threads, and keep discussions in context.", badge: "Team" },
    { icon: Lock, title: "Role-based access", description: "Assign viewer, editor, or admin roles per workspace. Keep sensitive diagrams locked to specific members.", badge: "Team" },
    { icon: Zap, title: "Presence indicators", description: "See who's online, what they're viewing, and where they're editing with real-time presence dots.", badge: "Pro" },
  ],
  "Export & Data": [
    { icon: Download, title: "PNG & JPEG export", description: "Export crisp, high-resolution raster images at any scale. Perfect for presentations and documents." },
    { icon: Download, title: "PDF export", description: "Generate print-ready PDFs with configurable page sizes, margins, and vector-quality rendering.", badge: "Pro" },
    { icon: Share2, title: "SVG export", description: "Export scalable vector graphics that stay sharp at any size, perfect for web and design tools.", badge: "Pro" },
    { icon: Cloud, title: "Cloud auto-save", description: "Every keystroke is saved instantly to the cloud. Never lose work with continuous background sync." },
    { icon: Link, title: "Embed anywhere", description: "Embed live, interactive diagrams in Notion, Confluence, websites, or any app via iframe or API." },
    { icon: Download, title: "JSON & CSV import", description: "Import your existing data from spreadsheets or JSON to automatically generate diagram structures." },
  ],
  Security: [
    { icon: Lock, title: "End-to-end encryption", description: "All diagram data is encrypted at rest and in transit using AES-256 and TLS 1.3 standards.", badge: "Team" },
    { icon: Lock, title: "SSO / SAML", description: "Connect to your identity provider (Okta, Azure AD, Google Workspace) for seamless single sign-on.", badge: "Enterprise" },
    { icon: Users, title: "Audit logs", description: "Full audit trail of every action: who created, edited, deleted, or exported any diagram and when.", badge: "Enterprise" },
    { icon: Cloud, title: "SOC 2 Type II", description: "Visual Node Flow is SOC 2 Type II certified, ensuring your data meets the highest security standards." },
    { icon: Lock, title: "Private workspaces", description: "Create isolated workspaces with custom data residency rules and access policies per department." },
    { icon: Zap, title: "IP allowlisting", description: "Restrict access to your team's diagrams to specific IP ranges for maximum control.", badge: "Enterprise" },
  ],
};


export default function FeaturesPage() {
  const [activeCategory, setActiveCategory] = useState("Interface");
  const { isDark, theme } = useTheme();
  const heroRef = useRef(null);
  const heroInView = useInView(heroRef, { once: true });

  const bg = "bg-background text-foreground";
  const textPrimary = "text-foreground";
  const textSecondary = "text-muted-foreground";
  const tabInactive = "text-muted-foreground hover:text-foreground border-transparent hover:border-border";
  const tabActive = "text-primary border-primary";

  return (
    <div className={`min-h-screen pt-16 ${bg}`} style={{ backgroundColor: theme.canvas }}>
      {/* Hero */}
      <div className="relative overflow-hidden py-24">
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{ background: `radial-gradient(ellipse at 50% 0%, ${theme.accent} 0%, transparent 70%)` }}
        />
        <div className="relative max-w-4xl mx-auto px-6 text-center" ref={heroRef}>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-6"
              style={{ borderColor: `${theme.accent}4d`, background: `${theme.accent}1a`, color: theme.accent }}>
              <span className="text-xs">All features</span>
            </div>
            <h1 className={`mb-5 ${textPrimary}`} style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 800, fontSize: "clamp(2.2rem,5vw,3.5rem)", lineHeight: 1.1, letterSpacing: "-0.02em" }}>
              Everything you need to build
              <span style={{ backgroundImage: `linear-gradient(135deg, ${theme.accent}, #818cf8, #60a5fa)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}> powerful diagrams</span>
            </h1>
            <p className={`max-w-xl mx-auto ${textSecondary}`} style={{ fontSize: "1.05rem", lineHeight: 1.7 }}>
              From the simplest org chart to the most complex system architecture, Visual Node Flow gives you all the tools to visualize, collaborate, and export.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Category tabs */}
      <div className="sticky top-16 z-30 border-b border-border backdrop-blur-xl" style={{ backgroundColor: `${theme.canvas}e6` }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex gap-0 overflow-x-auto">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-4 text-sm border-b-2 transition-all whitespace-nowrap ${activeCategory === cat ? tabActive : tabInactive}`}
                style={{ fontWeight: activeCategory === cat ? 600 : 400 }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Features grid */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES_BY_CATEGORY[activeCategory].map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className="group rounded-2xl border p-6 transition-colors hover:border-primary/50"
                style={{ backgroundColor: theme.panel, borderColor: theme.border }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: `${theme.accent}22`, border: `1px solid ${theme.accent}40` }}>
                    <Icon className="w-5 h-5" style={{ color: theme.accent }} />
                  </div>
                  {feature.badge && (
                    <span
                      className="text-xs px-2 py-0.5 rounded-full border"
                      style={
                        feature.badge === "Enterprise"
                          ? { color: "#f59e0b", borderColor: "rgba(245,158,11,0.3)", backgroundColor: "rgba(245,158,11,0.1)" }
                          : { color: theme.accent, borderColor: `${theme.accent}4d`, backgroundColor: `${theme.accent}1a` }
                      }
                    >
                      {feature.badge}
                    </span>
                  )}
                </div>
                <h3 className={`mb-2 ${textPrimary}`} style={{ fontWeight: 600, fontSize: "0.95rem", fontFamily: "Plus Jakarta Sans, sans-serif" }}>
                  {feature.title}
                </h3>
                <p className={textSecondary} style={{ fontSize: "0.85rem", lineHeight: 1.65 }}>
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Stats */}
        <div className="mt-20 rounded-2xl border p-10" style={{ backgroundColor: theme.panel, borderColor: theme.border }}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "100+", label: "Templates" },
              { value: "50+", label: "Node shapes" },
              { value: "10+", label: "Export formats" },
              { value: "99.9%", label: "Uptime SLA" },
            ].map(({ value, label }) => (
              <div key={label}>
                <div className="mb-1" style={{ color: theme.accent, fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 800, fontSize: "2rem" }}>{value}</div>
                <div className={textSecondary} style={{ fontSize: "0.85rem" }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <a
            href="#"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-white"
            style={{ background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}cc)`, fontWeight: 600, fontSize: "0.95rem" }}
          >
            Start building for free <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
