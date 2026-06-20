"use client";

import { useState, useRef } from "react";
import { motion } from "motion/react";
import { useInView } from "motion/react";
import { ChevronDown, ChevronRight, Zap, FileText, Shield, CheckCircle, Search } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

interface NavSection {
  title: string;
  icon: React.ElementType;
  items: { id: string; label: string }[];
}

const NAV: NavSection[] = [
  {
    title: "Introduction",
    icon: Zap,
    items: [
      { id: "acceptance", label: "Acceptance of Terms" },
      { id: "changes", label: "Changes to Terms" },
    ],
  },
  {
    title: "Service Usage",
    icon: FileText,
    items: [
      { id: "account", label: "Account Registration" },
      { id: "use", label: "Acceptable Use" },
      { id: "content", label: "User Content" },
      { id: "prohibited", label: "Prohibited Activities" },
    ],
  },
  {
    title: "Payments & Subscriptions",
    icon: Shield,
    items: [
      { id: "fees", label: "Fees and Payment" },
      { id: "billing", label: "Billing and Renewal" },
      { id: "cancellation", label: "Cancellation" },
    ],
  },
  {
    title: "Legal & Liability",
    icon: CheckCircle,
    items: [
      { id: "proprietary", label: "Proprietary Rights" },
      { id: "disclaimer", label: "Disclaimer of Warranties" },
      { id: "liability", label: "Limitation of Liability" },
      { id: "indemnification", label: "Indemnification" },
      { id: "termination", label: "Termination" },
      { id: "governing", label: "Governing Law" },
    ],
  },
];

const CONTENT: Record<string, { title: string; body: React.ReactNode }> = {
  acceptance: {
    title: "Acceptance of Terms",
    body: (
      <div className="flex flex-col gap-6">
        <p>These Terms of Service ("Terms") govern your use of Visual Node Flow (the "Service") provided by Visual Node Flow, Inc. ("Company", "we", "us", or "our").</p>
        <p>By accessing or using the Service, you acknowledge that you have read, understood, and agree to be bound by these Terms. If you do not agree with these Terms, you must not use the Service.</p>
        <div className="rounded-xl p-4 border border-primary/25 bg-primary/10">
          <p className="text-primary" style={{ fontSize: "0.85rem", fontWeight: 500 }}>💡 Important</p>
          <p style={{ fontSize: "0.85rem", opacity: 0.8, marginTop: "0.25rem" }}>
            These Terms create a legally binding agreement between you and Visual Node Flow regarding your use of the Service.
          </p>
        </div>
      </div>
    ),
  },
  changes: {
    title: "Changes to Terms",
    body: (
      <div className="flex flex-col gap-6">
        <p>We reserve the right to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect.</p>
        <p>What constitutes a material change will be determined at our sole discretion. By continuing to access or use the Service after any revisions become effective, you agree to be bound by the revised Terms.</p>
        <div className="rounded-xl p-4 border border-primary/25 bg-primary/10">
          <p className="text-primary" style={{ fontSize: "0.85rem", fontWeight: 500 }}>💡 Tip</p>
          <p style={{ fontSize: "0.85rem", opacity: 0.8, marginTop: "0.25rem" }}>
            We recommend reviewing these Terms periodically for changes. Your continued use of the Service constitutes acceptance of any updated Terms.
          </p>
        </div>
      </div>
    ),
  },
  account: {
    title: "Account Registration",
    body: (
      <div className="flex flex-col gap-6">
        <p>To access certain features of the Service, you may need to create an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete.</p>
        <p>You are responsible for safeguarding your password and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account or any other breach of security.</p>
        <p>We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.</p>
        <div className="rounded-xl p-4 border border-primary/25 bg-primary/10">
          <p className="text-primary" style={{ fontSize: "0.85rem", fontWeight: 500 }}>🔒 Security</p>
          <p style={{ fontSize: "0.85rem", opacity: 0.8, marginTop: "0.25rem" }}>
            Use a strong, unique password for your Visual Node Flow account and enable two-factor authentication where available.
          </p>
        </div>
      </div>
    ),
  },
  use: {
    title: "Acceptable Use",
    body: (
      <div className="flex flex-col gap-6">
        <p>Your use of the Service must comply with all applicable laws and regulations. You agree not to use the Service for any illegal or unauthorized purpose.</p>
        <p>You must not transmit any worms, viruses, or any code of a destructive nature. You agree not to engage in the unauthorized use, copying, or distribution of any Content available through the Service.</p>
        <p>We reserve the right to refuse service to anyone for any reason at any time.</p>
        <div className="rounded-xl p-4 border border-primary/25 bg-primary/10">
          <p className="text-primary" style={{ fontSize: "0.85rem", fontWeight: 500 }}>⚖️ Compliance</p>
          <p style={{ fontSize: "0.85rem", opacity: 0.8, marginTop: "0.25rem" }}>
            You are responsible for ensuring that your activities on Visual Node Flow comply with all applicable local, state, national, and international laws.
          </p>
        </div>
      </div>
    ),
  },
  content: {
    title: "User Content",
    body: (
      <div className="flex flex-col gap-6">
        <p>You retain all rights to any content you submit, post, or display on or through the Service ("User Content"). By submitting User Content to the Service, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, adapt, publish, translate, distribute, and display such content.</p>
        <p>You represent and warrant that: (i) you own the User Content you submit or have the necessary rights to grant us the license described above; (ii) your User Content does not violate the Terms or any applicable law; and (iii) your User Content will not cause injury to any person or entity.</p>
        <p>We reserve the right, but not the obligation, to monitor, edit, or remove any User Content that we determine in our sole discretion violates these Terms or is otherwise harmful or objectionable.</p>
        <div className="rounded-xl p-4 border border-primary/25 bg-primary/10">
          <p className="text-primary" style={{ fontSize: "0.85rem", fontWeight: 500 }}>📝 License</p>
          <p style={{ fontSize: "0.85rem", opacity: 0.8, marginTop: "0.25rem" }}>
            By sharing content on Visual Node Flow, you grant us permission to host, store, and display that content as necessary to provide the Service.
          </p>
        </div>
      </div>
    ),
  },
  prohibited: {
    title: "Prohibited Activities",
    body: (
      <div className="flex flex-col gap-6">
        <p>You agree not to engage in any of the following prohibited activities:</p>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex gap-3">
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-primary" style={{ fontWeight: 700, fontSize: "0.75rem" }}>
                {i}
              </div>
              <div>
                <p style={{ fontSize: "0.875rem", lineHeight: 1.65, opacity: 0.8, margin: 0 }}>
                  {[
                    "Uploading or transmitting harmful code (viruses, malware, etc.)",
                    "Interfering with or disrupting the Service or servers/networks connected to the Service",
                    "Attempting to gain unauthorized access to the Service, user accounts, or computer systems",
                    "Engaging in automated use of the Service (scraping, bots, etc.)",
                    "Violating any applicable local, state, national, or international law",
                    "Impersonating any person or entity or misrepresenting your affiliation with any person or entity"
                  ][i-1]}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-xl p-4 border border-primary/25 bg-primary/10">
          <p className="text-primary" style={{ fontSize: "0.85rem", fontWeight: 500 }}>⛔ Enforcement</p>
          <p style={{ fontSize: "0.85rem", opacity: 0.8, marginTop: "0.25rem" }}>
            Violations may result in immediate termination of your Service access without notice or refund.
          </p>
        </div>
      </div>
    ),
  },
  fees: {
    title: "Fees and Payment",
    body: (
      <div className="flex flex-col gap-6">
        <p>We offer various subscription plans for access to premium features of the Service. All fees are exclusive of taxes, and you are responsible for paying all applicable taxes associated with your purchases.</p>
        <p>Payment for subscription plans is charged on a recurring basis (monthly or annually) as selected during the signup process. Fees are billed in advance and are non-refundable, except as expressly provided in our Refund Policy.</p>
        <p>We reserve the right to change our fees and billing methods at any time. Any fee changes will become effective at the end of your then-current billing cycle.</p>
        <div className="rounded-xl p-4 border border-primary/25 bg-primary/10">
          <p className="text-primary" style={{ fontSize: "0.85rem", fontWeight: 500 }}>💳 Payment</p>
          <p style={{ fontSize: "0.85rem", opacity: 0.8, marginTop: "0.25rem" }}>
            We accept major credit cards and PayPal. All transactions are secured with industry-standard encryption.
          </p>
        </div>
      </div>
    ),
  },
  billing: {
    title: "Billing and Renewal",
    body: (
      <div className="flex flex-col gap-6">
        <p>Unless you notify us before the end of the applicable billing period that you want to cancel a subscription, your subscription will automatically renew and you authorize us to collect the then-applicable annual or monthly subscription fee for such subscription (as well as any taxes) using any payment method we have on record for you.</p>
        <p>Subscriptions can be canceled at any time through your account settings or by contacting customer support. Cancellation will take effect the day following the end of the current billing period, and you will not receive a refund for any unused portion of the current billing period.</p>
        <p>If your payment method fails or your account is past due, we may suspend or terminate your access to the Service.</p>
        <div className="rounded-xl p-4 border border-primary/25 bg-primary/10">
          <p className="text-primary" style={{ fontSize: "0.85rem", fontWeight: 500 }}>🔄 Renewal</p>
          <p style={{ fontSize: "0.85rem", opacity: 0.8, marginTop: "0.25rem" }}>
            We'll send you a reminder email 3 days before your subscription renews to avoid unexpected charges.
          </p>
        </div>
      </div>
    ),
  },
  cancellation: {
    title: "Cancellation",
    body: (
      <div className="flex flex-col gap-6">
        <p>You may cancel your subscription at any time by visiting your account settings page or by contacting customer support.</p>
        <p>Upon cancellation, your access to premium features will continue until the end of the then-current billing period. No prorated refunds will be issued for the current billing period after cancellation.</p>
        <p>If you wish to request a refund, please refer to our Refund Policy for eligibility requirements and procedures.</p>
        <div className="rounded-xl p-4 border border-primary/25 bg-primary/10">
          <p className="text-primary" style={{ fontSize: "0.85rem", fontWeight: 500 }}>📅 Effective Date</p>
          <p style={{ fontSize: "0.85rem", opacity: 0.8, marginTop: "0.25rem" }}>
            Your cancellation will take effect at the end of your current billing period, after which you will not be charged again.
          </p>
        </div>
      </div>
    ),
  },
  proprietary: {
    title: "Proprietary Rights",
    body: (
      <div className="flex flex-col gap-6">
        <p>The Service and its original content, features, and functionality are and will remain the exclusive property of Visual Node Flow, Inc. and its licensors. The Service is protected by copyright, trademark, and other laws of both the United States and foreign countries.</p>
        <p>Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of Visual Node Flow, Inc.</p>
        <p>Nothing in these Terms shall be construed as granting, by implication, estoppel, or otherwise, any license or right to use any trademark displayed on the Service without our prior written consent.</p>
        <div className="rounded-xl p-4 border border-primary/25 bg-primary/10">
          <p className="text-primary" style={{ fontSize: "0.85rem", fontWeight: 500 }}>© Copyright</p>
          <p style={{ fontSize: "0.85rem", opacity: 0.8, marginTop: "0.25rem" }}>
            © 2026 Visual Node Flow, Inc. All rights reserved. Unauthorized use is strictly prohibited.
          </p>
        </div>
      </div>
    ),
  },
  disclaimer: {
    title: "Disclaimer of Warranties",
    body: (
      <div className="flex flex-col gap-6">
        <p>Your use of the Service is at your sole risk. The Service is provided on an "AS IS" and "AS AVAILABLE" basis. The Service is provided without warranties of any kind, whether express or implied, including, but not limited to, implied warranties of merchantability, fitness for a particular purpose, or non-infringement.</p>
        <p>We make no warranty that the Service will meet your requirements, or that the Service will be uninterrupted, timely, secure, or error-free. We do not warrant that the results that may be obtained from the use of the Service will be accurate or reliable.</p>
        <p>Some jurisdictions do not allow the exclusion of certain warranties, so to that extent the above exclusion may not apply to you.</p>
        <div className="rounded-xl p-4 border border-primary/25 bg-primary/10">
          <p className="text-primary" style={{ fontSize: "0.85rem", fontWeight: 500 }}>⚠️ No Guarantees</p>
          <p style={{ fontSize: "0.85rem", opacity: 0.8, marginTop: "0.25rem" }}>
            While we strive to provide a reliable service, we cannot guarantee uninterrupted or error-free operation.
          </p>
        </div>
      </div>
    ),
  },
  liability: {
    title: "Limitation of Liability",
    body: (
      <div className="flex flex-col gap-6">
        <p>In no event shall Visual Node Flow, Inc., nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses, resulting from (i) your access to or use of or inability to access or use the Service; (ii) any conduct or content of any third party on the Service; (iii) any content obtained from the Service; or (iv) unauthorized access, use or alteration of your transmissions or content.</p>
        <p>Our aggregate liability arising out of or relating to these Terms or the Service shall not exceed the greater of: (a) the amount paid by you to Visual Node Flow for the Service during the three (3) months prior to the cause of action; or (b) one hundred dollars ($100.00).</p>
        <p>Some jurisdictions do not allow the limitation or exclusion of liability for incidental or consequential damages, so the above limitation or exclusion may not apply to you.</p>
        <div className="rounded-xl p-4 border border-primary/25 bg-primary/10">
          <p className="text-primary" style={{ fontSize: "0.85rem", fontWeight: 500 }}>💰 Cap</p>
          <p style={{ fontSize: "0.85rem", opacity: 0.8, marginTop: "0.25rem" }}>
            Our maximum liability is capped at the amount you paid us in the last 3 months or $100, whichever is greater.
          </p>
        </div>
      </div>
    ),
  },
  indemnification: {
    title: "Indemnification",
    body: (
      <div className="flex flex-col gap-6">
        <p>You agree to indemnify, defend, and hold harmless Visual Node Flow, Inc. and its officers, directors, employees, agents, affiliates, licensors, and suppliers from and against any losses, liabilities, claims, actions, or demands, including reasonable attorneys' fees, arising out of or resulting from your violation of these Terms or your violation of any rights of another.</p>
        <p>This indemnity obligation will survive the termination of these Terms and your use of the Service.</p>
        <div className="rounded-xl p-4 border border-primary/25 bg-primary/10">
          <p className="text-primary" style={{ fontSize: "0.85rem", fontWeight: 500 }}>🛡️ Protection</p>
          <p style={{ fontSize: "0.85rem", opacity: 0.8, marginTop: "0.25rem" }}>
            You're responsible for any legal costs arising from your misuse of the Service that harms others or violates these Terms.
          </p>
        </div>
      </div>
    ),
  },
  termination: {
    title: "Termination",
    body: (
      <div className="flex flex-col gap-6">
        <p>We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of these Terms.</p>
        <p>If we terminate or suspend your account for any reason, you are permitted to download and export your content (if applicable and technically feasible) for a period of thirty (30) days from the date of termination.</p>
        <p>All provisions of these Terms which by their nature should survive termination shall survive termination, including, without limitation, ownership provisions, warranty disclaimers, indemnity, and limitations of liability.</p>
        <div className="rounded-xl p-4 border border-primary/25 bg-primary/10">
          <p className="text-primary" style={{ fontSize: "0.85rem", fontWeight: 500 }}>🚪 Account Status</p>
          <p style={{ fontSize: "0.85rem", opacity: 0.8, marginTop: "0.25rem" }}>
            Upon termination, your right to access and use the Service immediately ceases.
          </p>
        </div>
      </div>
    ),
  },
  governing: {
    title: "Governing Law",
    body: (
      <div className="flex flex-col gap-6">
        <p>These Terms and your use of the Service shall be governed by and construed in accordance with the laws of the State of Delaware, United States, without regard to its conflict of law provisions.</p>
        <p>Any disputes arising out of or relating to these Terms or the Service shall be resolved exclusively through binding arbitration in Wilmington, Delaware, under the rules of the American Arbitration Association. The arbitrator's decision shall be final, and judgment may be entered upon the arbitrator's award by any court having jurisdiction thereof.</p>
        <p>You agree to submit to the personal jurisdiction of the courts located within Wilmington, Delaware for the purpose of any such arbitration proceeding.</p>
        <div className="rounded-xl p-4 border border-primary/25 bg-primary/10">
          <p className="text-primary" style={{ fontSize: "0.85rem", fontWeight: 500 }}>⚖️ Jurisdiction</p>
          <p style={{ fontSize: "0.85rem", opacity: 0.8, marginTop: "0.25rem" }}>
            Legal proceedings will be conducted in Delaware courts under Delaware law.
          </p>
        </div>
      </div>
    ),
  },
};

const DEFAULT_SECTION = "acceptance";

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

export default function TermsAndConditionsPage() {
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
            {/* Search */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50" />
              <input
                type="text"
                placeholder="Search terms..."
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground outline-none text-sm"
              />
            </div>
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
                <span className="text-sm" style={{ color: theme.accent }}>Terms of Service</span>
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