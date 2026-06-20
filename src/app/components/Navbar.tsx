"use client";

import { motion } from "motion/react";
import { GitBranch, Menu, X, Palette, ChevronDown, LayoutDashboard } from "lucide-react";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useTheme, SITE_THEMES, ThemeId } from "../context/ThemeContext";
import { useAuthStore } from "../stores/authStore";

const NAV_LINKS = [
  { label: "Features", to: "/features" },
  { label: "Use Cases", to: "/use-cases" },
  { label: "Templates", to: "/templates" },
  { label: "Pricing", to: "/pricing" },
  { label: "Docs", to: "/docs" },
];

function ThemeSelector({ isMobile = false }: { isMobile?: boolean }) {
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const { themeId, setThemeId, isDark, theme } = useTheme();

  const toggleColor = isDark
    ? "text-white/50 hover:text-white border-white/15 hover:border-white/30"
    : "text-gray-500 hover:text-gray-900 border-gray-200 hover:border-gray-300";

  return (
    <div className="relative">
      <motion.button
        onClick={() => setShowThemeMenu(!showThemeMenu)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`flex items-center gap-1.5 rounded-lg border transition-colors ${
          isMobile ? "w-8 h-8 justify-center" : "px-3 py-1.5 text-sm"
        } ${toggleColor}`}
      >
        <Palette className="w-4 h-4" />
        {!isMobile && (
          <>
            <span className="capitalize text-xs font-medium">{themeId}</span>
            <ChevronDown className="w-3 h-3 opacity-60" />
          </>
        )}
      </motion.button>

      {showThemeMenu && (
        <>
          <div className="fixed inset-0 z-45" onClick={() => setShowThemeMenu(false)} />
          <motion.div
            initial={{ opacity: 0, y: 10 }}
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

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { themeId, isDark, theme } = useTheme();
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const navigate = (path: string) => router.push(path);
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;

  const navBg = theme.panel;
  const borderColor = isDark ? "border-white/10" : "border-gray-200";
  const logoText = isDark ? "text-white" : "text-gray-900";
  const linkInactive = isDark ? "text-white/60 hover:text-white" : "text-gray-600 hover:text-gray-900";
  const linkActive = "text-primary";
  const signInColor = isDark ? "text-white/70 hover:text-white" : "text-gray-600 hover:text-gray-900";
  const toggleColor = isDark
    ? "text-white/50 hover:text-white border-white/15 hover:border-white/30"
    : "text-gray-500 hover:text-gray-900 border-gray-200 hover:border-gray-300";

  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 border-b ${borderColor} backdrop-blur-xl`}
      style={{ background: navBg }}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5" suppressHydrationWarning={true}>
          <div 
            className="w-8 h-8 rounded-lg flex items-center justify-center shadow-lg"
            style={{ 
              background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}cc)`,
              boxShadow: `0 4px 12px ${theme.accent}30`
            }}
          >
            <GitBranch className="w-4 h-4 text-white" />
          </div>
          <span className={logoText} style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700, fontSize: "1.1rem" }}>
            Visual Node Flow
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map(({ label, to }) => (
            <Link
              key={to}
              href={to}
              className={`text-sm transition-colors duration-200 ${isActive(to) ? linkActive : linkInactive}`}
              style={{ fontWeight: isActive(to) ? 500 : 400 }}
              suppressHydrationWarning={true}
            >
              {label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <ThemeSelector />

          {user ? (
            <>
              <motion.button
                onClick={() => navigate("/dashboard")}
                whileHover={{ scale: 1.04, boxShadow: `0 6px 20px ${theme.accent}40` }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg transition-all"
                style={{
                  background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}dd)`,
                  boxShadow: `0 4px 12px ${theme.accent}25`,
                  color: "var(--primary-foreground)"
                }}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                Dashboard
              </motion.button>
              <button onClick={() => { logout(); navigate("/"); }} className={`text-sm px-4 py-2 transition-colors ${signInColor}`}>
                Sign out
              </button>
            </>
          ) : (
            <>
              <button onClick={() => navigate("/auth")} className={`text-sm px-4 py-2 transition-colors ${signInColor}`}>
                Sign in
              </button>
              <motion.button
                onClick={() => navigate("/auth")}
                whileHover={{ scale: 1.04, boxShadow: `0 6px 20px ${theme.accent}40` }}
                whileTap={{ scale: 0.97 }}
                className="text-sm px-4 py-2 rounded-lg transition-all"
                style={{
                  background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}dd)`,
                  boxShadow: `0 4px 12px ${theme.accent}25`,
                  color: "var(--primary-foreground)"
                }}
              >
                Get started free
              </motion.button>
            </>
          )}
        </div>

        <div className="md:hidden flex items-center gap-2">
          <ThemeSelector isMobile={true} />

          <button className={isDark ? "text-white/70 hover:text-white" : "text-gray-600 hover:text-gray-900"} onClick={() => setOpen(!open)}>
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          className={`md:hidden border-t ${borderColor} px-6 py-4 flex flex-col gap-3`}
          style={{ background: navBg }}
        >
          {NAV_LINKS.map(({ label, to }) => (
            <Link
              key={to}
              href={to}
              onClick={() => setOpen(false)}
              className={`text-sm transition-colors ${isActive(to) ? linkActive : linkInactive}`}
              suppressHydrationWarning={true}
            >
              {label}
            </Link>
          ))}
          {user ? (
            <>
              <button 
                onClick={() => { navigate("/dashboard"); setOpen(false); }} 
                className="text-sm px-4 py-2.5 rounded-lg text-center transition-all hover:opacity-90"
                style={{ background: theme.accent, color: "var(--primary-foreground)" }}
              >
                Dashboard
              </button>
              <button onClick={() => { logout(); navigate("/"); setOpen(false); }} className={`text-sm px-4 py-2.5 rounded-lg border text-center ${isDark ? "border-white/20 text-white/70" : "border-gray-300 text-gray-600"}`}>
                Sign out
              </button>
            </>
          ) : (
            <>
              <button onClick={() => navigate("/auth")} className={`text-sm px-4 py-2.5 rounded-lg border text-center ${isDark ? "border-white/20 text-white/70" : "border-gray-300 text-gray-600"}`}>
                Sign in
              </button>
              <button 
                onClick={() => navigate("/auth")} 
                className="text-sm px-4 py-2.5 rounded-lg text-center transition-all hover:opacity-90"
                style={{ background: theme.accent, color: "var(--primary-foreground)" }}
              >
                Get started free
              </button>
            </>
          )}
        </motion.div>
      )}
    </motion.nav>
  );
}
