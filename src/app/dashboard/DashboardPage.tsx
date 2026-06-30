"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  Plus, GitBranch, LogOut, Search, Trash2, Edit3,
  GitBranch as TreeIcon, Building2, Brain, Network, FileText, MoreHorizontal,
  Sun, Moon, Palette, LayoutTemplate, ArrowRight, ChevronRight, Lock, Menu, X, Folder,
  User, Mail, Camera, Save, Globe, MapPin, Check, AlertCircle, Eye, EyeOff, Crown, Settings
} from "lucide-react";
import { useAuthStore } from "../stores/authStore";
import { useDiagramStore } from "../stores/diagramStore";
import { useTheme, SITE_THEMES, type ThemeId } from "../context/ThemeContext";
import { type DiagramData } from "../db/index";
import { DIAGRAM_TEMPLATES, TEMPLATE_CATEGORIES, type DiagramTemplate } from "../editor/templates/diagramTemplates";
import { type Node, type Edge } from "@xyflow/react";
import { applyElkLayout } from "../editor/hooks/useElkLayout";
import { supabase } from "../db/supabase";
import { toast } from "sonner";

const DIAGRAM_ICONS = [TreeIcon, Building2, Brain, Network, FileText];
const ACCENT_COLORS = ["#a78bfa", "#67e8f9", "#f9a8d4", "#86efac", "#fbbf24", "#818cf8"];

function buildRFNodes(tpl: DiagramTemplate): Node[] {
  return tpl.nodes.map((n, i) => ({
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

function buildRFEdges(tpl: DiagramTemplate): Edge[] {
  return tpl.edges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    label: e.label,
    style: { stroke: tpl.color, strokeWidth: 2 },
    markerEnd: { type: "arrowclosed", color: tpl.color },
  }));
}

function DiagramCard({
  diagram, onOpen, onDelete, onRename, isDark,
}: {
  diagram: DiagramData;
  onOpen: () => void;
  onDelete: () => void;
  onRename: (name: string) => void;
  isDark: boolean;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [nameValue, setNameValue] = useState(diagram.name);

  const colorIdx = diagram.id.charCodeAt(0) % ACCENT_COLORS.length;
  const IconIdx = diagram.id.charCodeAt(1) % DIAGRAM_ICONS.length;
  const color = ACCENT_COLORS[colorIdx];
  const Icon = DIAGRAM_ICONS[IconIdx];

  const timeAgo = (ms: number) => {
    const diff = Date.now() - ms;
    if (diff < 60000) return "just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  };

  const cardBg = isDark
    ? "border-white/8 hover:border-white/20"
    : "border-gray-200 hover:border-gray-400 shadow-sm hover:shadow-md bg-white";
  const thumbBg = isDark ? `${color}12` : `${color}15`;
  const menuBg = isDark ? "rgba(15,15,35,0.97)" : "rgba(255,255,255,0.99)";
  const menuBorder = isDark ? "border-white/12" : "border-gray-200";
  const textPrimary = isDark ? "text-white" : "text-gray-900";
  const textMuted = isDark ? "text-white/35" : "text-gray-400";
  const menuItemBase = isDark
    ? "text-white/70 hover:text-white hover:bg-white/6"
    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={`group relative rounded-2xl border overflow-hidden cursor-pointer transition-all duration-300 @container ${cardBg}`}
      style={{ background: isDark ? "rgba(255,255,255,0.03)" : undefined }}
      onClick={!menuOpen && !renaming ? onOpen : undefined}
    >
      {/* Thumbnail */}
      <div className="h-28 @[260px]:h-36 flex items-center justify-center relative overflow-hidden" style={{ background: thumbBg }}>
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `linear-gradient(${color}30 1px, transparent 1px), linear-gradient(90deg, ${color}30 1px, transparent 1px)`,
            backgroundSize: "24px 24px",
          }}
        />
        {diagram.thumbnailUrl ? (
          <img src={diagram.thumbnailUrl} alt="" className="w-full h-full object-cover opacity-60" />
        ) : (
          <Icon className="w-8 @[260px]:w-10 @[260px]:h-10 opacity-40" style={{ color }} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

        <div className="absolute top-2 @[260px]:top-3 right-2 @[260px]:right-3 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
          <div className="relative">
            <button
              onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
              className="w-7 h-7 rounded-lg bg-black/50 border border-white/20 flex items-center justify-center text-white/70 hover:text-white cursor-pointer"
            >
              <MoreHorizontal className="w-3.5 h-3.5" />
            </button>
            {menuOpen && (
              <div
                className={`absolute top-8 right-0 rounded-xl border py-1 z-20 min-w-36 ${menuBorder}`}
                style={{ background: menuBg, backdropFilter: "blur(12px)" }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => { setRenaming(true); setMenuOpen(false); }}
                  className={`flex items-center gap-2 w-full px-3 py-2 text-sm transition-colors cursor-pointer ${menuItemBase}`}
                >
                  <Edit3 className="w-3.5 h-3.5" /> Rename
                </button>
                <button
                  onClick={() => { onDelete(); setMenuOpen(false); }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="absolute bottom-3 left-3">
          <span
            className="text-xs px-2 py-0.5 rounded-full border border-white/20 bg-black/40 text-white/60"
          >
            {(diagram.metadata as any)?.nodeCount ?? 0} nodes
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-3 @[260px]:p-4">
        {renaming ? (
          <input
            autoFocus
            value={nameValue}
            onChange={(e) => setNameValue(e.target.value)}
            onBlur={() => { onRename(nameValue); setRenaming(false); }}
            onKeyDown={(e) => {
              if (e.key === "Enter") { onRename(nameValue); setRenaming(false); }
              if (e.key === "Escape") { setNameValue(diagram.name); setRenaming(false); }
            }}
            onClick={(e) => e.stopPropagation()}
            className="w-full bg-transparent border-b border-primary outline-none pb-0.5"
            style={{ color: isDark ? "white" : "#111", fontWeight: 600, fontSize: "0.9rem" }}
          />
        ) : (
          <h3
            className={`truncate ${textPrimary}`}
            style={{ fontWeight: 600, fontSize: "0.9rem" }}
          >
            {diagram.name}
          </h3>
        )}
        <p className={`mt-1 ${textMuted}`} style={{ fontSize: "0.75rem" }}>
          Edited {timeAgo(diagram.updatedAt)}
        </p>
      </div>
    </motion.div>
  );
}

function TemplatePicker({
  onSelect,
  onBlank,
  isDark,
  isFullPage = false,
}: {
  onSelect: (tpl: DiagramTemplate) => void;
  onBlank: () => void;
  isDark: boolean;
  isFullPage?: boolean;
}) {
  const [cat, setCat] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = DIAGRAM_TEMPLATES.filter((t) => {
    const matchCat = cat === "All" || t.category === cat;
    const matchSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const pillActive = "border-primary text-primary bg-primary/10";
  const pillInactive = isDark
    ? "border-white/12 text-white/50 hover:border-white/25 hover:text-white"
    : "border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-700";
  const inputStyle = isDark
    ? "bg-white/5 border-white/12 text-white placeholder-white/30 focus:border-primary/50"
    : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-primary";
  const textMuted = isDark ? "text-white/50" : "text-gray-500";
  const textPrimary = isDark ? "text-white" : "text-gray-900";
  const blankCardCls = isDark
    ? "border-white/10 hover:border-primary/50 hover:bg-primary/5 text-white/50 hover:text-white"
    : "border-gray-200 hover:border-primary/50 hover:bg-primary/5 text-gray-500 hover:text-primary";

  return (
    <div className="flex flex-col gap-4 @container">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-current opacity-40" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search templates..."
          className={`w-full pl-9 pr-3 py-2 rounded-xl border text-sm outline-none transition-colors ${inputStyle}`}
        />
      </div>

      {/* Category pills */}
      <div className="flex flex-wrap gap-1.5">
        {TEMPLATE_CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`px-3 py-1 rounded-full border text-xs transition-all cursor-pointer ${cat === c ? pillActive : pillInactive}`}
            style={{ fontWeight: cat === c ? 600 : 400 }}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div
        className={`grid grid-cols-2 ${isFullPage ? "sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5" : "@[500px]:grid-cols-3"} gap-3 ${
          isFullPage ? "" : "max-h-72 overflow-y-auto pr-0.5"
        }`}
        style={{ scrollbarWidth: "thin" }}
      >
        {/* Blank option */}
        {cat === "All" && !search && (
          <button
            onClick={onBlank}
            className={`rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 p-4 transition-all cursor-pointer ${blankCardCls} ${
              isFullPage ? "h-40 sm:h-44" : ""
            }`}
          >
            <Plus className="w-5 h-5" />
            <span className="text-xs" style={{ fontWeight: 500 }}>Blank Diagram</span>
          </button>
        )}

        {filtered.map((tpl) => (
          <button
            key={tpl.id}
            onClick={() => onSelect(tpl)}
            className={`rounded-xl border overflow-hidden text-left transition-all group cursor-pointer ${
              isDark ? "border-white/8 hover:border-white/25" : "border-gray-200 hover:border-gray-400"
            }`}
            style={{ background: isDark ? "rgba(255,255,255,0.025)" : "white" }}
          >
            {/* Mini preview */}
            <div
              className={`relative overflow-hidden flex items-center justify-center ${
                isFullPage ? "h-24 sm:h-28" : "h-14"
              }`}
              style={{ background: `${tpl.color}10` }}
            >
              <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
                {tpl.previewEdges.slice(0, 8).map(([from, to], i) => {
                  const a = tpl.previewNodes[from];
                  const b = tpl.previewNodes[to];
                  if (!a || !b) return null;
                  return (
                    <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                      stroke={tpl.color} strokeWidth="1" strokeOpacity="0.4" strokeDasharray="2.5 2" />
                  );
                })}
                {tpl.previewNodes.slice(0, 8).map((n, i) => (
                  <rect key={i} x={n.x - n.w / 2} y={n.y - 5.5} width={n.w} height={11} rx="3"
                    fill={`${tpl.color}20`} stroke={tpl.color} strokeWidth="0.6" strokeOpacity="0.8" />
                ))}
              </svg>
            </div>
            <div className={isFullPage ? "p-3" : "px-2 py-1.5"}>
              <p className={`truncate ${textPrimary}`} style={{ fontSize: isFullPage ? "0.78rem" : "0.7rem", fontWeight: 600 }}>
                {tpl.title}
              </p>
              <p className={`truncate ${textMuted}`} style={{ fontSize: isFullPage ? "0.66rem" : "0.62rem" }}>
                {tpl.nodeCount} nodes
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function SidebarThemeSelector() {
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const { themeId, setThemeId, isDark, theme } = useTheme();

  const toggleColor = isDark
    ? "border-white/8 text-white/50 hover:text-white hover:bg-white/8"
    : "border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-100";

  return (
    <div className="relative animate-fade-in">
      <button
        onClick={() => setShowThemeMenu(!showThemeMenu)}
        className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors border cursor-pointer flex-shrink-0 ${toggleColor}`}
        title="Change theme"
      >
        <Palette className="w-4.5 h-4.5" />
      </button>

      {showThemeMenu && (
        <>
          <div className="fixed inset-0 z-45" onClick={() => setShowThemeMenu(false)} />
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute right-0 mt-2 w-40 rounded-xl border p-1.5 shadow-xl z-50 backdrop-blur-lg"
            style={{
              background: theme.panel,
              borderColor: theme.border,
            }}
          >
            {Object.values(SITE_THEMES).map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setThemeId(t.id);
                  setShowThemeMenu(false);
                }}
                className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs transition-colors text-left ${
                  themeId === t.id
                    ? isDark
                      ? "bg-white/10 text-white font-medium"
                      : "bg-black/5 text-black font-medium"
                    : isDark
                    ? "text-white/60 hover:text-white hover:bg-white/5"
                    : "text-gray-600 hover:text-gray-900 hover:bg-black/5"
                }`}
              >
                <span
                  className="w-3 h-3 rounded-full border border-black/10 dark:border-white/10"
                  style={{ backgroundColor: t.swatch }}
                />
                {t.label}
              </button>
            ))}
          </motion.div>
        </>
      )}
    </div>
  );
}

export function DashboardPage() {
  const { user, logout, updateProfile, changePassword, loading: authLoading, initialized: authInitialized } = useAuthStore();
  const { diagrams, loading, loadDiagrams, createDiagram, deleteDiagram, updateDiagram } = useDiagramStore();
  const router = useRouter();
  const navigate = (path: string) => router.push(path);
  const { themeId, setThemeId, isDark, theme } = useTheme();
  
  const [search, setSearch] = useState("");
  const [showNewModal, setShowNewModal] = useState(false);
  const [step, setStep] = useState<"pick" | "name">("pick");
  const [selectedTemplate, setSelectedTemplate] = useState<DiagramTemplate | null>(null);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [limitModalType, setLimitModalType] = useState<"expired" | "limit" | null>(null);

  // Layout Tab selection: "diagrams" | "profile" | "templates" | "account" | "security" | "billing" | "data"
  const [activeTab, setActiveTab] = useState<"diagrams" | "profile" | "templates" | "account" | "security" | "billing" | "data">("diagrams");
  // Mobile drawer visibility toggle
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // ── Profile Settings Form States ──
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileSaveError, setProfileSaveError] = useState("");
  const avatarRef = useRef<HTMLInputElement>(null);

  // Profile fields state
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [website, setWebsite] = useState("");
  const [location, setLocation] = useState("");
  const [avatar, setAvatar] = useState("");
  const [email, setEmail] = useState("");

  // Security password fields state
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  // Subscription cancel state
  const [canceling, setCanceling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const isPro = user?.subscriptionStatus === "active";
  const trialExpired = user ? (Date.now() - user.createdAt > 24 * 60 * 60 * 1000) : false;

  const bg = theme.canvas;
  const headerBg = theme.panel;
  const headerBorder = isDark ? "border-white/8" : "border-gray-200";
  const cardBorder = isDark ? "border-white/8" : "border-gray-200";
  const textPrimary = isDark ? "text-white" : "text-gray-900";
  const textMuted = isDark ? "text-white/40" : "text-gray-400";
  const searchBg = isDark
    ? "border-white/10 bg-white/5 text-white placeholder-white/25 focus:border-primary/50"
    : "border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:border-primary";
  const modalBg = isDark ? "rgba(12,12,30,0.98)" : "rgba(255,255,255,0.99)";
  const btnSecondary = isDark
    ? "border-white/12 text-white/60 hover:text-white"
    : "border-gray-200 text-gray-500 hover:text-gray-900";

  const inputStyle = {
    background: isDark ? "rgba(255,255,255,0.05)" : "#f9fafb",
    border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "#e5e7eb"}`,
    color: isDark ? "rgba(255,255,255,0.9)" : "#111827",
  };
  const inputCls = "w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none transition-all";
  const labelCls = `text-xs font-semibold mb-1.5 block ${textMuted}`;

  useEffect(() => {
    if (!authInitialized) return;
    if (authLoading) return; // still fetching profile — don't redirect yet
    if (!user) { navigate("/auth"); return; }
    loadDiagrams(user.id);
  }, [user, authInitialized, authLoading]);

  // Sync profile details when user profile updates
  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || "");
      setBio(user.bio || "");
      setWebsite(user.website || "");
      setLocation(user.location || "");
      setAvatar(user.avatar || "");
      setEmail(user.email || "");
    }
  }, [user]);

  const checkLimitForCreation = () => {
    if (!isPro) {
      if (trialExpired) {
        setLimitModalType("expired");
        setShowLimitModal(true);
        return false;
      }
      if (diagrams.length >= 3) {
        setLimitModalType("limit");
        setShowLimitModal(true);
        return false;
      }
    }
    return true;
  };

  const openNewModal = () => {
    if (!checkLimitForCreation()) return;
    setStep("pick");
    setSelectedTemplate(null);
    setNewName("");
    setShowNewModal(true);
  };

  const handleOpenDiagram = (id: string) => {
    if (!isPro && trialExpired) {
      setLimitModalType("expired");
      setShowLimitModal(true);
      return;
    }
    navigate(`/editor/${id}`);
  };

  const handlePickTemplate = (tpl: DiagramTemplate) => {
    if (!checkLimitForCreation()) return;
    setSelectedTemplate(tpl);
    setNewName(tpl.title);
    setStep("name");
    setShowNewModal(true);
  };

  const handlePickBlank = () => {
    if (!checkLimitForCreation()) return;
    setSelectedTemplate(null);
    setNewName("Untitled Diagram");
    setStep("name");
    setShowNewModal(true);
  };

  const handleCreate = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newName.trim()) return;
    setCreating(true);
    try {
      let nodes = selectedTemplate ? buildRFNodes(selectedTemplate) : [];
      const edges = selectedTemplate ? buildRFEdges(selectedTemplate) : [];
      if (selectedTemplate && nodes.length > 0) {
        nodes = await applyElkLayout(nodes, edges, "TB");
      }
      const d = await createDiagram(newName.trim(), user.id, nodes, edges);
      setShowNewModal(false);
      navigate(`/editor/${d.id}`);
    } finally {
      setCreating(false);
    }
  }, [user, newName, selectedTemplate, createDiagram, navigate]);

  const handleDelete = async (id: string) => {
    await deleteDiagram(id);
  };

  const handleRename = async (diagram: DiagramData, name: string) => {
    if (name.trim() && name !== diagram.name) {
      await updateDiagram({ ...diagram, name: name.trim() });
    }
  };

  // ── Profile Settings Save Actions ──
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          setAvatar(ev.target?.result as string);
          return;
        }

        const MAX_SIZE = 150;
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

        const compressed = canvas.toDataURL("image/jpeg", 0.7);
        setAvatar(compressed);
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async () => {
    setProfileSaveError("");
    try {
      await updateProfile({ displayName, bio, website, location, avatar });
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2500);
      toast.success("Profile saved!");
    } catch (e) {
      setProfileSaveError((e as Error).message);
      toast.error("Profile save failed.");
    }
  };

  const handleSaveAccount = async () => {
    setProfileSaveError("");
    try {
      await updateProfile({ email });
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2500);
      toast.success("Account email saved!");
    } catch (e) {
      setProfileSaveError((e as Error).message);
      toast.error("Account save failed.");
    }
  };

  const handleChangePassword = async () => {
    setProfileSaveError("");
    if (newPass !== confirmPass) { setProfileSaveError("Passwords don't match"); return; }
    if (newPass.length < 6) { setProfileSaveError("Password too short (min 6)"); return; }
    try {
      await changePassword(currentPass, newPass);
      setCurrentPass(""); setNewPass(""); setConfirmPass("");
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2500);
      toast.success("Password updated!");
    } catch (e) {
      setProfileSaveError((e as Error).message);
      toast.error("Password update failed.");
    }
  };

  const handleCancelSubscription = async () => {
    setShowCancelModal(false);
    const toastId = toast.loading("Canceling subscription...");
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error("Token missing");

      const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api";
      const res = await fetch(`${API_BASE}/subscriptions/cancel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to cancel subscription");
      }

      toast.dismiss(toastId);
      toast.success("Canceled successfully.");
      
      const authStore = useAuthStore.getState();
      await authStore.init();
    } catch (e: any) {
      toast.dismiss(toastId);
      toast.error(e.message || "Cancellation failed");
    }
  };

  const filtered = diagrams.filter((d) => d.name.toLowerCase().includes(search.toLowerCase()));
  const initials = user?.username.slice(0, 2).toUpperCase() ?? "??";
  const memberSince = user ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "";

  const renderSidebarContent = () => {
    return (
      <div className="flex flex-col h-full">
        {/* User Profile Card & Theme Toggle (outside scroll area so dropdown is never clipped) */}
        <div className="p-4 pb-3 flex items-center gap-2 border-b" style={{ borderColor: theme.border }}>
          <button
            onClick={() => { setActiveTab("profile"); setMobileMenuOpen(false); }}
            className={`flex-1 flex items-center gap-3 p-2 rounded-xl text-left transition-all border cursor-pointer min-w-0 ${
              activeTab === "profile"
                ? isDark
                  ? "bg-primary/10 text-primary border-l-2 border-primary"
                  : "bg-primary/5 text-primary border-l-2 border-primary/20"
                : isDark
                  ? "border-white/8 hover:border-white/15 hover:bg-white/5" 
                  : "border-gray-200 hover:border-primary/20 hover:bg-primary/5"
            }`}
          >
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt="avatar"
                className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                style={{ boxShadow: `0 0 0 2px ${theme.accent}66` }}
              />
            ) : (
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-primary-foreground flex-shrink-0"
                style={{
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}cc)`,
                  boxShadow: `0 0 0 2px ${theme.accent}50`,
                }}
              >
                {initials}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className={`text-[0.7rem] font-semibold truncate ${textPrimary}`}>{user?.displayName || user?.username}</p>
              <p className="text-[0.6rem] font-bold" style={{ color: theme.accent }}>{isPro ? "✦ Pro" : "Free"}</p>
            </div>
          </button>

          <SidebarThemeSelector />
        </div>

        {/* Navigation & Controls */}
        <div className="p-4 pt-3 flex-1 flex flex-col gap-6 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
          
          {/* New Diagram Button */}
          <button
            onClick={openNewModal}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-primary-foreground text-sm font-semibold transition-transform hover:scale-[1.01] cursor-pointer"
            style={{ 
              background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}dd)`,
              boxShadow: `0 8px 20px ${theme.accent}3d`
            }}
          >
            <Plus className="w-4 h-4" />
            <span>New Diagram</span>
          </button>

          {/* Search */}
          <div className="relative">
            <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? "text-white/30" : "text-gray-400"}`} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search diagrams..."
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm outline-none transition-all ${searchBg}`}
            />
          </div>

          {/* Navigation Links */}
          <div className="flex flex-col gap-1.5">
            <span className={`text-[0.68rem] font-bold px-3 uppercase tracking-wider ${textMuted}`}>Workspace</span>
            <button
              onClick={() => { setActiveTab("diagrams"); setMobileMenuOpen(false); }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                activeTab === "diagrams"
                  ? "bg-primary/10 text-primary border-l-2 border-primary"
                  : `${isDark ? "text-white/60 hover:text-white hover:bg-white/5" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"}`
              }`}
            >
              <Folder className="w-4 h-4" />
              <span>My Diagrams</span>
            </button>
            <button
              onClick={() => { setActiveTab("profile"); setMobileMenuOpen(false); }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                activeTab === "profile"
                  ? "bg-primary/10 text-primary border-l-2 border-primary"
                  : `${isDark ? "text-white/60 hover:text-white hover:bg-white/5" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"}`
              }`}
            >
              <User className="w-4 h-4" />
              <span>Profile</span>
            </button>
            <button
              onClick={() => { setActiveTab("templates"); setMobileMenuOpen(false); }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                activeTab === "templates"
                  ? "bg-primary/10 text-primary border-l-2 border-primary"
                  : `${isDark ? "text-white/60 hover:text-white hover:bg-white/5" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"}`
              }`}
            >
              <LayoutTemplate className="w-4 h-4" />
              <span>Templates</span>
            </button>

            <span className={`text-[0.68rem] font-bold px-3 uppercase tracking-wider mt-4 ${textMuted}`}>Settings</span>
            <button
              onClick={() => { setActiveTab("account"); setMobileMenuOpen(false); }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                activeTab === "account"
                  ? "bg-primary/10 text-primary border-l-2 border-primary"
                  : `${isDark ? "text-white/60 hover:text-white hover:bg-white/5" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"}`
              }`}
            >
              <Mail className="w-4 h-4" />
              <span>Account</span>
            </button>
            <button
              onClick={() => { setActiveTab("security"); setMobileMenuOpen(false); }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                activeTab === "security"
                  ? "bg-primary/10 text-primary border-l-2 border-primary"
                  : `${isDark ? "text-white/60 hover:text-white hover:bg-white/5" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"}`
              }`}
            >
              <Lock className="w-4 h-4" />
              <span>Security</span>
            </button>
            <button
              onClick={() => { setActiveTab("billing"); setMobileMenuOpen(false); }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                activeTab === "billing"
                  ? "bg-primary/10 text-primary border-l-2 border-primary"
                  : `${isDark ? "text-white/60 hover:text-white hover:bg-white/5" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"}`
              }`}
            >
              <Crown className="w-4 h-4" />
              <span>Billing</span>
            </button>
            <button
              onClick={() => { setActiveTab("data"); setMobileMenuOpen(false); }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                activeTab === "data"
                  ? "bg-primary/10 text-primary border-l-2 border-primary"
                  : `${isDark ? "text-white/60 hover:text-white hover:bg-white/5" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"}`
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Data</span>
            </button>
          </div>
        </div>

        {/* Footer controls - only keep sign-out in the bottom */}
        <div className="p-4 border-t" style={{ borderColor: headerBorder }}>
          <button
            onClick={logout}
            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all border cursor-pointer text-xs font-semibold ${
              isDark 
                ? "border-white/8 text-white/60 hover:text-white hover:bg-white/5" 
                : "border-gray-200 text-gray-500 hover:text-red-650 hover:bg-red-50/50"
            }`}
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row" style={{ background: bg }}>
      {/* Mobile Header */}
      <header
        className={`h-14 border-b ${headerBorder} flex items-center justify-between px-4 md:hidden sticky top-0 z-20 backdrop-blur-xl`}
        style={{ background: headerBg }}
      >
        <button
          onClick={() => { setMobileMenuOpen(true); }}
          className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
            isDark ? "text-white/65 hover:text-white" : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <div 
            className="w-6 h-6 rounded-md flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}cc)` }}
          >
            <GitBranch className="w-3 h-3 text-primary-foreground" />
          </div>
          <span
            className={`${textPrimary} font-bold text-sm`}
            style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}
          >
            Visual Node Flow
          </span>
        </div>

        <button
          onClick={() => { setActiveTab("profile"); setMobileMenuOpen(false); }}
          className="w-8 h-8 rounded-full overflow-hidden cursor-pointer"
        >
          {user?.avatar ? (
            <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
          ) : (
            <div 
              className="w-full h-full flex items-center justify-center text-primary-foreground text-[0.65rem] font-bold"
              style={{ background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}cc)` }}
            >
              {initials}
            </div>
          )}
        </button>
      </header>

      {/* Desktop Persistent Sidebar */}
      <aside
        className="hidden md:flex flex-col w-64 lg:w-72 border-r shrink-0 min-h-screen"
        style={{
          background: theme.panel,
          backdropFilter: "blur(20px)",
          borderColor: headerBorder,
        }}
      >
        {/* Logo Section */}
        <button
          onClick={() => { setActiveTab("diagrams"); navigate("/"); }}
          className="p-5 flex items-center gap-3 border-b text-left hover:opacity-80 transition-opacity cursor-pointer w-full"
          style={{ borderColor: headerBorder }}
        >
          <div 
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}cc)` }}
          >
            <GitBranch className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className={`${textPrimary} font-bold`} style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "1.05rem" }}>
            Visual Node Flow
          </span>
        </button>
        
        {/* Sidebar Body */}
        <div className="flex-1 flex flex-col min-h-0">
          {renderSidebarContent()}
        </div>
      </aside>

      {/* Mobile Slide-out Drawer overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 md:hidden flex">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            />

            {/* Sidebar drawer content */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.3 }}
              className="relative w-64 max-w-[80vw] h-full flex flex-col z-10 shadow-2xl border-r"
              style={{
                background: theme.panel,
                borderColor: headerBorder,
              }}
            >
              {/* Drawer Header with Close Button */}
              <div className="p-4 flex items-center justify-between border-b" style={{ borderColor: headerBorder }}>
                <span className={`${textPrimary} font-bold text-sm`}>Navigation</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer ${
                    isDark ? "text-white/40 hover:text-white hover:bg-white/5" : "text-gray-400 hover:text-gray-800 hover:bg-gray-100"
                  }`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Sidebar Content Body */}
              <div className="flex-1 flex flex-col min-h-0">
                {renderSidebarContent()}
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* Main Panel */}
      <main className="flex-1 flex flex-col min-h-0 overflow-y-auto">
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {activeTab === "diagrams" && (
            /* DIAGRAMS VIEW */
            <div>
              <div className="flex items-center justify-between mb-6 gap-4">
                <div>
                  <h1
                    className={textPrimary}
                    style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 800, fontSize: "1.5rem" }}
                  >
                    My Diagrams
                  </h1>
                  <p className={`mt-0.5 ${textMuted}`} style={{ fontSize: "0.82rem" }}>
                    {diagrams.length} diagram{diagrams.length !== 1 ? "s" : ""} · stored locally
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={openNewModal}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-primary-foreground text-xs cursor-pointer md:hidden"
                  style={{ background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}cc)`, fontWeight: 600 }}
                >
                  <Plus className="w-3.5 h-3.5" /> <span>New</span>
                </motion.button>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-24">
                  <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center @container">
                  <div
                    className={`w-12 @[400px]:w-16 h-12 @[400px]:h-16 rounded-2xl border flex items-center justify-center mb-4 ${isDark ? "bg-white/4 border-white/8" : "bg-gray-100 border-gray-200"}`}
                  >
                    <FileText className={`w-5 @[400px]:w-7 h-5 @[400px]:h-7 ${isDark ? "text-white/20" : "text-gray-400"}`} />
                  </div>
                  <p className={`mb-2 ${isDark ? "text-white/40" : "text-gray-500"}`} style={{ fontWeight: 500, fontSize: "clamp(0.85rem, 2cqi, 1rem)" }}>
                    {search ? "No diagrams match your search" : "No diagrams yet"}
                  </p>
                  <p className={isDark ? "text-white/25" : "text-gray-400"} style={{ fontSize: "clamp(0.75rem, 1.8cqi, 0.85rem)" }}>
                    {search ? "Try a different search term" : "Click 'New Diagram' to get started"}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filtered.map((d) => (
                    <DiagramCard
                      key={d.id}
                      diagram={d}
                      isDark={isDark}
                      onOpen={() => handleOpenDiagram(d.id)}
                      onDelete={() => handleDelete(d.id)}
                      onRename={(name) => handleRename(d, name)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "templates" && (
            /* TEMPLATES VIEW */
            <div>
              <div className="mb-6">
                <h1
                  className={textPrimary}
                  style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 800, fontSize: "1.5rem" }}
                >
                  Starting Templates
                </h1>
                <p className={`mt-0.5 ${textMuted}`} style={{ fontSize: "0.82rem" }}>
                  Select a blueprint layout to kickstart your project instantly.
                </p>
              </div>

              <div
                className={`p-6 rounded-2xl border`}
                style={{
                  background: isDark ? "rgba(255,255,255,0.015)" : "#ffffff",
                  borderColor: headerBorder,
                }}
              >
                <TemplatePicker
                  onSelect={handlePickTemplate}
                  onBlank={handlePickBlank}
                  isDark={isDark}
                  isFullPage={true}
                />
              </div>
            </div>
          )}

          {activeTab === "profile" && user && (
            /* PUBLIC PROFILE VIEW */
            <div>
              <div className="mb-6">
                <h1
                  className={textPrimary}
                  style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 800, fontSize: "1.5rem" }}
                >
                  My Profile
                </h1>
                <p className={`mt-0.5 ${textMuted}`} style={{ fontSize: "0.82rem" }}>
                  Manage your public profile photo, display name, bio, website, and location.
                </p>
              </div>

              <div className="max-w-2xl">
                {/* Feedback alert */}
                {(profileSaved || profileSaveError) && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl border mb-4 text-sm ${
                      profileSaveError
                        ? "bg-red-500/10 border-red-500/25 text-red-400"
                        : "bg-emerald-500/10 border-emerald-500/25 text-emerald-400"
                    }`}
                  >
                    {profileSaveError ? <AlertCircle className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                    {profileSaveError || "Profile updated successfully"}
                  </motion.div>
                )}

                <div className={`rounded-2xl border p-5 sm:p-6 ${cardBorder}`} style={{ background: isDark ? "rgba(255,255,255,0.015)" : "#ffffff" }}>
                  <div className="flex flex-col gap-5">
                    {/* Avatar Picker */}
                    <div>
                      <label className={labelCls}>Profile Photo</label>
                      <div className="flex items-center gap-4">
                        {avatar ? (
                          <img src={avatar} alt="avatar" className="w-16 h-16 rounded-full object-cover border-2 border-primary/30" />
                        ) : (
                          <div className="w-16 h-16 rounded-full flex items-center justify-center text-primary-foreground"
                            style={{ 
                              fontSize: "1.4rem", 
                              fontWeight: 700,
                              background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}cc)`
                            }}>
                            {initials}
                          </div>
                        )}
                        <div className="flex gap-2">
                          <button
                            onClick={() => avatarRef.current?.click()}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer"
                            style={{ borderColor: isDark ? "rgba(255,255,255,0.15)" : "#d1d5db", color: isDark ? "rgba(255,255,255,0.7)" : "#374151" }}
                          >
                            <Camera className="w-3.5 h-3.5 inline mr-1.5" />Upload photo
                          </button>
                          {avatar && (
                            <button onClick={() => setAvatar("")} className="px-3 py-1.5 rounded-lg text-xs border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer">
                              Remove
                            </button>
                          )}
                        </div>
                        <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className={labelCls}>Display Name</label>
                        <input
                          className={inputCls}
                          style={inputStyle}
                          placeholder={user.username}
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Username</label>
                        <input
                          className={`${inputCls} opacity-50 cursor-not-allowed`}
                          style={inputStyle}
                          value={user.username}
                          disabled
                        />
                      </div>
                    </div>

                    <div>
                      <label className={labelCls}>Bio</label>
                      <textarea
                        rows={3}
                        className={`${inputCls} resize-none`}
                        style={inputStyle}
                        placeholder="Tell others a bit about yourself..."
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        maxLength={280}
                      />
                      <p className={`text-[0.65rem] mt-1 text-right ${textMuted}`}>{bio.length}/280</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className={labelCls}><Globe className="w-3 h-3 inline mr-1" />Website</label>
                        <input
                          className={inputCls}
                          style={inputStyle}
                          placeholder="https://yoursite.com"
                          value={website}
                          onChange={(e) => setWebsite(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className={labelCls}><MapPin className="w-3 h-3 inline mr-1" />Location</label>
                        <input
                          className={inputCls}
                          style={inputStyle}
                          placeholder="City, Country"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <motion.button
                        onClick={handleSaveProfile}
                        disabled={authLoading}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-primary-foreground text-sm disabled:opacity-50 cursor-pointer"
                        style={{ background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}cc)`, fontWeight: 600 }}
                      >
                        <Save className="w-4 h-4" />
                        Save Profile
                      </motion.button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "account" && user && (
            /* ACCOUNT SETTINGS VIEW */
            <div>
              <div className="mb-6">
                <h1
                  className={textPrimary}
                  style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 800, fontSize: "1.5rem" }}
                >
                  Account Settings
                </h1>
                <p className={`mt-0.5 ${textMuted}`} style={{ fontSize: "0.82rem" }}>
                  Manage your email details and check user statistics.
                </p>
              </div>

              <div className="max-w-2xl">
                {/* Feedback alert */}
                {(profileSaved || profileSaveError) && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl border mb-4 text-sm ${
                      profileSaveError
                        ? "bg-red-500/10 border-red-500/25 text-red-400"
                        : "bg-emerald-500/10 border-emerald-500/25 text-emerald-400"
                    }`}
                  >
                    {profileSaveError ? <AlertCircle className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                    {profileSaveError || "Changes saved successfully"}
                  </motion.div>
                )}

                <div className={`rounded-2xl border p-5 sm:p-6 ${cardBorder}`} style={{ background: isDark ? "rgba(255,255,255,0.015)" : "#ffffff" }}>
                  <h2 className={`mb-1 ${textPrimary}`} style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700, fontSize: "1.1rem" }}>
                    Account Details
                  </h2>
                  <p className={`text-xs mb-6 ${textMuted}`}>Manage your email details and check user statistics.</p>

                  <div className="flex flex-col gap-5">
                    <div>
                      <label className={labelCls}><Mail className="w-3 h-3 inline mr-1" />Email Address</label>
                      <input
                        type="email"
                        className={inputCls}
                        style={inputStyle}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className={labelCls}>Username</label>
                      <input
                        className={`${inputCls} opacity-50 cursor-not-allowed`}
                        style={inputStyle}
                        value={user.username}
                        disabled
                      />
                      <p className={`text-[0.65rem] mt-1 ${textMuted}`}>Username cannot be changed after registration.</p>
                    </div>

                    <div className={`rounded-xl border p-4 ${cardBorder}`} style={{ background: isDark ? "rgba(255,255,255,0.02)" : "#f9fafb" }}>
                      <p className={`text-[0.65rem] font-bold mb-3 uppercase tracking-wider ${textMuted}`} style={{ fontFamily: "Plus Jakarta Sans" }}>
                        ACCOUNT STATS
                      </p>
                      <div className="grid grid-cols-3 gap-4">
                        {[
                          { label: "Diagrams", value: diagrams.length },
                          { label: "Member Since", value: memberSince },
                          {
                            label: "Account Type",
                            value: user.subscriptionStatus === "active"
                              ? `Pro`
                              : user.subscriptionStatus === "canceled"
                                ? "Pro (Canceled)"
                                : "Free Trial"
                          },
                        ].map(({ label, value }) => (
                          <div key={label}>
                            <p className={`text-[0.68rem] ${textMuted}`}>{label}</p>
                            <p className={`text-xs font-semibold mt-0.5 ${textPrimary}`}>{value}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <motion.button
                        onClick={handleSaveAccount}
                        disabled={authLoading}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-primary-foreground text-sm disabled:opacity-50 cursor-pointer"
                        style={{ background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}cc)`, fontWeight: 600 }}
                      >
                        <Save className="w-4 h-4" />
                        Save Changes
                      </motion.button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "security" && user && (
            /* SECURITY/PASSWORD VIEW */
            <div>
              <div className="mb-6">
                <h1
                  className={textPrimary}
                  style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 800, fontSize: "1.5rem" }}
                >
                  Security
                </h1>
                <p className={`mt-0.5 ${textMuted}`} style={{ fontSize: "0.82rem" }}>
                  Update your password to keep your account secure.
                </p>
              </div>

              <div className="max-w-2xl">
                {/* Feedback alert */}
                {(profileSaved || profileSaveError) && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl border mb-4 text-sm ${
                      profileSaveError
                        ? "bg-red-500/10 border-red-500/25 text-red-400"
                        : "bg-emerald-500/10 border-emerald-500/25 text-emerald-400"
                    }`}
                  >
                    {profileSaveError ? <AlertCircle className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                    {profileSaveError || "Changes saved successfully"}
                  </motion.div>
                )}

                <div className={`rounded-2xl border p-5 sm:p-6 ${cardBorder}`} style={{ background: isDark ? "rgba(255,255,255,0.015)" : "#ffffff" }}>
                  <h2 className={`mb-1 ${textPrimary}`} style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700, fontSize: "1.1rem" }}>
                    Update Password
                  </h2>
                  <p className={`text-xs mb-6 ${textMuted}`}>Enter your current password and choose a secure new one.</p>

                  <div className="flex flex-col gap-4 max-w-md">
                    <div>
                      <label className={labelCls}>Current Password</label>
                      <div className="relative">
                        <input
                          type={showCurrent ? "text" : "password"}
                          className={`${inputCls} pr-10`}
                          style={inputStyle}
                          placeholder="Enter current password"
                          value={currentPass}
                          onChange={(e) => setCurrentPass(e.target.value)}
                        />
                        <button onClick={() => setShowCurrent(!showCurrent)} className={`absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer ${textMuted}`}>
                          {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className={labelCls}>New Password</label>
                      <div className="relative">
                        <input
                          type={showNew ? "text" : "password"}
                          className={`${inputCls} pr-10`}
                          style={inputStyle}
                          placeholder="At least 6 characters"
                          value={newPass}
                          onChange={(e) => setNewPass(e.target.value)}
                        />
                        <button onClick={() => setShowNew(!showNew)} className={`absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer ${textMuted}`}>
                          {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {newPass && (
                        <div className="mt-1.5 flex gap-1">
                          {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="flex-1 h-1 rounded-full transition-colors" style={{
                              background: newPass.length >= i * 3
                                ? i <= 2 ? "#f59e0b" : i === 3 ? "#10b981" : "#080808"
                                : isDark ? "rgba(255,255,255,0.1)" : "#e5e7eb"
                            }} />
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className={labelCls}>Confirm New Password</label>
                      <input
                        type="password"
                        className={inputCls}
                        style={{
                          ...inputStyle,
                          borderColor: confirmPass && confirmPass !== newPass ? "rgba(239,68,68,0.5)" : inputStyle.border,
                        }}
                        placeholder="Repeat new password"
                        value={confirmPass}
                        onChange={(e) => setConfirmPass(e.target.value)}
                      />
                      {confirmPass && confirmPass !== newPass && (
                        <p className="text-xs mt-1 text-red-400">Passwords don't match</p>
                      )}
                    </div>

                    <div className="pt-2">
                      <motion.button
                        onClick={handleChangePassword}
                        disabled={authLoading || !currentPass || !newPass || !confirmPass}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-primary-foreground text-sm disabled:opacity-50 cursor-pointer"
                        style={{ background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}cc)`, fontWeight: 600 }}
                      >
                        <Lock className="w-4 h-4" />
                        Update Password
                      </motion.button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "billing" && user && (
            /* BILLING/SUBSCRIPTION VIEW */
            <div>
              <div className="mb-6">
                <h1
                  className={textPrimary}
                  style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 800, fontSize: "1.5rem" }}
                >
                  Billing & Subscription
                </h1>
                <p className={`mt-0.5 ${textMuted}`} style={{ fontSize: "0.82rem" }}>
                  Manage plan cycles, pricing renewals, and cancellations.
                </p>
              </div>

              <div className="max-w-2xl">
                <div className={`rounded-2xl border p-5 sm:p-6 ${cardBorder}`} style={{ background: isDark ? "rgba(255,255,255,0.015)" : "#ffffff" }}>
                  <div className="flex flex-col gap-6">
                    <div className={`rounded-xl border p-4 ${cardBorder}`} style={{ background: isDark ? "rgba(255,255,255,0.02)" : "#f9fafb" }}>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className={`text-[0.65rem] font-bold ${textMuted}`} style={{ fontFamily: "Plus Jakarta Sans" }}>
                            CURRENT PLAN
                          </p>
                          <h3 className={`text-md font-bold mt-1.5 ${textPrimary}`} style={{ fontFamily: "Plus Jakarta Sans" }}>
                            {user.subscriptionStatus === "active"
                              ? `Visual Node Flow Pro (${user.subscriptionPlan === "pro_annual" ? "Annual" : "Monthly"})`
                              : user.subscriptionStatus === "canceled"
                                ? "Visual Node Flow Pro (Canceled)"
                                : "Free Trial"}
                          </h3>
                          <p className={`text-xs mt-1.5 leading-relaxed ${textMuted}`}>
                            {user.subscriptionStatus === "active"
                              ? `Active. Recurring charge: ${user.subscriptionPlan === "pro_annual" ? "₹3828/yr" : "₹399/mo"}.`
                              : user.subscriptionStatus === "canceled"
                                ? "Canceled. Benefits remain active until the end of the billing period."
                                : "Limited diagram creation capabilities."}
                          </p>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-[0.65rem] font-bold ${
                          user.subscriptionStatus === "active"
                            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                            : user.subscriptionStatus === "canceled"
                              ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                              : "bg-primary/15 text-primary border border-primary/30"
                        }`}>
                          {user.subscriptionStatus === "active" ? "Active" : user.subscriptionStatus === "canceled" ? "Canceled" : "Trial"}
                        </span>
                      </div>
                    </div>

                    {user.subscriptionStatus === "active" && (
                      <div className="rounded-xl border border-red-500/20 p-4" style={{ background: isDark ? "rgba(239,68,68,0.03)" : "rgba(239,68,68,0.01)" }}>
                        <h3 className="text-red-400 text-sm font-semibold mb-1" style={{ fontFamily: "Plus Jakarta Sans" }}>
                          Cancel Subscription
                        </h3>
                        <p className={`text-xs mb-3 ${textMuted}`}>
                          You will lose access to Pro features, premium templates, and unlimited diagrams once the billing period ends.
                        </p>
                        <button
                          onClick={() => setShowCancelModal(true)}
                          disabled={canceling}
                          className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50 cursor-pointer"
                        >
                          {canceling ? "Canceling..." : "Cancel Subscription"}
                        </button>
                      </div>
                    )}

                    {(!user.subscriptionStatus || user.subscriptionStatus === "canceled") && (
                      <div className="flex justify-end">
                        <button
                          onClick={() => navigate("/pricing")}
                          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-primary-foreground text-sm cursor-pointer"
                          style={{ background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}cc)`, fontWeight: 600 }}
                        >
                          Upgrade to Pro
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "data" && user && (
            /* DATA MANAGEMENT VIEW */
            <div>
              <div className="mb-6">
                <h1
                  className={textPrimary}
                  style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 800, fontSize: "1.5rem" }}
                >
                  Data Management
                </h1>
                <p className={`mt-0.5 ${textMuted}`} style={{ fontSize: "0.82rem" }}>
                  Export files or safely log out of active sessions.
                </p>
              </div>

              <div className="max-w-2xl">
                <div className={`rounded-2xl border p-5 sm:p-6 ${cardBorder}`} style={{ background: isDark ? "rgba(255,255,255,0.015)" : "#ffffff" }}>
                  <div className="space-y-6">
                    <div className={`rounded-xl border p-4 ${cardBorder}`} style={{ background: isDark ? "rgba(255,255,255,0.02)" : "#f9fafb" }}>
                      <h3 className={`text-xs font-bold mb-3 ${textPrimary}`} style={{ fontFamily: "Plus Jakarta Sans" }}>
                        Data & Storage Info
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { label: "Total Diagrams", value: diagrams.length },
                          { label: "Storage Location", value: "Local (IndexedDB)" },
                        ].map(({ label, value }) => (
                          <div key={label} className={`rounded-lg border p-2.5 ${cardBorder}`} style={{ background: isDark ? "rgba(255,255,255,0.01)" : "#ffffff" }}>
                            <p className={`text-[0.65rem] ${textMuted}`}>{label}</p>
                            <p className={`text-xs font-semibold mt-0.5 ${textPrimary}`}>{value}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          const data = JSON.stringify({ user: { username: user.username, email: user.email, createdAt: user.createdAt }, diagrams }, null, 2);
                          const blob = new Blob([data], { type: "application/json" });
                          const a = document.createElement("a");
                          a.href = URL.createObjectURL(blob);
                          a.download = `Visual Node Flow-export-${user.username}.json`;
                          a.click();
                        }}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer"
                        style={{ borderColor: isDark ? "rgba(255,255,255,0.15)" : "#d1d5db", color: isDark ? "rgba(255,255,255,0.7)" : "#374151", background: "transparent" }}
                      >
                        <FileText className="w-4 h-4" />
                        Export My Diagrams
                      </button>
                    </div>

                    <div className="rounded-xl border border-red-500/20 p-4" style={{ background: isDark ? "rgba(239,68,68,0.03)" : "rgba(239,68,68,0.01)" }}>
                      <h3 className="text-red-400 text-sm font-semibold mb-1" style={{ fontFamily: "Plus Jakarta Sans" }}>
                        Danger Zone
                      </h3>
                      <p className={`text-xs mb-3 ${textMuted}`}>Signing out ends your session. Your diagrams remain in your local storage.</p>
                      <button
                        onClick={() => { logout(); navigate("/"); }}
                        className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Sign Out & Clear Session
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* New Diagram Modal */}
      <AnimatePresence>
        {showNewModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className={`rounded-2xl border w-full shadow-2xl overflow-hidden ${step === "pick" ? "max-w-2xl" : "max-w-md"}`}
              style={{ background: modalBg, borderColor: isDark ? "rgba(255,255,255,0.1)" : "#e5e7eb" }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div
                className={`px-5 py-4 flex items-center justify-between border-b`}
                style={{ borderColor: isDark ? "rgba(255,255,255,0.08)" : "#e5e7eb" }}
              >
                <div className="flex items-center gap-2">
                  {step === "name" && (
                    <button
                      onClick={() => setStep("pick")}
                      className={`w-6 h-6 flex items-center justify-center rounded-lg transition-colors mr-1 cursor-pointer ${isDark ? "text-white/50 hover:text-white hover:bg-white/8" : "text-gray-400 hover:text-gray-800 hover:bg-gray-100"}`}
                    >
                      ←
                    </button>
                  )}
                  <LayoutTemplate className="w-4 h-4 text-primary" />
                  <span
                    className={`font-semibold ${textPrimary}`}
                    style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}
                  >
                    {step === "pick" ? "Choose a starting point" : "Name your diagram"}
                  </span>
                </div>
                <button
                  onClick={() => setShowNewModal(false)}
                  className={`w-6 h-6 flex items-center justify-center rounded-lg transition-colors cursor-pointer ${isDark ? "text-white/40 hover:text-white hover:bg-white/8" : "text-gray-400 hover:text-gray-900 hover:bg-gray-100"}`}
                >
                  ✕
                </button>
              </div>

              <div className="p-5">
                {step === "pick" ? (
                  <TemplatePicker onSelect={handlePickTemplate} onBlank={handlePickBlank} isDark={isDark} />
                ) : (
                  <form onSubmit={handleCreate} className="flex flex-col gap-4">
                    {selectedTemplate && (
                      <div
                        className={`flex items-center gap-3 p-3 rounded-xl border`}
                        style={{
                          background: `${selectedTemplate.color}10`,
                          borderColor: `${selectedTemplate.color}30`,
                        }}
                      >
                        <div
                          className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0"
                          style={{ background: `${selectedTemplate.color}15` }}
                        >
                          <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
                            {selectedTemplate.previewEdges.slice(0, 6).map(([from, to], i) => {
                              const a = selectedTemplate.previewNodes[from];
                              const b = selectedTemplate.previewNodes[to];
                              if (!a || !b) return null;
                              return (
                                <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                                  stroke={selectedTemplate.color} strokeWidth="1.5" strokeOpacity="0.5" />
                              );
                            })}
                            {selectedTemplate.previewNodes.slice(0, 6).map((n, i) => (
                              <rect key={i} x={n.x - n.w / 2} y={n.y - 5.5} width={n.w} height={11} rx="3"
                                fill={`${selectedTemplate.color}25`} stroke={selectedTemplate.color} strokeWidth="0.8" strokeOpacity="0.9" />
                            ))}
                          </svg>
                        </div>
                        <div>
                          <p className={`text-sm font-semibold ${textPrimary}`}>{selectedTemplate.title}</p>
                          <p className={`text-xs ${textMuted}`}>{selectedTemplate.nodeCount} nodes · {selectedTemplate.category}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 ml-auto" style={{ color: selectedTemplate.color }} />
                      </div>
                    )}

                    <div>
                      <label className={`text-xs mb-1.5 block ${textMuted}`}>Diagram name</label>
                      <input
                        autoFocus
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="My diagram..."
                        className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-colors ${isDark ? "border-white/12 bg-white/5 text-white placeholder-white/30 focus:border-primary/50" : "border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:border-primary"}`}
                      />
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setShowNewModal(false)}
                        className={`flex-1 py-2.5 rounded-xl border text-sm transition-colors cursor-pointer ${btnSecondary}`}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={!newName.trim() || creating}
                        className="flex-1 py-2.5 rounded-xl text-primary-foreground text-sm disabled:opacity-40 flex items-center justify-center gap-2 cursor-pointer"
                        style={{ background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}cc)`, fontWeight: 600 }}
                      >
                        {creating ? (
                          <><div className="w-3.5 h-3.5 border-2 border-current/30 border-t-current rounded-full animate-spin" /> Creating...</>
                        ) : (
                          <>Create <ArrowRight className="w-3.5 h-3.5" /></>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Limit Modal */}
      <AnimatePresence>
        {showLimitModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowLimitModal(false)}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="rounded-3xl border w-full max-w-md p-8 text-center relative overflow-hidden shadow-2xl"
              style={{
                background: isDark ? "rgba(15, 15, 35, 0.98)" : "rgba(255, 255, 255, 0.99)",
                borderColor: isDark ? "rgba(255,255,255,0.08)" : "#e5e7eb"
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Decorative glows in dark mode */}
              {isDark && (
                <>
                  <div className="absolute -top-20 -left-20 w-40 h-40 bg-gray-500/10 rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
                </>
              )}

              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl"
                style={{ 
                  background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}cc)`,
                  boxShadow: `0 10px 25px ${theme.accent}20`
                }}
              >
                <Lock className="w-8 h-8 text-primary-foreground" />
              </div>

              <h2
                className={`text-xl font-bold mb-3 ${textPrimary}`}
                style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}
              >
                {limitModalType === "expired" ? "Free Trial Expired" : "Diagram Limit Reached"}
              </h2>
              
              <p className={`text-sm mb-8 leading-relaxed ${isDark ? "text-white/60" : "text-gray-500"}`}>
                {limitModalType === "expired"
                  ? "Your 24-hour free trial has ended. Upgrade to Pro to unlock editing, unlimited diagrams, and AI features."
                  : "You have reached the limit of 3 diagrams on the Free Trial. Upgrade to Pro for unlimited diagrams, shapes, custom styling, and AI builders."}
              </p>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    setShowLimitModal(false);
                    navigate("/pricing");
                  }}
                  className="w-full py-3.5 rounded-xl text-primary-foreground text-sm font-semibold transition-transform hover:scale-[1.02] cursor-pointer"
                  style={{
                    background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}dd)`,
                    boxShadow: `0 8px 20px ${theme.accent}33`,
                  }}
                >
                  Upgrade to Pro
                </button>
                <button
                  onClick={() => setShowLimitModal(false)}
                  className={`w-full py-3.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${isDark ? "text-white/50 hover:text-white" : "text-gray-400 hover:text-gray-600"}`}
                >
                  Dismiss
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Cancel Subscription Confirmation Modal */}
      <AnimatePresence>
        {showCancelModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowCancelModal(false)}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="rounded-3xl border w-full max-w-md p-8 text-center relative overflow-hidden shadow-2xl"
              style={{
                background: isDark ? "rgba(15, 15, 35, 0.98)" : "rgba(255, 255, 255, 0.99)",
                borderColor: isDark ? "rgba(255,255,255,0.08)" : "#e5e7eb"
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Decorative glows in dark mode */}
              {isDark && (
                <>
                  <div className="absolute -top-20 -left-20 w-40 h-40 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />
                </>
              )}

              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-red-500/20">
                <AlertCircle className="w-7 h-7 text-white" />
              </div>

              <h2
                className={`font-bold text-2xl mb-3 ${isDark ? "text-white" : "text-gray-900"}`}
                style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}
              >
                Cancel Subscription?
              </h2>
              
              <p className={`text-sm mb-8 leading-relaxed ${isDark ? "text-white/60" : "text-gray-500"}`}>
                Are you sure you want to cancel your Pro subscription? You will lose access to premium templates, multi-format exports, and unlimited diagrams once the current billing cycle ends.
              </p>

              <div className="flex flex-col gap-3">
                <button
                  onClick={handleCancelSubscription}
                  className="w-full py-3.5 rounded-xl text-white text-sm font-semibold shadow-lg shadow-red-500/25 transition-transform hover:scale-[1.02] cursor-pointer"
                  style={{
                    background: "linear-gradient(135deg,#ef4444,#ea580c)",
                  }}
                >
                  Yes, Cancel Subscription
                </button>
                <button
                  onClick={() => setShowCancelModal(false)}
                  className={`w-full py-3.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${isDark ? "text-white/50 hover:text-white" : "text-gray-400 hover:text-gray-600"}`}
                >
                  Keep My Subscription
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
