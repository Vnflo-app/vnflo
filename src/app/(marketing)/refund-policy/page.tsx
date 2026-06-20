"use client";

import { useState, useRef } from "react";
import { motion } from "motion/react";
import { useInView } from "motion/react";
import { ChevronDown, ChevronRight, Zap, Shield, CreditCard, RefreshCw } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

interface NavSection {
  title: string;
  icon: React.ElementType;
  items: { id: string; label: string }[];
}

const NAV: NavSection[] = [
  {
    title: "Overview",
    icon: Zap,
    items: [
      { id: "policy", label: "Refund Policy Overview" },
      { id: "eligibility", label: "Eligibility Criteria" },
    ],
  },
  {
    title: "Process",
    icon: RefreshCw,
    items: [
      { id: "request", label: "How to Request a Refund" },
      { id: "timeline", label: "Refund Processing Timeline" },
      { id: "method", label: "Refund Method" },
    ],
  },
  {
    title: "Exceptions",
    icon: Shield,
    items: [
      { id: "non-refundable", label: "Non-Refundable Items" },
      { id: "partial", label: "Partial Refunds" },
      { id: "disputes", label: "Billing Disputes" },
    ],
  },
  {
    title: "Special Cases",
    icon: CreditCard,
    items: [
      { id: "trial", label: "Free Trials & Promotions" },
      { id: "enterprise", label: "Enterprise Contracts" },
      { id: "force-majeure", label: "Force Majeure" },
    ],
  },
];

const CONTENT: Record<string, { title: string; body: React.ReactNode }> = {
  policy: {
    title: "Refund Policy Overview",
    body: (
      <div className="flex flex-col gap-6">
        <p>Visual Node Flow offers refunds for eligible subscriptions under specific circumstances outlined in this Refund Policy ("Policy"). This Policy applies to all payments made for Visual Node Flow subscription plans.</p>
        <p>Our goal is to ensure customer satisfaction while maintaining fair and consistent practices. Please read this Policy carefully before requesting a refund.</p>
        <div className="rounded-xl p-4 border border-primary/25 bg-primary/10">
          <p className="text-primary" style={{ fontSize: "0.85rem", fontWeight: 500 }}>📋 Summary</p>
          <p style={{ fontSize: "0.85rem", opacity: 0.8, marginTop: "0.25rem" }}>
            Refunds are available within 14 days of payment for monthly plans and 30 days for annual plans, subject to eligibility criteria.
          </p>
        </div>
      </div>
    ),
  },
  eligibility: {
    title: "Eligibility Criteria",
    body: (
      <div className="flex flex-col gap-6">
        <p>To be eligible for a refund, you must meet all of the following criteria:</p>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex gap-3">
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-primary" style={{ fontWeight: 700, fontSize: "0.75rem" }}>
                {i}
              </div>
              <div>
                <p style={{ fontSize: "0.875rem", lineHeight: 1.65, opacity: 0.8, margin: 0 }}>
                  {[
                    "The refund request must be submitted within 14 days of payment for monthly subscriptions or 30 days for annual subscriptions.",
                    "The account must not have violated our Terms of Service or Acceptable Use Policy.",
                    "The subscription must not have been obtained through fraudulent or unauthorized means.",
                    "Only one refund per customer, per subscription tier, is permitted within a 12-month period."
                  ][i-1]}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-xl p-4 border border-primary/25 bg-primary/10">
          <p className="text-primary" style={{ fontSize: "0.85rem", fontWeight: 500 }}>✅ Requirements</p>
          <p style={{ fontSize: "0.85rem", opacity: 0.8, marginTop: "0.25rem" }}>
            All criteria must be met for a refund to be considered. Meeting some but not all criteria does not guarantee eligibility.
          </p>
        </div>
      </div>
    ),
  },
  request: {
    title: "How to Request a Refund",
    body: (
      <div className="flex flex-col gap-6">
        <p>To request a refund, please follow these steps:</p>
        <div className="flex flex-col gap-5">
          {[
            { n: 1, t: "Contact Support", d: "Email our billing department at refunds@Visual Node Flow.io with your account information and reason for refund request." },
            { n: 2, t: "Provide Details", d: "Include your account email, subscription ID, last 4 digits of the payment card used, and date of the transaction in question." },
            { n: 3, t: "Explain Reason", d: "Clearly state why you're requesting a refund and reference the specific eligibility criteria you believe apply." },
            { n: 4, t: "Wait for Response", d: "Our billing team will review your request and respond within 3-5 business days with a decision and next steps." },
          ].map(({ n, t, d }) => (
            <div key={n} className="flex gap-4">
              <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-primary" style={{ fontWeight: 700, fontSize: "0.8rem" }}>
                {n}
              </div>
              <div>
                <h4 style={{ fontWeight: 600, marginBottom: "0.25rem", fontSize: "0.925rem" }}>{t}</h4>
                <p style={{ fontSize: "0.85rem", lineHeight: 1.65, opacity: 0.7 }}>{d}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-xl p-4 border border-primary/25 bg-primary/10">
          <p className="text-primary" style={{ fontSize: "0.85rem", fontWeight: 500 }}>📞 Contact</p>
          <p style={{ fontSize: "0.85rem", opacity: 0.8, marginTop: "0.25rem" }}>
            For faster service, include "Refund Request" in the subject line of your email.
          </p>
        </div>
      </div>
    ),
  },
  timeline: {
    title: "Refund Processing Timeline",
    body: (
      <div className="flex flex-col gap-6">
        <p>Once your refund request is approved, we will process the refund according to the following timeline:</p>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3">
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-primary" style={{ fontWeight: 700, fontSize: "0.75rem" }}>
                {i}
              </div>
              <div>
                <p style={{ fontSize: "0.875rem", lineHeight: 1.65, opacity: 0.8, margin: 0 }}>
                  {[
                    "Approval notification: You will receive an email confirmation once your refund request has been approved.",
                    "Processing time: Approved refunds are processed within 5-10 business days.",
                    "Bank processing: Additional time (typically 3-10 business days) may be required by your bank or payment provider to reflect the refund in your account."
                  ][i-1]}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-xl p-4 border border-primary/25 bg-primary/10">
          <p className="text-primary" style={{ fontSize: "0.85rem", fontWeight: 500 }}>⏱️ Total Time</p>
          <p style={{ fontSize: "0.85rem", opacity: 0.8, marginTop: "0.25rem" }}>
            Please allow up to 20 business days from approval for the refund to appear in your original payment method.
          </p>
        </div>
      </div>
    ),
  },
  method: {
    title: "Refund Method",
    body: (
      <div className="flex flex-col gap-6">
        <p>Refunds will be issued using the same payment method used for the original transaction.</p>
        <p>If the original payment method is no longer valid or accessible, we may issue the refund as store credit or via alternative arrangement at our discretion.</p>
        <p>We do not offer cash refunds or refunds to third-party accounts.</p>
        <div className="rounded-xl p-4 border border-primary/25 bg-primary/10">
          <p className="text-primary" style={{ fontSize: "0.85rem", fontWeight: 500 }}>💳 Method</p>
          <p style={{ fontSize: "0.85rem", opacity: 0.8, marginTop: "0.25rem" }}>
            Refunds return to your original credit card, debit card, or PayPal account used for the purchase.
          </p>
        </div>
      </div>
    ),
  },
  "non-refundable": {
    title: "Non-Refundable Items",
    body: (
      <div className="flex flex-col gap-6">
        <p>The following items are explicitly non-refundable:</p>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex gap-3">
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-primary" style={{ fontWeight: 700, fontSize: "0.75rem" }}>
                {i}
              </div>
              <div>
                <p style={{ fontSize: "0.875rem", lineHeight: 1.65, opacity: 0.8, margin: 0 }}>
                  {[
                    "Prorated amounts for partially used billing periods",
                    "Fees for exceeded usage limits (additional nodes, storage, bandwidth, etc.)",
                    "One-time purchases of templates, assets, or add-ons",
                    "Charges resulting from failure to cancel before renewal date",
                    "Transactions deemed to be the result of account sharing or unauthorized access"
                  ][i-1]}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-xl p-4 border border-primary/25 bg-primary/10">
          <p className="text-primary" style={{ fontSize: "0.85rem", fontWeight: 500 }}>🚫 Exclusions</p>
          <p style={{ fontSize: "0.85rem", opacity: 0.8, marginTop: "0.25rem" }}>
            These items are not eligible for refund under any circumstances.
          </p>
        </div>
      </div>
    ),
  },
  partial: {
    title: "Partial Refunds",
    body: (
      <div className="flex flex-col gap-6">
        <p>Partial refunds may be considered in exceptional circumstances at our sole discretion.</p>
        <p>Examples of situations where partial refunds might be considered include:</p>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3">
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-primary" style={{ fontWeight: 700, fontSize: "0.75rem" }}>
                {i}
              </div>
              <div>
                <p style={{ fontSize: "0.875rem", lineHeight: 1.65, opacity: 0.8, margin: 0 }}>
                  {[
                    "Service downtime exceeding our uptime SLA for extended periods",
                    "Verified technical issues preventing core functionality for multiple days",
                    "Errors in automatic renewal processing despite timely cancellation requests"
                  ][i-1]}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-xl p-4 border border-primary/25 bg-primary/10">
          <p className="text-primary" style={{ fontSize: "0.85rem", fontWeight: 500 }}>⚖️ Discretion</p>
          <p style={{ fontSize: "0.85rem", opacity: 0.8, marginTop: "0.25rem" }}>
            Partial refunds are rare and require documented evidence of the qualifying circumstance.
          </p>
        </div>
      </div>
    ),
  },
  disputes: {
    title: "Billing Disputes",
    body: (
      <div className="flex flex-col gap-6">
        <p>If you believe you have been charged in error, please contact us immediately so we can investigate.</p>
        <p>We recommend reviewing your billing statements regularly and contacting us within 60 days of any questionable charge.</p>
        <p>For unauthorized charges resulting from compromised accounts, we will work with you to secure your account and investigate the source of the unauthorized activity.</p>
        <div className="rounded-xl p-4 border border-primary/25 bg-primary/10">
          <p className="text-primary" style={{ fontSize: "0.85rem", fontWeight: 500 }}>🔍 Investigation</p>
          <p style={{ fontSize: "0.85rem", opacity: 0.8, marginTop: "0.25rem" }}>
            We'll audit your account activity and payment history to determine the validity of disputed charges.
          </p>
        </div>
      </div>
    ),
  },
  trial: {
    title: "Free Trials & Promotions",
    body: (
      <div className="flex flex-col gap-6">
        <p>Free trials and promotional offers are not eligible for refunds as no payment is collected for the trial period.</p>
        <p>If you convert from a free trial to a paid subscription, the standard refund policy applies to the paid subscription period only.</p>
        <p>Promotional discounts apply to the subscription price and do not affect refund eligibility criteria or processing.</p>
        <div className="rounded-xl p-4 border border-primary/25 bg-primary/10">
          <p className="text-primary" style={{ fontSize: "0.85rem", fontWeight: 500 }}>🎯 Trials</p>
          <p style={{ fontSize: "0.85rem", opacity: 0.8, marginTop: "0.25rem" }}>
            You can cancel a free trial at any time before it converts to a paid subscription without incurring any charges.
          </p>
        </div>
      </div>
    ),
  },
  enterprise: {
    title: "Enterprise Contracts",
    body: (
      <div className="flex flex-col gap-6">
        <p>Enterprise customers with custom contracts negotiated through our sales team should refer to their specific agreement for refund terms.</p>
        <p>This standard Refund Policy does not apply to enterprise-level agreements, which may have different terms, notice periods, and refund schedules.</p>
        <p>For questions about enterprise contract terms, please contact your assigned account manager or our enterprise sales department.</p>
        <div className="rounded-xl p-4 border border-primary/25 bg-primary/10">
          <p className="text-primary" style={{ fontSize: "0.85rem", fontWeight: 500 }}>🏢 Custom Terms</p>
          <p style={{ fontSize: "0.85rem", opacity: 0.8, marginTop: "0.25rem" }}>
            Enterprise agreements override this standard policy where applicable.
          </p>
        </div>
      </div>
    ),
  },
  "force-majeure": {
    title: "Force Majeure",
    body: (
      <div className="flex flex-col gap-6">
        <p>In the event of circumstances beyond our reasonable control (including but not limited to natural disasters, war, terrorism, internet service provider failures, or governmental actions), we may modify, suspend, or terminate aspects of the Service.</p>
        <p>Refunds for service interruptions caused by force majeure events are determined on a case-by-case basis and are not guaranteed.</p>
        <p>We will make reasonable efforts to restore service as quickly as possible and communicate openly with affected customers.</p>
        <div className="rounded-xl p-4 border border-primary/25 bg-primary/10">
          <p className="text-primary" style={{ fontSize: "0.85rem", fontWeight: 500 }}>🌪️ Uncontrollable Events</p>
          <p style={{ fontSize: "0.85rem", opacity: 0.8, marginTop: "0.25rem" }}>
            In the event of circumstances beyond our reasonable control (including but not limited to natural disasters, war, terrorism, internet service provider failures, or governmental actions), we may modify, suspend, or terminate aspects of the Service.
          </p>
          <p style={{ fontSize: "0.85rem", opacity: 0.8, marginTop: "0.25rem" }}>
            Refunds for service interruptions caused by force majeure events are determined on a case-by-case basis and are not guaranteed.
          </p>
          <p style={{ fontSize: "0.85rem", opacity: 0.8, marginTop: "0.25rem" }}>
            We will make reasonable efforts to restore service as quickly as possible and communicate openly with affected customers.
          </p>
        </div>
      </div>
    ),
  },
};

const DEFAULT_SECTION = "policy";

function NavGroup({ section, activeId, onSelect }: { section: NavSection; activeId: string; onSelect: (id: string) => void }) {
  const [open, setOpen] = useState(section.items.some((i) => i.id === activeId));
  const { isDark, theme } = useTheme();
  const Icon = section.icon;
  const textMuted = "text-muted-foreground/80";
  const textActive = "text-primary";
  const textInactive = "text-muted-foreground hover:text-foreground";

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${textMuted} hover:text-foreground`}
        style={{ fontWeight: 600 }}
      >
        <Icon className="w-4 h-4 flex-shrink-0" style={{ color: theme.accent }} />
        <span>{section.title}</span>
        <ChevronDown className={`w-3.5 h-3.5 ml-auto transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="ml-6 mt-1 flex flex-col gap-0.5">
          {section.items.map((item) => (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              className={`text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${activeId === item.id ? `${textActive} bg-primary/10` : textInactive}`}
              style={{ fontWeight: activeId === item.id ? 500 : 400 }}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function RefundPolicyPage() {
  const [activeId, setActiveId] = useState(DEFAULT_SECTION);
  const { isDark, theme } = useTheme();
  const contentRef = useRef(null);
  const contentInView = useInView(contentRef, { once: true });

  const active = CONTENT[activeId] ?? CONTENT[DEFAULT_SECTION];
  const bg = "bg-background text-foreground";
  const textPrimary = "text-foreground";
  const textSecondary = "text-muted-foreground";

  return (
    <div className={`min-h-screen pt-16 ${bg}`} style={{ backgroundColor: theme.canvas }}>
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex gap-8 items-start">
          {/* Sidebar */}
          <aside className="hidden lg:flex flex-col gap-1.5 w-64 flex-shrink-0 sticky top-28 rounded-2xl border p-4"
            style={{ backgroundColor: theme.panel, borderColor: theme.border }}>
            {NAV.map((section) => (
              <NavGroup key={section.title} section={section} activeId={activeId} onSelect={setActiveId} />
            ))}
          </aside>

          {/* Content */}
          <main className="flex-1 min-w-0">
            {/* Mobile nav */}
            <div className="lg:hidden mb-6">
              <select
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-card text-foreground outline-none text-sm"
                value={activeId}
                onChange={(e) => setActiveId(e.target.value)}
              >
                {NAV.map((section) =>
                  section.items.map((item) => (
                    <option key={item.id} value={item.id}>{section.title} — {item.label}</option>
                  ))
                )}
              </select>
            </div>

            <motion.div
              key={activeId}
              ref={contentRef}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className={`rounded-2xl border p-8 md:p-10 ${textSecondary}`}
              style={{ backgroundColor: theme.panel, borderColor: theme.border }}
            >
              <div className="flex items-center gap-2 mb-2">
                <ChevronRight className="w-4 h-4" style={{ color: theme.accent }} />
                <span className="text-sm" style={{ color: theme.accent }}>Refund Policy</span>
              </div>
              <h1 className={`mb-8 ${textPrimary}`} style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 800, fontSize: "1.9rem", lineHeight: 1.2 }}>
                {active.title}
              </h1>
              <div className={`${textSecondary}`} style={{ fontSize: "0.925rem", lineHeight: 1.8 }}>
                {active.body}
              </div>

              {/* Nav footer */}
              <div className="mt-12 pt-6 border-t flex items-center justify-between" style={{ borderColor: theme.border }}>
                <button
                  onClick={() => {
                    const allItems = NAV.flatMap((s) => s.items);
                    const idx = allItems.findIndex((i) => i.id === activeId);
                    if (idx > 0) setActiveId(allItems[idx - 1].id);
                  }}
                  className={`flex items-center gap-2 text-sm transition-colors ${textSecondary} hover:text-primary`}
                >
                  <ChevronRight className="w-4 h-4 rotate-180" /> Previous
                </button>
                <button
                  onClick={() => {
                    const allItems = NAV.flatMap((s) => s.items);
                    const idx = allItems.findIndex((i) => i.id === activeId);
                    if (idx < allItems.length - 1) setActiveId(allItems[idx + 1].id);
                  }}
                  className={`flex items-center gap-2 text-sm transition-colors ${textSecondary} hover:text-primary`}
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </main>
        </div>
      </div>
    </div>
  );
}