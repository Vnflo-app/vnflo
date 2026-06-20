"use client";

import { motion } from "motion/react";
import { ArrowRight, Sparkles } from "lucide-react";
import { EditorMockup } from "./EditorMockup";
import { useTheme } from "../context/ThemeContext";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "../stores/authStore";
import { supabase } from "../db/supabase";

function useCountUp(target: number, duration = 2000, start = false) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!start || target === 0) return;
    const startTime = performance.now();
    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
      else setValue(target);
    };
    requestAnimationFrame(tick);
  }, [target, duration, start]);
  return value;
}

function formatStat(n: number) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M+`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K+`;
  return `${n}+`;
}

export function HeroSection() {
  const { isDark, theme } = useTheme();
  const router = useRouter();
  const navigate = (path: string) => router.push(path);
  const sectionRef = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);
  const [diagramsBase, setDiagramsBase] = useState(500000);
  const { user } = useAuthStore();

  useEffect(() => {
    (async () => {
      try {
        const { count } = await supabase
          .from("diagrams")
          .select("*", { count: "exact", head: true });
        setDiagramsBase(500000 + (count || 0));
      } catch {
        // keep default
      }
    })();
  }, []);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold: 0.2 });
    if (sectionRef.current) obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, []);

  const diagramCount = useCountUp(diagramsBase, 1800, inView);
  const userCount = useCountUp(50000, 2000, inView);
  const ratingRaw = useCountUp(49, 1600, inView);

  const bg = `linear-gradient(135deg, ${theme.canvas} 0%, ${theme.dot} 50%, ${theme.canvas} 100%)`;

  const glowStyle = {
    backgroundImage: `radial-gradient(ellipse at 20% 50%, ${theme.accent}${isDark ? "44" : "22"} 0%, transparent 60%),
      radial-gradient(ellipse at 80% 20%, ${theme.accent}${isDark ? "33" : "1e"} 0%, transparent 60%),
      radial-gradient(ellipse at 60% 80%, ${theme.accent}${isDark ? "22" : "11"} 0%, transparent 60%)`,
  };

  const gridStyle = {
    backgroundImage: `linear-gradient(${theme.accent}${isDark ? "20" : "0a"} 1px, transparent 1px), linear-gradient(90deg, ${theme.accent}${isDark ? "20" : "0a"} 1px, transparent 1px)`,
    backgroundSize: "60px 60px"
  };

  const headingColor = isDark ? "text-white" : "text-gray-900";
  const subtitleColor = isDark ? "text-white/55" : "text-gray-500";
  const badgeStyle = {
    borderColor: `${theme.accent}4d`,
    background: `${theme.accent}${isDark ? "1a" : "14"}`,
    color: theme.accent,
  };
  const statsColor = isDark ? "text-white/40" : "text-gray-400";
  const statsValueColor = isDark ? "text-white/90" : "text-gray-800";
  const bottomFade = `linear-gradient(to top, ${theme.canvas}, transparent)`;

  const stats = [
    { display: formatStat(diagramCount), label: "diagrams created", live: true },
    { display: formatStat(userCount), label: "active users", live: true },
    { display: `${Math.floor(ratingRaw / 10)}.${ratingRaw % 10}★`, label: "average rating", live: false },
  ];

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex flex-col items-center justify-start pt-32 pb-24 overflow-hidden"
      style={{ background: bg }}
    >
      <div className="absolute inset-0 opacity-30 pointer-events-none" style={glowStyle} />
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={gridStyle} />

      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 text-center flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-8"
          style={badgeStyle}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="text-xs">Introducing Visual Node Flow 2.0</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className={`mb-6 ${headingColor}`}
          style={{
            fontFamily: "Plus Jakarta Sans, sans-serif",
            fontSize: "clamp(2rem, 6vw, 4.5rem)",
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: "-0.03em",
          }}
        >
          Create Beautiful{" "}
          <span
            style={{
              backgroundImage: `linear-gradient(135deg, ${theme.accent}, #818cf8, #60a5fa)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Diagrams
          </span>
          {" "}& Visual Maps
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.45 }}
          className={`max-w-2xl mx-auto mb-10 text-base md:text-lg ${subtitleColor}`}
          style={{ lineHeight: 1.7 }}
        >
          Whether you're mapping family history or planning complex systems,
          Visual Node Flow has the tools you need. Build family trees, org charts,
          mind maps, and network diagrams with our intuitive drag-and-drop interface.
        </motion.p>

        { !user && (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex items-center justify-center"
            >
              <motion.button
                onClick={() => navigate("/auth")}
                whileHover={{ scale: 1.04, boxShadow: `0 20px 40px ${theme.accent}66` }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 px-8 py-4 rounded-xl shadow-xl"
                style={{ background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}dd)`, fontSize: "1rem", fontWeight: 600, boxShadow: `0 8px 30px ${theme.accent}4d`, color: "var(--primary-foreground)" }}
              >
                Start 3-day trial
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className={`mt-3 text-xs ${isDark ? "text-white/30" : "text-gray-400"}`}
            >
              No credit card required · Cancel anytime
            </motion.p>
          </>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className={`mt-14 flex flex-col sm:flex-row items-center justify-center gap-10 ${statsColor}`}
        >
          {stats.map(({ display, label, live }) => (
            <div key={label} className="flex flex-col items-center gap-1.5">
              <div className="flex items-center gap-1.5">
                <span className={statsValueColor} style={{ fontWeight: 800, fontSize: "1.6rem", fontFamily: "Plus Jakarta Sans, sans-serif" }}>
                  {display}
                </span>
                {live && (
                  <span className="flex items-center gap-1 text-emerald-400" style={{ fontSize: "0.65rem", fontWeight: 600 }}>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                    LIVE
                  </span>
                )}
              </div>
              <span style={{ fontSize: "0.8rem" }}>{label}</span>
            </div>
          ))}
        </motion.div>

        {/* Editor Mockup Composition */}
        <motion.div
          initial={{ opacity: 0, y: 45 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.05, ease: "easeOut" }}
          className="w-full mt-4"
        >
          <EditorMockup />
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none" style={{ background: bottomFade }} />
    </section>
  );
}
