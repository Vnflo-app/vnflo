"use client";

import { GitBranch } from "lucide-react";
import Link from "next/link";
import { useTheme } from "../context/ThemeContext";

const FOOTER_LINKS: Record<string, { label: string; to: string }[]> = {
  Product: [
    { label: "Features", to: "/features" },
    { label: "Templates", to: "/templates" },
    { label: "Pricing", to: "/pricing" },
    { label: "Changelog", to: "#" },
    { label: "Roadmap", to: "#" },
  ],
  "Use Cases": [
    { label: "Family Trees", to: "/use-cases" },
    { label: "Org Charts", to: "/use-cases" },
    { label: "Mind Maps", to: "/use-cases" },
    { label: "Network Diagrams", to: "/use-cases" },
    { label: "Flowcharts", to: "/templates" },
  ],
  Resources: [
    { label: "Documentation", to: "/docs" },
    { label: "Blog", to: "#" },
    { label: "Community", to: "#" },
    { label: "Support", to: "#" },
    { label: "Status", to: "#" },
  ],
  Company: [
    { label: "About", to: "#" },
    { label: "Careers", to: "#" },
    { label: "Privacy Policy", to: "/privacy-policy" },
    { label: "Terms of Service", to: "/terms-and-conditions" },
    { label: "Refund Policy", to: "/refund-policy" },
    { label: "Security", to: "#" },
  ],
};

export function Footer() {
  const { isDark, theme } = useTheme();
  const bg = isDark ? theme.canvas : "#f8f9fc";
  const border = "border-border";
  const textPrimary = "text-foreground";
  const textMuted = "text-muted-foreground/80";
  const linkColor = "text-muted-foreground hover:text-foreground";
  const headingColor = "text-foreground font-semibold";
  const socialBorder = "border-border text-muted-foreground hover:text-foreground hover:border-primary/50";

  return (
    <footer className={`border-t ${border}`} style={{ background: bg }}>
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 @[500px]:gap-10 mb-12 @container">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}cc)` }}>
                <GitBranch className="w-3.5 h-3.5 text-white" />
              </div>
              <span className={textPrimary} style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700 }}>
                Visual Node Flow
              </span>
            </div>
            <p className={`leading-relaxed mb-4 ${textMuted}`} style={{ fontSize: "0.8rem" }}>
              The intuitive diagramming tool for teams and individuals.
            </p>
            <div className="flex items-center gap-3">
              {["𝕏", "G", "in"].map((icon) => (
                <a key={icon} href="#"
                  className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-colors ${socialBorder}`}
                  style={{ fontSize: "0.75rem", fontWeight: 600 }}
                  suppressHydrationWarning={true}>
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(FOOTER_LINKS).map(([category, links]) => (
            <div key={category}>
              <h4 className={`mb-4 ${headingColor}`} style={{ fontSize: "0.8rem", fontWeight: 600, letterSpacing: "0.05em" }}>
                {category.toUpperCase()}
              </h4>
              <ul className="flex flex-col gap-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.to} className={`transition-colors ${linkColor}`} style={{ fontSize: "0.8rem" }} suppressHydrationWarning={true}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className={`border-t ${border} pt-8 flex flex-col sm:flex-row items-center justify-between gap-4`}>
          <p className={textMuted} style={{ fontSize: "0.75rem" }}>
            © 2026 Visual Node Flow. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className={textMuted} style={{ fontSize: "0.75rem" }}>All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
