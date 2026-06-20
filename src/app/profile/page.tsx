"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  GitBranch, ArrowLeft, Camera, Save, Lock, User, Mail,
  Globe, MapPin, FileText, Check, AlertCircle, Eye, EyeOff,
  LayoutDashboard, LogOut, Trash2, Crown, CreditCard,
} from "lucide-react";
import { useAuthStore } from "../stores/authStore";
import { useDiagramStore } from "../stores/diagramStore";
import { useTheme } from "../context/ThemeContext";
import { supabase } from "../db/supabase";
import { toast } from "sonner";

type Section = "profile" | "account" | "security" | "data" | "subscription";

export default function ProfilePage() {
  const router = useRouter();
  const navigate = (path: string) => router.push(path);
  const { isDark, theme } = useTheme();
  const { user, updateProfile, changePassword, logout, loading } = useAuthStore();
  const { diagrams, loadDiagrams } = useDiagramStore();

  const [section, setSection] = useState<Section>("profile");
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");
  const avatarRef = useRef<HTMLInputElement>(null);

  // Profile fields
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [website, setWebsite] = useState(user?.website || "");
  const [location, setLocation] = useState(user?.location || "");
  const [avatar, setAvatar] = useState(user?.avatar || "");

  // Account fields
  const [email, setEmail] = useState(user?.email || "");

  // Security fields
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  // Subscription fields
  const [canceling, setCanceling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const handleCancelSubscription = async () => {
    setShowCancelModal(false);
    setCanceling(true);
    const toastId = toast.loading("Canceling subscription...");
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error("Authentication token missing");

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
      toast.success("Subscription canceled successfully.");
      
      // Sync state
      const authStore = useAuthStore.getState();
      await authStore.init();
    } catch (e: any) {
      toast.dismiss(toastId);
      toast.error(e.message || "Failed to cancel subscription");
    } finally {
      setCanceling(false);
    }
  };

  useEffect(() => {
    if (user) loadDiagrams(user.id);
  }, [user, loadDiagrams]);

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

  useEffect(() => {
    if (!user && !loading) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: theme.canvas }}>
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const initials = user.username.slice(0, 2).toUpperCase();
  const memberSince = new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" });

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
    setSaveError("");
    try {
      await updateProfile({ displayName, bio, website, location, avatar });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      setSaveError((e as Error).message);
    }
  };

  const handleSaveAccount = async () => {
    setSaveError("");
    try {
      await updateProfile({ email });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      setSaveError((e as Error).message);
    }
  };

  const handleChangePassword = async () => {
    setSaveError("");
    if (newPass !== confirmPass) { setSaveError("New passwords don't match"); return; }
    if (newPass.length < 6) { setSaveError("Password must be at least 6 characters"); return; }
    try {
      await changePassword(currentPass, newPass);
      setCurrentPass(""); setNewPass(""); setConfirmPass("");
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      setSaveError((e as Error).message);
    }
  };

  // Styles
  const bg = theme.canvas;
  const headerBg = theme.panel;
  const headerBorder = isDark ? "border-white/8" : "border-gray-200";
  const cardBg = isDark ? "rgba(255,255,255,0.03)" : "#ffffff";
  const cardBorder = isDark ? "border-white/8" : "border-gray-200";
  const textPrimary = isDark ? "text-white" : "text-gray-900";
  const textMuted = isDark ? "text-white/50" : "text-gray-500";
  const inputStyle = {
    background: isDark ? "rgba(255,255,255,0.05)" : "#f9fafb",
    border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "#e5e7eb"}`,
    color: isDark ? "rgba(255,255,255,0.9)" : "#111827",
  };
  const inputCls = "w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none transition-all";
  const labelCls = `text-xs font-medium mb-1.5 block ${textMuted}`;
  const sidebarActive = "bg-primary/10 text-primary border-primary/30";
  const sidebarInactive = isDark
    ? "text-white/50 hover:text-white hover:bg-white/5 border-transparent"
    : "text-gray-500 hover:text-gray-900 hover:bg-gray-50 border-transparent";

  const SECTIONS: { id: Section; label: string; icon: React.ElementType }[] = [
    { id: "profile", label: "Public Profile", icon: User },
    { id: "account", label: "Account", icon: Mail },
    { id: "security", label: "Security", icon: Lock },
    { id: "subscription", label: "Subscription", icon: Crown },
    { id: "data", label: "Your Data", icon: FileText },
  ];

  return (
    <div className="min-h-screen" style={{ background: bg }}>
      {/* Header */}
      <header
        className={`h-14 border-b ${headerBorder} flex items-center justify-between px-6 sticky top-0 z-20 backdrop-blur-xl`}
        style={{ background: headerBg }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2.5 group"
          >
            <div 
              className="w-7 h-7 rounded-lg flex items-center justify-center shadow-lg transition-shadow"
              style={{ 
                background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}cc)`,
                boxShadow: `0 4px 10px ${theme.accent}25`
              }}
            >
              <GitBranch className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <span className={`${textPrimary} group-hover:text-primary transition-colors`} style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700 }}>
              Visual Node Flow
            </span>
          </button>
          <span className={`text-xs ${textMuted}`}>/</span>
          <span className={`text-sm ${textMuted}`}>Profile</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/dashboard")}
            className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg transition-colors ${isDark ? "text-white/60 hover:text-white hover:bg-white/8" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"}`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            Dashboard
          </button>
          <button
            onClick={() => { logout(); navigate("/"); }}
            className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg transition-colors ${isDark ? "text-white/40 hover:text-white hover:bg-white/8" : "text-gray-400 hover:text-gray-900 hover:bg-gray-100"}`}
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign out
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto flex-col px-6 py-10">
        <div className="flex gap-8 flex-col @[1024px]:flex-row lg:flex-row">
          {/* Sidebar */}
          <aside className="w-70 @[1024px]:w-56 @[1024px]:flex-shrink-0 @container px-4 py-4 rounded-2xl border" 
            style={{ background: cardBg, borderColor: isDark ? "rgba(255,255,255,0.1)" : "#e5e7eb" }}>
            {/* Avatar card */}
            <div
              className={`rounded-2xl border p-5 mb-4 text-center @[200px]:text-left ${cardBorder}`}
              style={{ background: cardBg }}
            >
              <div className="relative inline-block mb-3 @[200px]:block @[200px]:mx-0">
                {avatar ? (
                  <img src={avatar} alt="avatar" className="w-16 h-16 rounded-full object-cover" />
                ) : (
                  <div className="w-16 h-16 rounded-full flex items-center justify-center text-primary-foreground mx-auto"
                    style={{ 
                      fontSize: "1.4rem", 
                      fontWeight: 700,
                      background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}cc)`
                    }}>
                    {initials}
                  </div>
                )}
                <button
                  onClick={() => avatarRef.current?.click()}
                  className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-primary-foreground transition-colors shadow-lg"
                  style={{ background: theme.accent }}
                >
                  <Camera className="w-3 h-3" />
                </button>
                <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </div>
              <p className={`font-semibold text-sm ${textPrimary}`} style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}>
                {user.displayName || user.username}
              </p>
              <p className={`text-xs mt-0.5 ${textMuted}`}>@{user.username}</p>
              <div className={`mt-3 pt-3 border-t ${isDark ? "border-white/8" : "border-gray-100"}`}>
                <p className={`text-xs ${textMuted}`}>{diagrams.length} diagrams</p>
                <p className={`text-xs ${textMuted}`}>Since {memberSince}</p>
              </div>
            </div>

            {/* Nav */}
            <nav className="flex flex-col gap-0.5">
              {SECTIONS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setSection(id)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-sm text-left transition-all ${section === id ? sidebarActive : sidebarInactive}`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {label}
                </button>
              ))}
            </nav>
          </aside>
          {/* Main content */} 
          <main className="flex-1 min-w-0 @container">
            {/* Feedback banner */}
            {(saved || saveError) && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl border mb-4 text-sm ${
                  saveError
                    ? "bg-red-500/10 border-red-500/25 text-red-400"
                    : "bg-emerald-500/10 border-emerald-500/25 text-emerald-400"
                }`}
              >
                {saveError ? <AlertCircle className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                {saveError || "Changes saved successfully"}
              </motion.div>
            )}

            {/* ── Profile Section ── */}
            {section === "profile" && (
              <div className={`rounded-2xl border p-5 @[500px]:p-6 ${cardBorder}`} style={{ background: cardBg }}>
                <h2 className={`mb-1 ${textPrimary}`} style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700, fontSize: "clamp(1rem, 2.5cqi, 1.1rem)" }}>
                  Public Profile
                </h2>
                <p className={`text-sm mb-6 ${textMuted}`}>This information may be visible to others.</p>

                <div className="flex flex-col gap-5">
                  {/* Avatar upload row */}
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
                          className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors"
                          style={{ borderColor: isDark ? "rgba(255,255,255,0.15)" : "#d1d5db", color: isDark ? "rgba(255,255,255,0.7)" : "#374151" }}
                        >
                          <Camera className="w-3.5 h-3.5 inline mr-1.5" />Upload photo
                        </button>
                        {avatar && (
                          <button onClick={() => setAvatar("")} className="px-3 py-1.5 rounded-lg text-xs border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors">
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 @[400px]:grid-cols-2 gap-4">
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
                    <p className={`text-xs mt-1 text-right ${textMuted}`}>{bio.length}/280</p>
                  </div>

                  <div className="grid grid-cols-1 @[400px]:grid-cols-2 gap-4">
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
                      disabled={loading}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-primary-foreground text-sm disabled:opacity-50"
                      style={{ background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}cc)`, fontWeight: 600 }}
                    >
                      <Save className="w-4 h-4" />
                      Save Profile
                    </motion.button>
                  </div>
                </div>
              </div>
            )}

            {/* ── Account Section ── */}
            {section === "account" && (
              <div className={`rounded-2xl border p-5 @[500px]:p-6 ${cardBorder}`} style={{ background: cardBg }}>
                <h2 className={`mb-1 ${textPrimary}`} style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700, fontSize: "clamp(1rem, 2.5cqi, 1.1rem)" }}>
                  Account Settings
                </h2>
                <p className={`text-sm mb-6 ${textMuted}`}>Manage your account details and preferences.</p>

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
                    <p className={`text-xs mt-1 ${textMuted}`}>Username cannot be changed after registration.</p>
                  </div>

                  {/* Stats */}
                  <div className={`rounded-xl border p-4 ${cardBorder}`} style={{ background: isDark ? "rgba(255,255,255,0.02)" : "#f9fafb" }}>
                    <p className={`text-xs font-semibold mb-3 ${textMuted}`} style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}>
                      ACCOUNT STATS
                    </p>
                    <div className="grid grid-cols-1 @[300px]:grid-cols-3 gap-4">
                      {[
                        { label: "Diagrams", value: diagrams.length },
                        { label: "Member Since", value: memberSince },
                        {
                          label: "Account Type",
                          value: user.subscriptionStatus === "active"
                            ? `Pro (${user.subscriptionPlan === "pro_annual" ? "Annual" : "Monthly"})`
                            : user.subscriptionStatus === "canceled"
                              ? "Pro (Canceled)"
                              : "Free Trial"
                        },
                      ].map(({ label, value }) => (
                        <div key={label}>
                          <p className={`text-xs ${textMuted}`}>{label}</p>
                          <p className={`text-sm font-semibold mt-0.5 ${textPrimary}`}>{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <motion.button
                      onClick={handleSaveAccount}
                      disabled={loading}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-primary-foreground text-sm disabled:opacity-50"
                      style={{ background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}cc)`, fontWeight: 600 }}
                    >
                      <Save className="w-4 h-4" />
                      Save Changes
                    </motion.button>
                  </div>
                </div>
              </div>
            )}

            {/* ── Security Section ── */}
            {section === "security" && (
              <div className={`rounded-2xl border p-5 @[500px]:p-6 ${cardBorder}`} style={{ background: cardBg }}>
                <h2 className={`mb-1 ${textPrimary}`} style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700, fontSize: "clamp(1rem, 2.5cqi, 1.1rem)" }}>
                  Security
                </h2>
                <p className={`text-sm mb-6 ${textMuted}`}>Update your password to keep your account secure.</p>

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
                      <button onClick={() => setShowCurrent(!showCurrent)} className={`absolute right-3 top-1/2 -translate-y-1/2 ${textMuted}`}>
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
                      <button onClick={() => setShowNew(!showNew)} className={`absolute right-3 top-1/2 -translate-y-1/2 ${textMuted}`}>
                        {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {newPass && (
                      <div className="mt-1.5 flex gap-1">
                        {[1,2,3,4].map((i) => (
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
                      disabled={loading || !currentPass || !newPass || !confirmPass}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-primary-foreground text-sm disabled:opacity-50"
                      style={{ background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}cc)`, fontWeight: 600 }}
                    >
                      <Lock className="w-4 h-4" />
                      Update Password
                    </motion.button>
                  </div>
                </div>
              </div>
            )}

            {/* ── Subscription Section ── */}
            {section === "subscription" && (
              <div className={`rounded-2xl border p-5 @[500px]:p-6 ${cardBorder}`} style={{ background: cardBg }}>
                <h2 className={`mb-1 ${textPrimary}`} style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700, fontSize: "clamp(1rem, 2.5cqi, 1.1rem)" }}>
                  Subscription Settings
                </h2>
                <p className={`text-sm mb-6 ${textMuted}`}>Manage your subscription plan, pricing details, and renewals.</p>

                <div className="flex flex-col gap-6">
                  {/* Plan details card */}
                  <div className={`rounded-xl border p-5 ${cardBorder}`} style={{ background: isDark ? "rgba(255,255,255,0.02)" : "#f9fafb" }}>
                    <div className="flex items-start justify-between flex-wrap gap-4">
                      <div>
                        <p className={`text-xs font-semibold ${textMuted}`} style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}>
                          CURRENT PLAN
                        </p>
                        <h3 className={`text-xl font-bold mt-1.5 ${textPrimary}`} style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}>
                          {user.subscriptionStatus === "active"
                            ? `Visual Node Flow Pro (${user.subscriptionPlan === "pro_annual" ? "Annual" : "Monthly"})`
                            : user.subscriptionStatus === "canceled"
                              ? "Visual Node Flow Pro (Canceled)"
                              : "Free Trial"}
                        </h3>
                        <p className={`text-sm mt-1.5 ${textMuted}`}>
                          {user.subscriptionStatus === "active"
                            ? `Your subscription is active. Recurring charge: ${user.subscriptionPlan === "pro_annual" ? "₹3828/yr" : "₹399/mo"}.`
                            : user.subscriptionStatus === "canceled"
                              ? "Your subscription has been canceled. Your benefits remain active until the end of the billing period."
                              : "You are currently using the Free Trial plan with limited diagram capabilities."}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        user.subscriptionStatus === "active"
                          ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                          : user.subscriptionStatus === "canceled"
                            ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                            : "bg-primary/15 text-primary border border-primary/30"
                      }`}>
                        {user.subscriptionStatus === "active" ? "Active" : user.subscriptionStatus === "canceled" ? "Canceled" : "Trial"}
                      </span>
                    </div>

                    {user.subscriptionId && (
                      <div className="mt-5 pt-5 border-t border-dashed border-current/10 flex flex-col gap-2">
                        <div className="flex justify-between text-xs">
                          <span className={textMuted}>Subscription ID</span>
                          <span className={`font-mono ${textPrimary}`}>{user.subscriptionId}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Cancel plan */}
                  {user.subscriptionStatus === "active" && (
                    <div className="rounded-2xl border border-red-500/20 p-5" style={{ background: isDark ? "rgba(239,68,68,0.04)" : "rgba(239,68,68,0.02)" }}>
                      <h3 className="text-red-400 mb-1" style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700, fontSize: "0.95rem" }}>
                        Cancel Subscription
                      </h3>
                      <p className={`text-sm mb-4 ${textMuted}`}>
                        If you cancel, you will lose access to premium templates, multi-format SVG/PDF exports, and unlimited diagrams once the current billing cycle ends.
                      </p>
                      <button
                        onClick={() => setShowCancelModal(true)}
                        disabled={canceling}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                      >
                        {canceling ? "Canceling..." : "Cancel Subscription"}
                      </button>
                    </div>
                  )}

                  {(!user.subscriptionStatus || user.subscriptionStatus === "canceled") && (
                    <div className="flex justify-end">
                      <button
                        onClick={() => navigate("/pricing")}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-primary-foreground text-sm"
                        style={{ background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}cc)`, fontWeight: 600 }}
                      >
                        Upgrade to Pro
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── Data Section ── */}
            {section === "data" && (
              <div className="flex flex-col gap-4">
                <div className={`rounded-2xl border p-5 @[500px]:p-6 ${cardBorder}`} style={{ background: cardBg }}>
                  <h2 className={`mb-1 ${textPrimary}`} style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700, fontSize: "clamp(1rem, 2.5cqi, 1.1rem)" }}>
                    Your Data
                  </h2>
                  <p className={`text-sm mb-6 ${textMuted}`}>Visual Node Flow stores all your data locally on your device — nothing is sent to the cloud.</p>

                  <div className={`rounded-xl border p-4 mb-4 ${cardBorder}`} style={{ background: isDark ? "rgba(255,255,255,0.02)" : "#f9fafb" }}>
                    <div className="grid grid-cols-1 @[300px]:grid-cols-2 gap-4">
                      {[
                        { label: "Total Diagrams", value: diagrams.length },
                        { label: "Total Nodes", value: diagrams.reduce((s, d) => s + (d.nodes?.length || 0), 0) },
                        { label: "Storage", value: "Local (IndexedDB)" },
                        { label: "Cloud Sync", value: "Not enabled" },
                      ].map(({ label, value }) => (
                        <div key={label} className={`rounded-xl border p-3 ${cardBorder}`} style={{ background: cardBg }}>
                          <p className={`text-xs ${textMuted}`}>{label}</p>
                          <p className={`text-sm font-semibold mt-0.5 ${textPrimary}`}>{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        const data = JSON.stringify({ user: { username: user.username, email: user.email, createdAt: user.createdAt }, diagrams }, null, 2);
                        const blob = new Blob([data], { type: "application/json" });
                        const a = document.createElement("a");
                        a.href = URL.createObjectURL(blob);
                        a.download = `Visual Node Flow-export-${user.username}.json`;
                        a.click();
                      }}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors"
                      style={{ borderColor: isDark ? "rgba(255,255,255,0.15)" : "#d1d5db", color: isDark ? "rgba(255,255,255,0.7)" : "#374151", background: "transparent" }}
                    >
                      <FileText className="w-4 h-4" />
                      Export My Data
                    </button>
                  </div>
                </div>

                {/* Danger zone */}
                <div className="rounded-2xl border border-red-500/20 p-6" style={{ background: isDark ? "rgba(239,68,68,0.04)" : "rgba(239,68,68,0.02)" }}>
                  <h3 className="text-red-400 mb-1" style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700, fontSize: "0.95rem" }}>
                    Danger Zone
                  </h3>
                  <p className={`text-sm mb-4 ${textMuted}`}>Signing out will end your session. All data remains stored locally.</p>
                  <button
                    onClick={() => { logout(); navigate("/"); }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Sign Out & Clear Session
                  </button>
                </div>
              </div>
            )}
          </main>       
        </div>
      </div>

      {/* Cancel Subscription Modal */}
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
                  className="w-full py-3.5 rounded-xl text-white text-sm font-semibold shadow-lg shadow-red-500/25 transition-transform hover:scale-[1.02]"
                  style={{
                    background: "linear-gradient(135deg,#ef4444,#ea580c)",
                  }}
                >
                  Yes, Cancel Subscription
                </button>
                <button
                  onClick={() => setShowCancelModal(false)}
                  className={`w-full py-3.5 rounded-xl text-sm font-medium transition-colors ${isDark ? "text-white/50 hover:text-white" : "text-gray-400 hover:text-gray-600"}`}
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
