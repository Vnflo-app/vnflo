"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type ThemeId = "dark" | "light" | "midnight" | "ocean" | "forest" | "sunset";

export interface ThemeColors {
  id: ThemeId;
  label: string;
  swatch: string;
  canvas: string;
  dot: string;
  panel: string;
  toolbar: string;
  border: string;
  accent: string;
  nodeBg: string;
  nodeBorder: string;
  nodeText: string;
  minimap: string;
  minimapMask: string;
  textPrimary: string;
  textMuted: string;
  surfaceHover: string;
}

export const SITE_THEMES: Record<ThemeId, ThemeColors> = {
  dark: {
    id: "dark", label: "Dark", swatch: "#1f2937",
    canvas: "#080808", dot: "#1a1a1a",
    panel: "rgba(8,8,8,0.95)", toolbar: "rgba(8,8,8,0.97)",
    border: "rgba(255,255,255,0.08)",
    accent: "#D4D8DF",
    nodeBg: "#D4D8DF", nodeBorder: "#D4D8DF", nodeText: "#1a1a1a",
    minimap: "rgba(8,8,8,0.85)", minimapMask: "rgba(0,0,0,0.65)",
    textPrimary: "rgba(255,255,255,0.9)", textMuted: "rgba(255,255,255,0.4)",
    surfaceHover: "rgba(255,255,255,0.07)",
  },
  light: {
    id: "light", label: "Light", swatch: "#ffffff",
    canvas: "#EBEDF1", dot: "#D4D8DF",
    panel: "rgba(255,255,255,0.97)", toolbar: "rgba(248,248,250,0.98)",
    border: "rgba(0,0,0,0.08)",
    accent: "#080808",
    nodeBg: "#ffffff", nodeBorder: "#080808", nodeText: "#1a1a1a",
    minimap: "rgba(248,248,250,0.92)", minimapMask: "rgba(200,200,210,0.5)",
    textPrimary: "rgba(15,15,20,0.9)", textMuted: "rgba(15,15,20,0.4)",
    surfaceHover: "rgba(0,0,0,0.05)",
  },
  midnight: {
    id: "midnight", label: "Midnight", swatch: "#9d4edd",
    canvas: "#0a0015", dot: "#1a002e",
    panel: "rgba(10,0,21,0.97)", toolbar: "rgba(10,0,21,0.99)",
    border: "rgba(157,78,221,0.15)",
    accent: "#9d4edd",
    nodeBg: "#1a002e", nodeBorder: "#9d4edd", nodeText: "#f0e6ff",
    minimap: "rgba(10,0,21,0.9)", minimapMask: "rgba(0,0,0,0.7)",
    textPrimary: "rgba(240,230,255,0.9)", textMuted: "rgba(240,230,255,0.35)",
    surfaceHover: "rgba(157,78,221,0.1)",
  },
  ocean: {
    id: "ocean", label: "Ocean", swatch: "#0ea5e9",
    canvas: "#021a2e", dot: "#032f50",
    panel: "rgba(2,26,46,0.97)", toolbar: "rgba(2,26,46,0.99)",
    border: "rgba(14,165,233,0.15)",
    accent: "#0ea5e9",
    nodeBg: "#032f50", nodeBorder: "#0ea5e9", nodeText: "#e0f2fe",
    minimap: "rgba(2,26,46,0.9)", minimapMask: "rgba(0,0,0,0.65)",
    textPrimary: "rgba(224,242,254,0.9)", textMuted: "rgba(224,242,254,0.35)",
    surfaceHover: "rgba(14,165,233,0.1)",
  },
  forest: {
    id: "forest", label: "Forest", swatch: "#22c55e",
    canvas: "#021a0e", dot: "#032f1a",
    panel: "rgba(2,26,14,0.97)", toolbar: "rgba(2,26,14,0.99)",
    border: "rgba(34,197,94,0.15)",
    accent: "#22c55e",
    nodeBg: "#032f1a", nodeBorder: "#22c55e", nodeText: "#dcfce7",
    minimap: "rgba(2,26,14,0.9)", minimapMask: "rgba(0,0,0,0.65)",
    textPrimary: "rgba(220,252,231,0.9)", textMuted: "rgba(220,252,231,0.35)",
    surfaceHover: "rgba(34,197,94,0.1)",
  },
  sunset: {
    id: "sunset", label: "Sunset", swatch: "#f97316",
    canvas: "#1a0a00", dot: "#2e1500",
    panel: "rgba(26,10,0,0.97)", toolbar: "rgba(26,10,0,0.99)",
    border: "rgba(249,115,22,0.15)",
    accent: "#f97316",
    nodeBg: "#2e1500", nodeBorder: "#f97316", nodeText: "#fff7ed",
    minimap: "rgba(26,10,0,0.9)", minimapMask: "rgba(0,0,0,0.65)",
    textPrimary: "rgba(255,247,237,0.9)", textMuted: "rgba(255,247,237,0.35)",
    surfaceHover: "rgba(249,115,22,0.1)",
  },
};

interface ThemeContextValue {
  themeId: ThemeId;
  theme: ThemeColors;
  setThemeId: (themeId: ThemeId) => void;
  isDark: boolean;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  themeId: "dark",
  theme: SITE_THEMES.dark,
  setThemeId: () => {},
  isDark: true,
  toggle: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeId] = useState<ThemeId>("dark");

  useEffect(() => {
    const saved = localStorage.getItem("nb-site-theme") as ThemeId | null;
    if (saved && SITE_THEMES[saved]) {
      setThemeId(saved);
    }
  }, []);

  const handleSetThemeId = (id: ThemeId) => {
    if (SITE_THEMES[id]) {
      setThemeId(id);
      localStorage.setItem("nb-site-theme", id);
      localStorage.setItem("nb-canvas-theme", id); // Keep editor canvas in sync
    }
  };

  const toggle = () => {
    handleSetThemeId(themeId === "light" ? "dark" : "light");
  };

  const isDark = themeId !== "light";
  const theme = SITE_THEMES[themeId];

  // Dynamic CSS variables injection on client-side
  useEffect(() => {
    const root = document.documentElement;

    // Remove existing theme classes
    root.classList.forEach((cls) => {
      if (cls.startsWith("theme-")) {
        root.classList.remove(cls);
      }
    });

    // Add active theme class
    root.classList.add(`theme-${themeId}`);

    // Toggle .dark class for Tailwind dark: variants
    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    // Set custom CSS variables for design system integration
    root.style.setProperty("--background", theme.canvas);
    root.style.setProperty("--foreground", theme.textPrimary);
    root.style.setProperty("--primary", theme.accent);
    root.style.setProperty("--primary-foreground", themeId === "dark" ? "#706f70" : "oklch(1 0 0)");
    root.style.setProperty("--accent", theme.accent);
    root.style.setProperty("--border", theme.border);
    root.style.setProperty("--card", theme.panel);
    root.style.setProperty("--card-foreground", theme.textPrimary);
    root.style.setProperty("--popover", theme.panel);
    root.style.setProperty("--popover-foreground", theme.textPrimary);
    root.style.setProperty("--muted", theme.nodeBg);
    root.style.setProperty("--muted-foreground", theme.textMuted);
  }, [themeId, theme, isDark]);

  return (
    <ThemeContext.Provider value={{ themeId, theme, setThemeId: handleSetThemeId, isDark, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
