"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { GitBranch, Eye, EyeOff, ArrowRight, User, Mail, Lock } from "lucide-react";
import { useAuthStore } from "../stores/authStore";
import { useTheme } from "../context/ThemeContext";

export function AuthPage() {
  const [tab, setTab] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Recovery flow states
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const {
    login,
    register,
    loading,
    error,
    user,
    clearError,
    signInWithGoogle,
    isRecoveringPassword,
    updateRecoveredPassword,
  } = useAuthStore();
  const router = useRouter();
  const navigate = (path: string) => router.push(path);
  const { isDark, theme } = useTheme();

  useEffect(() => {
    localStorage.removeItem("just_registered");
    useAuthStore.setState({ isRegistering: false });
  }, []);

  useEffect(() => {
    if (user && !isRecoveringPassword) {
      if (localStorage.getItem("just_registered") === "true") {
        localStorage.removeItem("just_registered");
        return;
      }
      const pendingPlan = localStorage.getItem("pending_plan_checkout");
      if (pendingPlan) {
        navigate("/pricing");
      } else {
        navigate("/dashboard");
      }
    }
  }, [user, isRecoveringPassword, navigate]);

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    if (newPassword !== confirmPassword) {
      useAuthStore.setState({ error: "Passwords do not match." });
      return;
    }
    const success = await updateRecoveredPassword(newPassword);
    if (success) {
      setResetSuccess(true);
      setTimeout(() => {
        useAuthStore.setState({ isRecoveringPassword: false });
      }, 2000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    if (tab === "login") {
      await login(email, password);
    } else {
      const success = await register(username, email, password);
      if (success) {
        setTab("login");
        setSuccessMessage("Account created successfully! Please sign in.");
        setUsername("");
        setPassword("");
      }
    }
  };

  const switchTab = (t: "login" | "register") => {
    setTab(t);
    clearError();
    setSuccessMessage(null);
    setUsername("");
    setEmail("");
    setPassword("");
    localStorage.removeItem("just_registered");
    useAuthStore.setState({ isRegistering: false });
  };

  const bg = `linear-gradient(135deg, ${theme.canvas} 0%, ${theme.dot} 60%, ${theme.canvas} 100%)`;
  const cardBg = theme.panel;
  const cardBorder = "border-border";
  const tabBorder = "border-border";
  const tabActiveColor = "text-foreground";
  const tabInactiveColor = "text-muted-foreground/60";
  const titleColor = "text-foreground";
  const subtitleColor = "text-muted-foreground";
  const footerBorder = "border-border";
  const footerText = "text-muted-foreground";
  const iconColor = "text-muted-foreground/50";
  const eyeColor = "text-muted-foreground/50 hover:text-foreground/80";
  const inputCls = "w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder-muted-foreground/50 focus:outline-none focus:border-primary focus:bg-card transition-all text-sm";

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: bg }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: isDark ? 0.3 : 0.15,
          backgroundImage: `radial-gradient(ellipse at 30% 40%, ${theme.accent}${isDark ? "55" : "22"} 0%, transparent 60%),
            radial-gradient(ellipse at 70% 60%, ${theme.accent}${isDark ? "40" : "1e"} 0%, transparent 60%)`,
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: isDark ? 0.08 : 0.04,
          backgroundImage: `linear-gradient(${theme.accent}${isDark ? "4d" : "1a"} 1px, transparent 1px),
            linear-gradient(90deg, ${theme.accent}${isDark ? "4d" : "1a"} 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative w-full max-w-md mx-auto px-6">
        <motion.button
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => navigate("/")}
          className="flex items-center justify-center gap-3 mb-8 cursor-pointer"
        >
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
            style={{ 
              background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}cc)`,
              boxShadow: `0 4px 14px ${theme.accent}40`
            }}
          >
            <GitBranch className="w-5 h-5 text-white" />
          </div>
          <span
            className={titleColor}
            style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 800, fontSize: "1.4rem" }}
          >
            Visual Node Flow
          </span>
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`rounded-2xl border overflow-hidden ${cardBorder}`}
          style={{ background: cardBg, backdropFilter: "blur(20px)", boxShadow: isDark ? "none" : "0 8px 32px rgba(0,0,0,0.08)" }}
        >
          {isRecoveringPassword ? (
            <div className="p-7">
              <h2
                className={`mb-1 ${titleColor}`}
                style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700, fontSize: "1.3rem" }}
              >
                Reset Password
              </h2>
              <p className={`mb-6 ${subtitleColor}`} style={{ fontSize: "0.875rem" }}>
                Choose a strong new password for your account.
              </p>

              {error && (
                <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-sm">
                  {error}
                </div>
              )}

              {resetSuccess ? (
                <div className="space-y-4 text-center py-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className={titleColor} style={{ fontWeight: 600 }}>Password updated successfully!</p>
                  <p className={subtitleColor} style={{ fontSize: "0.85rem" }}>Redirecting you to your dashboard...</p>
                </div>
              ) : (
                <form onSubmit={handleResetSubmit} className="space-y-4">
                  <div className="relative">
                    <Lock className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${iconColor}`} />
                    <input
                      type={showPass ? "text" : "password"}
                      className={inputCls}
                      placeholder="New password"
                      value={newPassword}
                      onChange={(e) => { setNewPassword(e.target.value); clearError(); }}
                      required
                      minLength={6}
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className={`absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors ${eyeColor}`}
                    >
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  <div className="relative">
                    <Lock className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${iconColor}`} />
                    <input
                      type={showConfirmPass ? "text" : "password"}
                      className={inputCls}
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => { setConfirmPassword(e.target.value); clearError(); }}
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPass(!showConfirmPass)}
                      className={`absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors ${eyeColor}`}
                    >
                      {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: 1.02, boxShadow: `0 6px 20px ${theme.accent}40` }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-white text-sm mt-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}dd)`, fontWeight: 600, boxShadow: `0 4px 12px ${theme.accent}25` }}
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        Update Password
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </motion.button>
                </form>
              )}
            </div>
          ) : (
            <>
              <div className={`flex border-b ${tabBorder}`}>
                {(["login", "register"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => switchTab(t)}
                    className="flex-1 py-4 text-sm transition-colors relative"
                    style={{
                      color: tab === t ? tabActiveColor : tabInactiveColor,
                      fontWeight: tab === t ? 600 : 400,
                    }}
                  >
                    {t === "login" ? "Sign in" : "Create account"}
                    {tab === t && (
                      <motion.div
                        layoutId="tab-indicator"
                        className="absolute bottom-0 left-0 right-0 h-0.5"
                        style={{ background: `linear-gradient(90deg, ${theme.accent}, ${theme.accent}cc)` }}
                      />
                    )}
                  </button>
                ))}
              </div>

              <div className="p-7">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={tab}
                    initial={{ opacity: 0, x: tab === "login" ? -10 : 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: tab === "login" ? 10 : -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <h2
                      className={`mb-1 ${titleColor}`}
                      style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700, fontSize: "1.3rem" }}
                    >
                      {tab === "login" ? "Welcome back" : "Get started for free"}
                    </h2>
                    <p className={`mb-6 ${subtitleColor}`} style={{ fontSize: "0.875rem" }}>
                      {tab === "login"
                        ? "Sign in to access your diagrams."
                        : "Your data stays on your device. No server required."}
                    </p>

                    {error && (
                      <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-sm">
                        {error}
                      </div>
                    )}

                    {successMessage && (
                      <div className={`mb-4 px-4 py-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-sm ${isDark ? "text-emerald-300" : "text-emerald-700"}`}>
                        {successMessage}
                      </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-3">
                      {tab === "register" && (
                        <div className="relative">
                          <User className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${iconColor}`} />
                          <input
                            className={inputCls}
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            autoFocus
                          />
                        </div>
                      )}

                      <div className="relative">
                        <Mail className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${iconColor}`} />
                        <input
                          type="email"
                          className={inputCls}
                          placeholder="Email address"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          autoFocus={tab === "login"}
                        />
                      </div>

                      <div className="relative">
                        <Lock className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${iconColor}`} />
                        <input
                          type={showPass ? "text" : "password"}
                          className={inputCls}
                          placeholder="Password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          minLength={6}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPass(!showPass)}
                          className={`absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors ${eyeColor}`}
                        >
                          {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>

                      {tab === "login" && (
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => navigate("/forgot-password")}
                            className="text-xs transition-colors text-muted-foreground hover:text-primary"
                          >
                            Forgot password?
                          </button>
                        </div>
                      )}

                      <motion.button
                        type="submit"
                        disabled={loading}
                        whileHover={{ scale: 1.02, boxShadow: `0 6px 20px ${theme.accent}40` }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-white text-sm mt-1 disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}dd)`, fontWeight: 600, boxShadow: `0 4px 12px ${theme.accent}25` }}
                      >
                        {loading ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            {tab === "login" ? "Sign in" : "Create account"}
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </motion.button>
                    </form>
                    <div className="flex items-center justify-center text-sm text-muted-foreground mt-4 mb-4" >
                      Or
                    </div>
                    {/* Google Sign In Button */}
                    <motion.button
                      type="button"
                      onClick={async () => {
                        await signInWithGoogle();
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm mb-4"
                      style={{
                        background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
                        color: isDark ? "rgba(255,255,255,0.8)" : "#374151",
                        fontWeight: 600,
                        border: `1px solid ${isDark ? "rgba(255,255,255,0.12)" : "#e5e7eb"}`,
                      }}
                    >
                      <div className="w-5 h-5 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0 0 48 48">
                        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
                        </svg>
                      </div>
                      Continue with Google
                    </motion.button>
                  </motion.div>
                </AnimatePresence>

                <div className={`mt-5 pt-5 border-t flex items-center gap-2 ${footerBorder}`}>
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: theme.accent }} />
                  <p className={footerText} style={{ fontSize: "0.75rem" }}>
                    Secure remote authentication with Supabase and fast local diagram storage.
                  </p>
                </div>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}