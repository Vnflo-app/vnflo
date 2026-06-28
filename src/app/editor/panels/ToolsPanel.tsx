"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { LucideIcons, ICON_NAMES } from "../utils/icons";
import {
  Square, Circle, Diamond, Hexagon, Triangle, Cylinder, Cloud,
  Palette, ImageIcon, Sparkles, AlignLeft,
  Search, Check, Upload, Wand2, Key, Loader2, Zap, X as XIcon,
  LayoutTemplate, Plus, Trash2, Edit3, Globe, Database, FileCode,
  Layout,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../stores/authStore";
import { supabase } from "../../db/supabase";
import { type NodeShape } from "../nodes/CustomNode";
import { useEditorStore } from "../../stores/editorStore";
import { useEditorTheme } from "../context/EditorThemeContext";
import { getSetting, setSetting, generateId } from "../../db/index";
import { DIAGRAM_TEMPLATES, TEMPLATE_CATEGORIES, type DiagramTemplate } from "../templates/diagramTemplates";
import { DSLPanel } from "./DSLPanel";
import { useAIChatStore } from "../../stores/aiChatStore";

// ─── Shape Panel ────────────────────────────────────────────────────────────

const SHAPES: { shape: NodeShape; label: string; icon: React.ReactNode }[] = [
  { shape: "rect", label: "Rectangle", icon: <Square className="w-5 h-5" /> },
  { shape: "rounded", label: "Rounded", icon: <div className="w-5 h-4 rounded-lg border-2 border-current" /> },
  { shape: "circle", label: "Circle", icon: <Circle className="w-5 h-5" /> },
  { shape: "diamond", label: "Diamond", icon: <Diamond className="w-5 h-5" /> },
  { shape: "hexagon", label: "Hexagon", icon: <Hexagon className="w-5 h-5" /> },
  { shape: "parallelogram", label: "Parallelogram", icon: <div className="w-5 h-4 border-2 border-current" style={{ clipPath: "polygon(15% 0%, 100% 0%, 85% 100%, 0% 100%)" }} /> },
  { shape: "triangle", label: "Triangle", icon: <Triangle className="w-5 h-5" /> },
  { shape: "cylinder", label: "Cylinder", icon: <Cylinder className="w-5 h-5" /> },
  { shape: "cloud", label: "Cloud", icon: <Cloud className="w-5 h-5" /> },
  { shape: "process", label: "Process", icon: <div className="w-5 h-4 border-2 border-current rounded-r-lg" /> },
  { shape: "decision", label: "Decision", icon: <Diamond className="w-5 h-5" /> },
];

interface ShapePanelProps {
  value: NodeShape;
  onChange: (shape: NodeShape) => void;
  onAddNode: (shape: NodeShape) => void;
}

export function ShapePanel({ value, onChange, onAddNode }: ShapePanelProps) {
  const { theme } = useEditorTheme();
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs px-1 mb-1" style={{ color: theme.textMuted }}>Click to add · Select to change shape</p>
      <div className="grid grid-cols-3 gap-2">
        {SHAPES.map(({ shape, label, icon }) => (
          <button
            key={shape}
            onClick={() => { onChange(shape); onAddNode(shape); }}
            title={label}
            className="flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all"
            style={value === shape
              ? { borderColor: theme.accent, background: `${theme.accent}20`, color: theme.accent }
              : { borderColor: theme.border, background: theme.surfaceHover, color: theme.textMuted }
            }
          >
            {icon}
            <span style={{ fontSize: "0.65rem" }}>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Color Panel ─────────────────────────────────────────────────────────────

export interface NodeTheme {
  name: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
}

export const NODE_THEMES: NodeTheme[] = [
  { name: "Midnight Indigo", bgColor: "#4f46e5", borderColor: "#a5b4fc", textColor: "#ffffff" },
  { name: "Crisp Slate", bgColor: "#ffffff", borderColor: "#94a3b8", textColor: "#0f1b2d" },
  { name: "Vibrant Earth", bgColor: "#d97706", borderColor: "#fde68a", textColor: "#1c1917" },
  { name: "Cyber Mint", bgColor: "#059669", borderColor: "#34d399", textColor: "#ffffff" },
  { name: "Synthwave 84", bgColor: "#ff006e", borderColor: "#ffbe0b", textColor: "#ffffff" },
  { name: "Soft Pastel Dream", bgColor: "#c4b5fd", borderColor: "#f582ae", textColor: "#1f1e38" },
  { name: "Monochrome Brutalism", bgColor: "#080808", borderColor: "#ef4444", textColor: "#ffffff" },
];

export interface ThemePanelProps {
  bgColor: string;
  borderColor: string;
  textColor: string;
  onThemeSelect: (theme: NodeTheme) => void;
}

export function ThemePanel({ bgColor, borderColor, textColor, onThemeSelect }: ThemePanelProps) {
  const { theme } = useEditorTheme();

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-2 gap-2">
        {NODE_THEMES.map((t) => {
          const isSelected = bgColor.toLowerCase() === t.bgColor.toLowerCase() &&
            borderColor.toLowerCase() === t.borderColor.toLowerCase() &&
            textColor.toLowerCase() === t.textColor.toLowerCase();
          return (
            <button
              key={t.name}
              type="button"
              onClick={() => onThemeSelect(t)}
              title={t.name}
              className="flex items-center gap-2 p-2 rounded-xl border transition-all text-left hover:scale-[1.02] cursor-pointer"
              style={{
                borderColor: isSelected ? theme.accent : theme.border,
                background: theme.surfaceHover,
              }}
            >
              {/* Visual Preview */}
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center border flex-shrink-0"
                style={{
                  backgroundColor: t.bgColor,
                  borderColor: t.borderColor,
                  color: t.textColor,
                }}
              >
                <span className="text-[10px] font-bold">Aa</span>
              </div>
              <div className="min-w-0">
                <p className="text-[9px] font-semibold truncate" style={{ color: theme.textPrimary }}>{t.name}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}


// ─── Icon Panel ───────────────────────────────────────────────────────────────

// ICON_NAMES is imported from ../utils/icons

interface IconPanelProps {
  value?: string;
  onChange: (name: string | undefined) => void;
}

export function IconPanel({ value, onChange }: IconPanelProps) {
  const { theme } = useEditorTheme();
  const [search, setSearch] = useState("");
  const filtered = ICON_NAMES.filter((n) => n.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: theme.textMuted }} />
        <input
          placeholder="Search icons..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 rounded-lg text-sm focus:outline-none"
          style={{ border: `1px solid ${theme.border}`, background: theme.surfaceHover, color: theme.textPrimary }}
        />
      </div>
      {value && (
        <button
          onClick={() => onChange(undefined)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border text-xs transition-colors"
          style={{ borderColor: "rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.1)", color: "#f87171" }}
        >
          <XIcon className="w-3.5 h-3.5" /> Remove icon
        </button>
      )}
      <div className="grid grid-cols-5 gap-1.5 max-h-64 overflow-y-auto pr-1" style={{ scrollbarWidth: "thin" }}>
        {filtered.map((name) => {
          const Icon = (LucideIcons as any)[name];
          if (!Icon) return null;
          return (
            <button
              key={name}
              title={name}
              onClick={() => onChange(name)}
              className="flex flex-col items-center gap-1 p-2 rounded-xl border transition-all"
              style={value === name
                ? { borderColor: theme.accent, background: `${theme.accent}20`, color: theme.accent }
                : { borderColor: theme.border, background: theme.surfaceHover, color: theme.textMuted }
              }
            >
              <Icon className="w-4 h-4" />
              <span style={{ fontSize: "0.5rem", textOverflow: "ellipsis", overflow: "hidden", width: "100%", textAlign: "center", whiteSpace: "nowrap" }}>{name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}


// ─── Image Panel ──────────────────────────────────────────────────────────────

interface ImagePanelProps {
  value?: string;
  onChange: (data: string | undefined) => void;
}

export function ImagePanel({ value, onChange }: ImagePanelProps) {
  const { theme } = useEditorTheme();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          onChange(e.target?.result as string);
          return;
        }

        const MAX_SIZE = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height = Math.round((height * MAX_SIZE) / width);
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width = Math.round((width * MAX_SIZE) / height);
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        const compressed = canvas.toDataURL("image/jpeg", 0.8);
        onChange(compressed);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col gap-3">
      {value ? (
        <div className="relative rounded-xl overflow-hidden" style={{ border: `1px solid ${theme.border}` }}>
          <img src={value} alt="Node image" className="w-full h-32 object-cover" />
          <button
            onClick={() => onChange(undefined)}
            className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-500/80 flex items-center justify-center text-white hover:bg-red-500 transition-colors"
          >
            <XIcon className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            const file = e.dataTransfer.files[0];
            if (file) processFile(file);
          }}
          onClick={() => inputRef.current?.click()}
          className="h-28 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition-all"
          style={{
            borderColor: dragging ? theme.accent : theme.border,
            background: dragging ? `${theme.accent}12` : theme.surfaceHover,
          }}
        >
          <Upload className="w-5 h-5" style={{ color: theme.textMuted }} />
          <p className="text-xs text-center" style={{ color: theme.textMuted }}>
            Drop an image or <span style={{ color: theme.accent }}>click to upload</span>
          </p>
          <p style={{ fontSize: "0.65rem", color: theme.textMuted }}>PNG, JPG, WebP, GIF</p>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) processFile(f); }}
      />
      <p className="text-xs" style={{ color: theme.textMuted }}>Image is stored locally in IndexedDB with the diagram.</p>
    </div>
  );
}

// ─── AI Panel ─────────────────────────────────────────────────────────────────

interface AIPanelProps {
  currentNodes: any[];
  currentEdges: any[];
  selectedNodeId?: string | null;
  onGenerate: (nodes: GeneratedNode[], edges: GeneratedEdge[], textMessage?: string) => void;
}

export interface GeneratedNode {
  id: string;
  label: string;
  shape: NodeShape;
  bgColor: string;
}

export interface GeneratedEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

const AI_SYSTEM_PROMPT = `You are a conversational diagram assistant. You generate or modify diagrams based on user instructions.
The diagram is represented as a JSON object:
{
  "nodes": [
    { "id": "1", "label": "Label", "shape": "rect", "bgColor": "#080808" }
  ],
  "edges": [
    { "id": "e1", "source": "1", "target": "2", "label": "optional" }
  ]
}
Available shapes: rect, rounded, circle, diamond, hexagon, parallelogram, triangle, cylinder, cloud, process, decision.
Colors should be valid hex values (e.g. "#080808").

If the user provides an existing diagram, you MUST modify it per their instructions (add nodes, delete nodes, connect nodes, change text/color/shape) and return the complete, updated diagram JSON.

You MUST respond with a JSON object in this EXACT format:
{
  "message": "A helpful text explanation of the changes you made or what you created",
  "diagram": {
    "nodes": [...],
    "edges": [...]
  }
}
Output ONLY the JSON object. Do not wrap it in markdown or code blocks.`;

export function AIPanel({ currentNodes, currentEdges, selectedNodeId, onGenerate }: AIPanelProps) {
  const { theme } = useEditorTheme();
  const user = useAuthStore((s) => s.user);
  const refreshProfile = useAuthStore((s) => s.refreshProfile);
  const isPro = user?.subscriptionStatus === "active";
  const creditsExhausted = isPro && user?.aiCredits !== undefined && user.aiCredits <= 0;

  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [enableReasoning, setEnableReasoning] = useState(false);

  const { messages, isGenerating, addMessage, clearChat, setIsGenerating } = useAIChatStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isGenerating) return;
    
    if (!isPro) {
      alert("Pro subscription is required to chat with the AI.");
      return;
    }
    
    if (creditsExhausted) {
      alert("You have exhausted your AI credits. Upgrade or buy more credits.");
      return;
    }

    const userMsg = input.trim();
    setInput("");
    addMessage({ role: "user", content: userMsg });
    setIsGenerating(true);
    setError("");

    try {
      const url = "/api/ai/generate";
      const headers: Record<string, string> = { "Content-Type": "application/json" };

      const diagramContext = {
        nodes: currentNodes.map(n => ({
          id: n.id,
          label: n.data.label || "",
          shape: n.data.shape || "rect",
          bgColor: n.data.bgColor || "",
        })),
        edges: currentEdges.map(e => ({
          id: e.id,
          source: e.source,
          target: e.target,
          label: e.label || "",
        }))
      };

      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error("Not authenticated");
      headers["Authorization"] = `Bearer ${token}`;

      const body = {
        model: "openai/gpt-4o-mini",
        messages: [
          { role: "system", content: AI_SYSTEM_PROMPT },
          { 
            role: "user", 
            content: `Current diagram state:\n${JSON.stringify(diagramContext, null, 2)}\n\nUser request: ${userMsg}` 
          }
        ],
        temperature: 0.7,
        ...(enableReasoning && { reasoning: { enabled: true } })
      };

      const res = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(body)
      });

      if (res.status === 429) throw new Error("Rate limited. Wait a moment and try again.");
      if (res.status === 401) throw new Error("Invalid or expired API credentials.");
      if (!res.ok) {
        const text = await res.text();
        try {
          const errData = JSON.parse(text);
          throw new Error(errData.error?.message || errData.error || `API error ${res.status}`);
        } catch {
          throw new Error(`API error ${res.status}`);
        }
      }

      const responseText = await res.text();
      if (responseText.trim().startsWith("<")) {
        throw new Error("Received HTML instead of JSON. CORS or network error.");
      }
      const json = JSON.parse(responseText);
      const content = json.choices?.[0]?.message?.content || "";
      const reasoningDetails = json.choices?.[0]?.message?.reasoning_details;

      let textMsg = "Diagram updated successfully!";
      let parsedDiagram = null;

      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed.message) {
            textMsg = parsed.message;
          }
          if (parsed.diagram) {
            parsedDiagram = parsed.diagram;
          } else if (parsed.nodes) {
            parsedDiagram = parsed;
          }
        } else {
          textMsg = content;
        }
      } catch {
        textMsg = content || "Error parsing AI response.";
      }

      if (parsedDiagram) {
        onGenerate(parsedDiagram.nodes || [], parsedDiagram.edges || [], undefined);
        addMessage({ 
          role: "assistant", 
          content: textMsg,
          reasoning_details: reasoningDetails
        });
      } else {
        addMessage({ 
          role: "assistant", 
          content: textMsg,
          reasoning_details: reasoningDetails
        });
      }
      
      await refreshProfile();
    } catch (e: any) {
      console.error(e);
      const errMsg = e instanceof Error ? e.message : "Unknown error";
      setError(errMsg);
      addMessage({ role: "assistant", content: `Error: ${errMsg}` });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-h-[580px] text-xs">
      {/* Top action bar */}
      <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: theme.border }}>
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4" style={{ color: theme.accent }} />
          <span className="font-semibold text-xs" style={{ color: theme.textPrimary }}>
            AI Assistant
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isPro && user?.aiCredits !== undefined && (
            <span className="text-[10px] px-2 py-0.5 rounded-full border" style={{ backgroundColor: `${theme.accent}1a`, color: theme.accent, borderColor: `${theme.accent}33` }}>
              Credits: {user.aiCredits.toLocaleString()}
            </span>
          )}
          <button
            onClick={clearChat}
            title="Clear conversation"
            className="p-1 rounded hover:bg-white/5 transition-colors"
            style={{ color: theme.textMuted }}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto py-3 pr-1 flex flex-col gap-3 max-h-[360px]" style={{ scrollbarWidth: "thin" }}>
        {messages.map((msg) => {
          const isUser = msg.role === "user";
          return (
            <div key={msg.id} className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}>
              <span className="text-[9px] mb-0.5 px-1" style={{ color: theme.textMuted }}>
                {isUser ? "You" : "AI Assistant"}
              </span>
              <div
                className={`px-2.5 py-1.5 rounded-xl text-xs leading-relaxed ${
                  isUser ? "text-primary-foreground rounded-tr-none" : "rounded-tl-none border"
                }`}
                style={{
                  background: isUser ? `linear-gradient(135deg, ${theme.accent}, ${theme.accent}cc)` : theme.surfaceHover,
                  borderColor: isUser ? "transparent" : theme.border,
                  color: isUser ? "var(--primary-foreground)" : theme.textPrimary,
                  wordBreak: "break-word",
                }}
              >
                {msg.content}
              </div>
            </div>
          );
        })}
        {isGenerating && (
          <div className="flex items-center gap-1 p-1.5 rounded-xl border max-w-[40%] self-start" style={{ background: theme.surfaceHover, borderColor: theme.border }}>
            <div className="w-1 h-1 rounded-full animate-bounce" style={{ animationDelay: "0ms", backgroundColor: theme.accent }} />
            <div className="w-1 h-1 rounded-full animate-bounce" style={{ animationDelay: "150ms", backgroundColor: theme.accent }} />
            <div className="w-1 h-1 rounded-full animate-bounce" style={{ animationDelay: "300ms", backgroundColor: theme.accent }} />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {error && (
        <div className="px-2 py-1 rounded text-[10px] mb-2" style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.25)", color: "#fca5a5" }}>
          {error}
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSend} className="pt-2 border-t flex gap-1.5 mt-auto" style={{ borderColor: theme.border }}>
        <input
          type="text"
          placeholder="Ask AI to design/edit..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isGenerating || creditsExhausted || !isPro}
          className="flex-1 px-2 py-1.5 rounded-xl border text-xs outline-none focus:border-primary/50"
          style={{
            background: theme.surfaceHover,
            borderColor: theme.border,
            color: theme.textPrimary,
          }}
        />
        <button
          type="button"
          onClick={() => setEnableReasoning(!enableReasoning)}
          className={`px-2 py-1.5 rounded-xl border text-xs transition-colors ${
            enableReasoning ? 'bg-accent/20 border-accent' : 'hover:bg-white/5'
          }`}
          style={{
            borderColor: enableReasoning ? theme.accent : theme.border,
            color: enableReasoning ? theme.accent : theme.textMuted,
          }}
          title="Enable reasoning mode for complex tasks"
        >
          🧠
        </button>
        <button
          type="submit"
          disabled={!input.trim() || isGenerating || creditsExhausted || !isPro}
          className="px-2.5 py-1.5 rounded-xl text-primary-foreground disabled:opacity-40 flex items-center justify-center"
          style={{
            background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}cc)`,
          }}
        >
          <LucideIcons.Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}

// ─── Templates Panel ──────────────────────────────────────────────────────────

interface TemplatesPanelProps {
  onInsert: (nodes: GeneratedNode[], edges: GeneratedEdge[], tpl: DiagramTemplate) => void;
}

export function TemplatesPanel({ onInsert }: TemplatesPanelProps) {
  const { theme } = useEditorTheme();
  const [cat, setCat] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = DIAGRAM_TEMPLATES.filter((t) => {
    const matchCat = cat === "All" || t.category === cat;
    const matchSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleInsert = (tpl: DiagramTemplate) => {
    const idMap: Record<string, string> = {};
    const genNodes: GeneratedNode[] = tpl.nodes.map((n) => {
      const newId = generateId();
      idMap[n.id] = newId;
      return {
        id: newId,
        label: n.label,
        shape: n.shape as NodeShape,
        bgColor: n.bgColor,
      };
    });
    const genEdges: GeneratedEdge[] = tpl.edges.map((e) => ({
      id: generateId(),
      source: idMap[e.source] || e.source,
      target: idMap[e.target] || e.target,
      label: e.label,
    }));
    onInsert(genNodes, genEdges, tpl);
  };

  const pillActive = { background: `${theme.accent}22`, borderColor: `${theme.accent}55`, color: theme.accent };
  const pillInactive = { borderColor: theme.border, color: theme.textMuted };

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs px-1" style={{ color: theme.textMuted }}>
        Insert a template into the current canvas
      </p>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: theme.textMuted }} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search templates..."
          className="w-full pl-9 pr-3 py-2 rounded-xl border text-sm focus:outline-none"
          style={{ background: theme.surfaceHover, borderColor: theme.border, color: theme.textPrimary }}
        />
      </div>

      {/* Category pills */}
      <div className="flex flex-wrap gap-1">
        {TEMPLATE_CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className="px-2.5 py-0.5 rounded-full border text-xs transition-all"
            style={cat === c ? pillActive : pillInactive}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Template list */}
      <div className="flex flex-col gap-2">
        {filtered.map((tpl) => (
          <button
            key={tpl.id}
            onClick={() => handleInsert(tpl)}
            className="flex items-center gap-3 p-2.5 rounded-xl border text-left transition-all group"
            style={{ borderColor: theme.border, background: theme.surfaceHover }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${tpl.color}55`; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = theme.border; }}
          >
            {/* Mini SVG preview */}
            <div className="w-12 h-10 rounded-lg overflow-hidden flex-shrink-0" style={{ background: `${tpl.color}12` }}>
              <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
                {tpl.previewEdges.slice(0, 6).map(([from, to], i) => {
                  const a = tpl.previewNodes[from];
                  const b = tpl.previewNodes[to];
                  if (!a || !b) return null;
                  return (
                    <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                      stroke={tpl.color} strokeWidth="1.2" strokeOpacity="0.45" />
                  );
                })}
                {tpl.previewNodes.slice(0, 6).map((n, i) => (
                  <rect key={i} x={n.x - n.w / 2} y={n.y - 5} width={n.w} height={10} rx="2"
                    fill={`${tpl.color}20`} stroke={tpl.color} strokeWidth="0.7" strokeOpacity="0.8" />
                ))}
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm" style={{ color: theme.textPrimary, fontWeight: 600 }}>{tpl.title}</p>
              <p className="text-xs" style={{ color: theme.textMuted }}>{tpl.nodeCount} nodes · {tpl.category}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Locked Overlay ──────────────────────────────────────────────────────────

function LockedOverlay({ featureName }: { featureName: string }) {
  const router = useRouter();
  const navigate = (path: string) => router.push(path);
  const { theme } = useEditorTheme();
  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-50 backdrop-blur-md rounded-2xl"
      style={{
        background: theme.id === "light" ? "rgba(245, 244, 255, 0.75)" : "rgba(10, 10, 26, 0.75)",
      }}
    >
      <div 
        className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 shadow-lg"
        style={{ 
          background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}cc)`,
          boxShadow: `0 6px 15px ${theme.accent}30`
        }}
      >
        <LucideIcons.Lock className="w-5 h-5 text-primary-foreground" />
      </div>
      <h3 className="font-bold text-sm mb-1.5" style={{ fontFamily: "Plus Jakarta Sans, sans-serif", color: theme.textPrimary }}>
        Pro Feature Locked
      </h3>
      <p className="text-xs mb-6 max-w-[200px] leading-relaxed" style={{ color: theme.textMuted }}>
        Unlock {featureName} and other advanced design tools with a Pro subscription.
      </p>
      <button
        onClick={() => navigate("/pricing")}
        className="w-full py-2.5 rounded-xl text-primary-foreground text-xs font-semibold transition-transform hover:scale-105"
        style={{
          background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}dd)`,
          boxShadow: `0 4px 12px ${theme.accent}25`
        }}
      >
        Upgrade to Pro
      </button>
    </div>
  );
}

// ─── Main ToolsPanel wrapper ──────────────────────────────────────────────────

interface ToolsPanelProps {
  selectedShape: NodeShape;
  colors: { bgColor: string; borderColor: string; textColor: string };
  iconName?: string;
  onShapeChange: (s: NodeShape) => void;
  onAddNode: (s: NodeShape) => void;
  onColorChange: (f: "bgColor" | "borderColor" | "textColor", v: string) => void;
  onIconChange: (name: string | undefined) => void;
  onAIGenerate: (nodes: GeneratedNode[], edges: GeneratedEdge[], textMessage?: string, options?: { mode?: "replace" | "merge"; template?: any }) => void;
  currentNodes: any[];
  currentEdges: any[];
  selectedNodeId?: string | null;
  onAddFrame?: (type: "flowchart") => void;
}

type Tab = "shapes" | "framer" | "colors" | "icons" | "templates" | "ai" | "dsl";

const TABS: { id: Tab; icon: React.ReactNode; label: string }[] = [
  { id: "shapes", icon: <Square className="w-4.5 h-4.5" />, label: "Shapes" },
  { id: "framer", icon: <Layout className="w-4.5 h-4.5" />, label: "Frames" },
  { id: "colors", icon: <Palette className="w-4.5 h-4.5" />, label: "Colors" },
  { id: "icons", icon: <Zap className="w-4.5 h-4.5" />, label: "Icons" },
  { id: "templates", icon: <LayoutTemplate className="w-4.5 h-4.5" />, label: "Templates" },
  { id: "dsl", icon: <FileCode className="w-4.5 h-4.5" />, label: "DSL" },
  { id: "ai", icon: <Sparkles className="w-4.5 h-4.5" />, label: "AI" },
];

export function ToolsPanel({
  selectedShape, colors, iconName,
  onShapeChange, onAddNode, onColorChange, onIconChange, onAIGenerate,
  currentNodes, currentEdges, selectedNodeId,
  onAddFrame,
}: ToolsPanelProps) {
  const activePanel = useEditorStore((s) => s.activePanel);
  const setActivePanel = useEditorStore((s) => s.setActivePanel);
  const { theme } = useEditorTheme();
  const activeTab = activePanel as Tab | null;
  const user = useAuthStore((s) => s.user);

  const isPro = user?.subscriptionStatus === "active";
  const isLockedTab = activeTab && !isPro && ["shapes", "colors", "icons", "dsl", "ai"].includes(activeTab);

  const isLight = theme.id === "light";
  const tabActiveCls = "border";
  const tabActiveStyle = {
    color: theme.accent,
    background: isLight ? `${theme.accent}1f` : `${theme.accent}40`,
    borderColor: isLight ? `${theme.accent}59` : `${theme.accent}66`,
  };
  const tabInactiveCls = isLight
    ? "text-gray-400 hover:text-gray-800"
    : "text-white/40 hover:text-white hover:bg-white/8";

  // Hover delay / debounce to prevent flickering
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnterTab = (id: Tab) => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setActivePanel(id);
  };

  const handleMouseLeave = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
    closeTimeoutRef.current = setTimeout(() => {
      setActivePanel(null);
    }, 250); // 250ms debounce before shrinking
  };

  const handleMouseEnterContainer = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      className="flex flex-col"
      style={{
        position: "absolute",
        left: 10,
        top: "50%",
        transform: "translateY(-50%)",
        zIndex: 10,
        height: "max-content", // Height is strictly bounded by the icon strip
      }}
      onMouseEnter={handleMouseEnterContainer}
      onMouseLeave={handleMouseLeave}
    >
      {/* Vertical icon strip */}
      <div
        className="flex flex-col gap-1 p-2 rounded-2xl"
        style={{ background: theme.panel, border: `1px solid ${theme.border}`, backdropFilter: "blur(16px)" }}
      >
        {TABS.map(({ id, icon, label }) => (
          <button
            key={id}
            title={label}
            onClick={() => handleMouseEnterTab(id)}
            onMouseEnter={() => handleMouseEnterTab(id)}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${activeTab === id ? tabActiveCls : tabInactiveCls}`}
            style={activeTab === id ? tabActiveStyle : {}}
          >
            {icon}
          </button>
        ))}
      </div>

      {/* Floating panel wrapper (stable vertical positioning using static CSS transforms) */}
      <div
        className="absolute left-full ml-2 pointer-events-none"
        style={{
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 10,
        }}
      >
        <AnimatePresence mode="wait">
          {activeTab && (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="rounded-2xl p-4 w-72 overflow-y-auto pointer-events-auto"
              style={{
                background: theme.panel,
                border: `1px solid ${theme.border}`,
                backdropFilter: "blur(20px)",
                maxHeight: "calc(100vh - 120px)",
                scrollbarWidth: "thin",
              }}
            >
              {isLockedTab && (
                <LockedOverlay featureName={TABS.find((t) => t.id === activeTab)?.label ?? "this tool"} />
              )}
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold" style={{ fontFamily: "Plus Jakarta Sans, sans-serif", color: theme.textPrimary }}>
                  {TABS.find((t) => t.id === activeTab)?.label}
                </span>
                <button
                  onClick={() => setActivePanel(null)}
                  className="w-5 h-5 flex items-center justify-center rounded transition-colors"
                  style={{ color: theme.textMuted }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = theme.textPrimary)}
                  onMouseLeave={(e) => (e.currentTarget.style.color = theme.textMuted)}
                >
                  <XIcon className="w-3.5 h-3.5" />
                </button>
              </div>

              {activeTab === "shapes" && (
                <ShapePanel value={selectedShape} onChange={onShapeChange} onAddNode={onAddNode} />
              )}
              {activeTab === "framer" && (
                <div className="flex flex-col gap-3">
                  <p className="text-xs px-1 mb-1" style={{ color: theme.textMuted }}>Click to add a Frame to canvas</p>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => { onAddFrame?.("flowchart"); setActivePanel(null); }}
                      className="w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer"
                      style={{ borderColor: theme.border, background: theme.surfaceHover, color: theme.textPrimary }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = theme.accent + "55"; e.currentTarget.style.background = `${theme.accent}08`; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.background = theme.surfaceHover; }}
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${theme.accent}1a`, color: theme.accent }}>
                        <Layout className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold">Flowchart Frame</div>
                        <div className="text-[10px]" style={{ color: theme.textMuted }}>A container for flowchart nodes</div>
                      </div>
                    </button>
                  </div>
                </div>
              )}
              {activeTab === "colors" && (
                <ThemePanel
                  {...colors}
                  onThemeSelect={(t) => {
                    onColorChange("bgColor", t.bgColor);
                    onColorChange("borderColor", t.borderColor);
                    onColorChange("textColor", t.textColor);
                  }}
                />
              )}
              {activeTab === "icons" && (
                <IconPanel value={iconName} onChange={onIconChange} />
              )}
              {activeTab === "templates" && (
                <TemplatesPanel onInsert={(n, e, tpl) => onAIGenerate(n, e, undefined, { mode: "merge", template: tpl })} />
              )}
              {activeTab === "dsl" && (
                <DSLPanel onGenerate={(n, e) => onAIGenerate(n, e, undefined, { mode: "merge" })} />
              )}
              {activeTab === "ai" && (
                <AIPanel
                  currentNodes={currentNodes}
                  currentEdges={currentEdges}
                  selectedNodeId={selectedNodeId}
                  onGenerate={(n, e, msg) => onAIGenerate(n, e, msg, { mode: "replace" })}
                />
              )}
              
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}