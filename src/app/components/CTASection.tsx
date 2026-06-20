"use client";

import { motion } from "motion/react";
import { useInView } from "motion/react";
import { useRef } from "react";
import { ArrowRight, Zap } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useRouter } from "next/navigation";

export function CTASection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const { isDark, theme } = useTheme();
  const router = useRouter();
  const navigate = (path: string) => router.push(path);

  const bg = theme.canvas;
  const badgeStyle = {
    borderColor: `${theme.accent}40`,
    background: `${theme.accent}${isDark ? "1a" : "14"}`,
    color: theme.accent,
  };
  const titleColor = "text-foreground";
  const subtitleColor = "text-muted-foreground";
  const trustColor = "text-muted-foreground/60";
  const linkColor = "text-muted-foreground hover:text-foreground";
  const ringColor = "border-primary/10";

  return (
    <section className="py-28 relative overflow-hidden" style={{ background: bg }}>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at 50% 50%, ${theme.accent}${isDark ? "40" : "15"} 0%, transparent 70%)` }}
      />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className={`absolute rounded-full border ${ringColor}`}
            style={{ width: `${i * 200}px`, height: `${i * 200}px`, left: `${-i * 100}px`, top: `${-i * 100}px` }}
            animate={{ scale: [1, 1.05, 1], opacity: [0.4, 0.1, 0.4] }}
            transition={{ duration: 3 + i, repeat: Infinity, delay: i * 0.5 }}
          />
        ))}
      </div>

      <div className="relative max-w-4xl mx-auto px-6 text-center">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-6" style={badgeStyle}>
            <Zap className="w-3.5 h-3.5" />
            <span className="text-xs">Start in seconds — no setup required</span>
          </div>

          <h2
            className={`mb-5 ${titleColor}`}
            style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "clamp(2.2rem, 5vw, 3.5rem)", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-0.03em" }}
          >
            Start building your{" "}
            <span style={{ backgroundImage: `linear-gradient(135deg, ${theme.accent}, #818cf8, #60a5fa)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              first diagram
            </span>{" "}
            today
          </h2>

          <p className={`max-w-xl mx-auto mb-10 ${subtitleColor}`} style={{ fontSize: "1.1rem", lineHeight: 1.7 }}>
            Join 50,000+ users who trust Visual Node Flow to visualize their most important ideas.
            Free forever. No credit card required.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.button
              onClick={() => navigate("/auth")}
              whileHover={{ scale: 1.04, boxShadow: `0 20px 40px ${theme.accent}66` }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 px-8 py-4 rounded-xl"
              style={{ background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}dd)`, fontSize: "1rem", fontWeight: 600, boxShadow: `0 8px 30px ${theme.accent}4d`, color: "var(--primary-foreground)" }}
            >
              Start 3-day trial
              <ArrowRight className="w-4 h-4" />
            </motion.button>
            <button onClick={() => navigate("/pricing")} className={`transition-colors ${linkColor}`} style={{ fontSize: "0.9rem" }}>
              View pricing →
            </button>
          </div>

          <div className={`mt-12 flex flex-wrap items-center justify-center gap-6 ${trustColor}`} style={{ fontSize: "0.8rem" }}>
            {["✓ No credit card required", "✓ 3 days free trial", "✓ Cancel anytime", "✓ PNG, PDF, JPEG export"].map((t) => (
              <span key={t}>{t}</span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
