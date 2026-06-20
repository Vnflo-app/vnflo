"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { GitBranch, Eye, EyeOff, ArrowRight, Lock, CheckCircle } from "lucide-react";
import { useAuthStore } from "../stores/authStore";
import { useTheme } from "../context/ThemeContext";

export function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const {
    loading,
    error,
    clearError,
    updateRecoveredPassword,
  } = useAuthStore();
  
  const router = useRouter();
  const navigate = (path: string) => router.push(path);
  const { isDark, theme } = useTheme();

  // Clear errors when entering the page
  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleSubmit = async (e: React.FormEvent) => {
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
        navigate("/dashboard");
      }, 2500);
    }
  };

  const bg = `linear-gradient(135deg, ${theme.canvas} 0%, ${theme.dot} 60%, ${theme.canvas} 100%)`;
  
  const cardBg = theme.panel;
  const cardBorder = "border-border";
  const titleColor = "text-foreground";
  const subtitleColor = "text-muted-foreground";
  const iconColor = "text-muted-foreground/50";
  const eyeColor = "text-muted-foreground/50 hover:text-foreground/80";
  const inputCls = "w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder-muted-foreground/50 focus:outline-none focus:border-primary focus:bg-card transition-all text-sm";

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: bg }}>
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
          className="flex items-center justify-center gap-3 mb-8 cursor-pointermx-auto"
          style={{ width: "100%" }}
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
          <span className={titleColor} style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 800, fontSize: "1.4rem" }}>
            Visual Node Flow
          </span>
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`rounded-2xl border p-7 ${cardBorder}`}
          style={{ background: cardBg, backdropFilter: "blur(20px)", boxShadow: isDark ? "none" : "0 8px 32px rgba(0,0,0,0.08)" }}
        >
          {resetSuccess ? (
            <div className="text-center py-4 space-y-4">
              <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-4 animate-bounce" />
              <h2 className={`mb-2 ${titleColor}`} style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700, fontSize: "1.3rem" }}>
                Password Reset!
              </h2>
              <p className={subtitleColor} style={{ fontSize: "0.875rem" }}>
                Your password has been updated successfully.
              </p>
              <p className={subtitleColor} style={{ fontSize: "0.85rem" }}>
                Redirecting you to your dashboard...
              </p>
            </div>
          ) : (
            <>
              <h2 className={`mb-1 ${titleColor}`} style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700, fontSize: "1.3rem" }}>
                Reset Password
              </h2>
              <p className={`mb-6 ${subtitleColor}`} style={{ fontSize: "0.875rem" }}>
                Enter a strong new password for your account.
              </p>

              {error && (
                <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
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
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-white text-sm mt-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}cc)`, fontWeight: 600 }}
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
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
