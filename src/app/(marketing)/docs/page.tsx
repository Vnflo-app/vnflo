"use client";

import { useState, useRef } from "react";
import { motion } from "motion/react";
import { useInView } from "motion/react";
import { ChevronDown, ChevronRight, BookOpen, Zap, Code, FileText, Share2, Search } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

interface NavSection {
  title: string;
  icon: React.ElementType;
  items: { id: string; label: string }[];
}

const NAV: NavSection[] = [
  {
    title: "Getting Started",
    icon: Zap,
    items: [
      { id: "quickstart", label: "Quick Start" },
      { id: "installation", label: "Installation" },
      { id: "concepts", label: "Basic Concepts" },
    ],
  },
  {
    title: "Tutorials",
    icon: BookOpen,
    items: [
      { id: "family-tree", label: "Creating a Family Tree" },
      { id: "org-chart", label: "Building an Org Chart" },
      { id: "mind-map", label: "Mind Mapping Basics" },
    ],
  },
  {
    title: "API Reference",
    icon: Code,
    items: [
      { id: "api-nodes", label: "Nodes" },
      { id: "api-edges", label: "Edges" },
      { id: "api-canvas", label: "Canvas" },
    ],
  },
  {
    title: "Templates",
    icon: FileText,
    items: [
      { id: "using-templates", label: "Using Templates" },
      { id: "creating-templates", label: "Creating Templates" },
    ],
  },
  {
    title: "Export & Sharing",
    icon: Share2,
    items: [
      { id: "export-png", label: "PNG & JPEG Export" },
      { id: "export-pdf", label: "PDF Export" },
      { id: "sharing", label: "Sharing Links" },
    ],
  },
];

const CONTENT: Record<string, { title: string; body: React.ReactNode }> = {
  quickstart: {
    title: "Quick Start",
    body: (
      <div className="flex flex-col gap-6">
        <p>Get up and running with Visual Node Flow in under 5 minutes. No installation required — just open your browser and start building.</p>
        <div className="flex flex-col gap-4">
          {[
            { step: 1, title: "Create a free account", desc: "Visit Visual Node Flow.io and click \"Get started free\". Sign up with your email, Google, or GitHub account." },
            { step: 2, title: "Choose a template or blank canvas", desc: "Pick from 100+ starter templates or begin with a blank canvas. Templates automatically pre-populate nodes and edges for your diagram type." },
            { step: 3, title: "Add and connect nodes", desc: "Click anywhere on the canvas to add a node. Drag from a node's edge to another to create a connection. Double-click a node to edit its label." },
          ].map(({ step, title, desc }) => (
            <div key={step} className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-primary" style={{ fontWeight: 700, fontSize: "0.85rem" }}>
                {step}
              </div>
              <div>
                <h4 style={{ fontWeight: 600, marginBottom: "0.25rem" }}>{title}</h4>
                <p style={{ fontSize: "0.875rem", lineHeight: 1.65, opacity: 0.7 }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-xl p-4 border border-primary/25 bg-primary/10">
          <p className="text-primary" style={{ fontSize: "0.85rem", fontWeight: 500 }}>💡 Pro tip</p>
          <p style={{ fontSize: "0.85rem", opacity: 0.8, marginTop: "0.25rem" }}>
            Use keyboard shortcut <kbd className="px-1.5 py-0.5 rounded text-xs border border-current opacity-60">N</kbd> to quickly add a new node at your cursor position.
          </p>
        </div>
      </div>
    ),
  },
  concepts: {
    title: "Basic Concepts",
    body: (
      <div className="flex flex-col gap-6">
        <p>Understanding these core concepts will help you build more effective diagrams in Visual Node Flow.</p>
        {[
          { term: "Nodes", def: "The fundamental building blocks of any diagram. A node represents an entity — a person, system, idea, or any object you want to visualize. Nodes can have labels, icons, colors, shapes, and custom data attributes." },
          { term: "Edges", def: "The connections between nodes. Edges define relationships and can be directed (with an arrow), undirected, or bidirectional. You can label edges, change their style, and set their weight or type." },
          { term: "Canvas", def: "The infinite workspace where your diagram lives. You can pan by holding space + drag, zoom with scroll or pinch, and navigate with the mini-map in the bottom right corner." },
          { term: "Layouts", def: "Automatic arrangement algorithms that organize your nodes into readable patterns. Visual Node Flow supports hierarchical, force-directed, radial, tree, and grid layouts." },
          { term: "Groups", def: "Container nodes that hold other nodes. Groups help you organize large diagrams into logical sections, like departments in an org chart or services in a system architecture." },
        ].map(({ term, def }) => (
          <div key={term}>
            <h4 style={{ fontWeight: 600, marginBottom: "0.35rem" }}>{term}</h4>
            <p style={{ fontSize: "0.875rem", lineHeight: 1.65, opacity: 0.7 }}>{def}</p>
          </div>
        ))}
      </div>
    ),
  },
  "family-tree": {
    title: "Creating a Family Tree",
    body: (
      <div className="flex flex-col gap-6">
        <p>Follow this step-by-step tutorial to create your first family tree diagram.</p>
        <div className="flex flex-col gap-5">
          {[
            { n: 1, t: "Open the Family Tree template", d: "From the dashboard, click New Diagram → Templates → Family Trees → \"Basic Family Tree\". This gives you a pre-built 3-generation structure to customize." },
            { n: 2, t: "Edit the root ancestor", d: "Double-click the top-most node to open the node editor. Enter the name, birth year, and optionally upload a photo. Visual Node Flow supports JPEG, PNG, and WebP images up to 10MB." },
            { n: 3, t: "Add family members", d: "Select a node and press Tab to add a connected child node, or drag from the node's handle to create a new connection to an existing node. Use the relationship type selector to mark connections as Parent, Sibling, Spouse, or Adopted." },
            { n: 4, t: "Fill in biographical details", d: "Click any node and open the Details panel on the right. Add birth/death dates, location, occupation, and notes. These appear in the tooltip when hovering the node." },
            { n: 5, t: "Share with family", d: "Click Share → Copy link. Choose View Only to let family members browse the tree without editing, or Editor to let them contribute." },
          ].map(({ n, t, d }) => (
            <div key={n} className="flex gap-4">
              <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-primary" style={{ fontWeight: 700, fontSize: "0.8rem" }}>
                {n}
              </div>
              <div>
                <h4 style={{ fontWeight: 600, marginBottom: "0.25rem", fontSize: "0.925rem" }}>{t}</h4>
                <p style={{ fontSize: "0.85rem", lineHeight: 1.65, opacity: 0.7 }}>{d}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  "api-nodes": {
    title: "Nodes API Reference",
    body: (
      <div className="flex flex-col gap-6">
        <p>Use the Visual Node Flow JavaScript SDK to programmatically create and manage nodes.</p>
        <div className="flex flex-col gap-8">
          {[
            {
              fn: "nb.addNode(options)",
              desc: "Creates a new node on the canvas.",
              code: `const node = await nb.addNode({
  label: "Marketing Team",
  shape: "rounded-rect",
  color: "#080808",
  x: 200,
  y: 150,
  data: {
    department: "Marketing",
    headCount: 12,
  }
});`,
            },
            {
              fn: "nb.updateNode(id, options)",
              desc: "Updates an existing node's properties.",
              code: `await nb.updateNode(node.id, {
  label: "Growth Team",
  color: "#4f46e5",
});`,
            },
            {
              fn: "nb.deleteNode(id)",
              desc: "Removes a node and all its connected edges.",
              code: `await nb.deleteNode(node.id);`,
            },
          ].map(({ fn, desc, code }) => (
            <div key={fn}>
              <h4 className="text-primary" style={{ fontWeight: 600, fontSize: "0.95rem", fontFamily: "monospace", marginBottom: "0.35rem" }}>{fn}</h4>
              <p style={{ fontSize: "0.85rem", opacity: 0.7, marginBottom: "0.75rem" }}>{desc}</p>
              <pre className="rounded-xl p-4 border border-white/8 overflow-x-auto" style={{ background: "rgba(255,255,255,0.04)", fontSize: "0.8rem", lineHeight: 1.7 }}>
                <code>{code}</code>
              </pre>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  "export-png": {
    title: "PNG & JPEG Export",
    body: (
      <div className="flex flex-col gap-6">
        <p>Export your diagrams as high-quality raster images for use in presentations, documents, or anywhere images are supported.</p>
        {[
          { t: "Via the toolbar", d: "Click the Export button in the top toolbar. Select PNG or JPEG, choose your desired resolution (1x, 2x, or 4x for Retina), and click Download." },
          { t: "Via keyboard shortcut", d: "Press Cmd/Ctrl + Shift + E to open the export dialog directly." },
          { t: "Resolution guide", d: "1x: Standard screen (72 DPI). 2x: Retina/HD displays (144 DPI). 4x: Print quality (288 DPI). For presentations, 2x is usually sufficient." },
          { t: "Transparent background", d: "PNG exports support transparency. Enable \"Transparent background\" in the export dialog to remove the white or colored canvas background." },
        ].map(({ t, d }) => (
          <div key={t}>
            <h4 style={{ fontWeight: 600, marginBottom: "0.3rem", fontSize: "0.925rem" }}>{t}</h4>
            <p style={{ fontSize: "0.875rem", lineHeight: 1.65, opacity: 0.7 }}>{d}</p>
          </div>
        ))}
      </div>
    ),
  },
  installation: {
    title: "Installation",
    body: (
      <div className="flex flex-col gap-6">
        <p>Visual Node Flow is a web-based application — no installation is required for the core product. However, if you want to use the SDK or self-host, follow the guides below.</p>
        <div>
          <h4 style={{ fontWeight: 600, marginBottom: "0.5rem" }}>Install the JavaScript SDK</h4>
          <pre className="rounded-xl p-4 border border-white/8 overflow-x-auto" style={{ background: "rgba(255,255,255,0.04)", fontSize: "0.8rem" }}>
            <code>npm install @Visual Node Flow/sdk</code>
          </pre>
        </div>
        <div>
          <h4 style={{ fontWeight: 600, marginBottom: "0.5rem" }}>Initialize the SDK</h4>
          <pre className="rounded-xl p-4 border border-white/8 overflow-x-auto" style={{ background: "rgba(255,255,255,0.04)", fontSize: "0.8rem", lineHeight: 1.7 }}>
            <code>{`import Visual Node Flow from '@Visual Node Flow/sdk';

const nb = new Visual Node Flow({
  apiKey: 'YOUR_API_KEY',
  workspace: 'your-workspace-id',
});`}</code>
          </pre>
        </div>
      </div>
    ),
  },
};

const DEFAULT_SECTION = "quickstart";

function NavGroup({ section, activeId, onSelect }: { section: NavSection; activeId: string; onSelect: (id: string) => void }) {
  const [open, setOpen] = useState(section.items.some((i) => i.id === activeId));
  const { isDark, theme } = useTheme();
  const Icon = section.icon;
  const textMuted = "text-muted-foreground/80";
  const textActive = "text-primary";
  const textInactive = "text-muted-foreground hover:text-foreground";

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${textMuted} hover:text-foreground`}
        style={{ fontWeight: 600 }}
      >
        <Icon className="w-4 h-4 flex-shrink-0" style={{ color: theme.accent }} />
        <span>{section.title}</span>
        <ChevronDown className={`w-3.5 h-3.5 ml-auto transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="ml-6 mt-1 flex flex-col gap-0.5">
          {section.items.map((item) => (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              className={`text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${activeId === item.id ? `${textActive} bg-primary/10` : textInactive}`}
              style={{ fontWeight: activeId === item.id ? 500 : 400 }}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function DocsPage() {
  const [activeId, setActiveId] = useState(DEFAULT_SECTION);
  const { isDark, theme } = useTheme();
  const contentRef = useRef(null);
  const contentInView = useInView(contentRef, { once: true });

  const active = CONTENT[activeId] ?? CONTENT[DEFAULT_SECTION];
  const bg = "bg-background text-foreground";
  const textPrimary = "text-foreground";
  const textSecondary = "text-muted-foreground";

  return (
    <div className={`min-h-screen pt-16 ${bg}`} style={{ backgroundColor: theme.canvas }}>
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex gap-8 items-start">
          {/* Sidebar */}
          <aside className="hidden lg:flex flex-col gap-1.5 w-64 flex-shrink-0 sticky top-28 rounded-2xl border p-4"
            style={{ backgroundColor: theme.panel, borderColor: theme.border }}>
            {/* Search */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50" />
              <input
                type="text"
                placeholder="Search docs..."
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground outline-none text-sm"
              />
            </div>
            {NAV.map((section) => (
              <NavGroup key={section.title} section={section} activeId={activeId} onSelect={setActiveId} />
            ))}
          </aside>

          {/* Content */}
          <main className="flex-1 min-w-0">
            {/* Mobile nav */}
            <div className="lg:hidden mb-6">
              <select
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-card text-foreground outline-none text-sm"
                value={activeId}
                onChange={(e) => setActiveId(e.target.value)}
              >
                {NAV.map((section) =>
                  section.items.map((item) => (
                    <option key={item.id} value={item.id}>{section.title} — {item.label}</option>
                  ))
                )}
              </select>
            </div>

            <motion.div
              key={activeId}
              ref={contentRef}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className={`rounded-2xl border p-8 md:p-10 ${textSecondary}`}
              style={{ backgroundColor: theme.panel, borderColor: theme.border }}
            >
              <div className="flex items-center gap-2 mb-2">
                <ChevronRight className="w-4 h-4" style={{ color: theme.accent }} />
                <span className="text-sm" style={{ color: theme.accent }}>Documentation</span>
              </div>
              <h1 className={`mb-8 ${textPrimary}`} style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 800, fontSize: "1.9rem", lineHeight: 1.2 }}>
                {active.title}
              </h1>
              <div className={`${textSecondary}`} style={{ fontSize: "0.925rem", lineHeight: 1.8 }}>
                {active.body}
              </div>

              {/* Nav footer */}
              <div className="mt-12 pt-6 border-t flex items-center justify-between" style={{ borderColor: theme.border }}>
                <button
                  onClick={() => {
                    const allItems = NAV.flatMap((s) => s.items);
                    const idx = allItems.findIndex((i) => i.id === activeId);
                    if (idx > 0) setActiveId(allItems[idx - 1].id);
                  }}
                  className={`flex items-center gap-2 text-sm transition-colors ${textSecondary} hover:text-primary`}
                >
                  <ChevronRight className="w-4 h-4 rotate-180" /> Previous
                </button>
                <button
                  onClick={() => {
                    const allItems = NAV.flatMap((s) => s.items);
                    const idx = allItems.findIndex((i) => i.id === activeId);
                    if (idx < allItems.length - 1) setActiveId(allItems[idx + 1].id);
                  }}
                  className={`flex items-center gap-2 text-sm transition-colors ${textSecondary} hover:text-primary`}
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </main>
        </div>
      </div>
    </div>
  );
}
