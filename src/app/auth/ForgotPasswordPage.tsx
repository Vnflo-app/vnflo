"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { GitBranch, ArrowLeft, Mail, CheckCircle } from "lucide-react";
import { useAuthStore } from "../stores/authStore";
import { useTheme } from "../context/ThemeContext";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const { resetPassword, loading, error, clearError } = useAuthStore();
  const router = useRouter();
  const navigate = (path: string) => router.push(path);
  const { isDark, theme } = useTheme();

  const bg = `linear-gradient(135deg, ${theme.canvas} 0%, ${theme.dot} 60%, ${theme.canvas} 100%)`;
  
  const cardBg = theme.panel;
  const titleColor = "text-foreground";
  const subtitleColor = "text-muted-foreground";
  const inputCls = "w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder-muted-foreground/50 focus:outline-none focus:border-primary focus:bg-card transition-all text-sm";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await resetPassword(email);
    if (!useAuthStore.getState().error) {
      setSent(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: bg }}>
      <div className="relative w-full max-w-md mx-auto px-6">
        <motion.button
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => navigate("/auth")}
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
          <span className={titleColor} style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 800, fontSize: "1.4rem" }}>
            Visual Node Flow
          </span>
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`rounded-2xl border p-7 ${isDark ? "border-white/10" : "border-gray-200"}`}
          style={{ background: cardBg, backdropFilter: "blur(20px)" }}
        >
          {sent ? (
            <div className="text-center py-4">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h2 className={`mb-2 ${titleColor}`} style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700, fontSize: "1.3rem" }}>
                Check your email
              </h2>
              <p className={`mb-6 ${subtitleColor}`} style={{ fontSize: "0.875rem" }}>
                We've sent a password reset link to <strong>{email}</strong>.
              </p>
              <button
                onClick={() => navigate("/auth")}
                className="text-sm text-primary hover:opacity-80 font-medium"
              >
                ← Back to Sign in
              </button>
            </div>
          ) : (
            <>
              <button onClick={() => navigate("/auth")} className={`flex items-center gap-1 text-sm mb-4 ${subtitleColor} hover:text-primary transition-colors`}>
                <ArrowLeft className="w-4 h-4" /> Back to Sign in
              </button>
              <h2 className={`mb-1 ${titleColor}`} style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700, fontSize: "1.3rem" }}>
                Forgot password?
              </h2>
              <p className={`mb-6 ${subtitleColor}`} style={{ fontSize: "0.875rem" }}>
                No worries, we'll send you reset instructions.
              </p>

              {error && (
                <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-sm break-all">
                  {error.includes("http") ? (
                    <>
                      {error.split(/(https?:\/\/[^\s]+)/g).map((part, i) => {
                        if (part.startsWith("http")) {
                          return (
                            <a
                              key={i}
                              href={part}
                              target="_blank"
                              rel="noreferrer"
                              className="underline text-primary hover:opacity-80 font-semibold block mt-1"
                            >
                              Reset Password Link (Click Here)
                            </a>
                          );
                        }
                        return part;
                      })}
                    </>
                  ) : (
                    error
                  )}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                  <input
                    type="email"
                    className={inputCls}
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); clearError(); }}
                    required
                    autoFocus
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}cc)`, fontWeight: 600 }}
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    "Reset password"
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