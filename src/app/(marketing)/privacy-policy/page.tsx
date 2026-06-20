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
      { id: "overview", label: "Privacy Policy Overview" },
      { id: "effective", label: "Effective Date" },
    ],
  },
  {
    title: "Information Collection",
    icon: FileText,
    items: [
      { id: "personal", label: "Personal Information We Collect" },
      { id: "usage", label: "Usage Data" },
      { id: "cookies", label: "Cookies and Tracking Technologies" },
    ],
  },
  {
    title: "How We Use Information",
    icon: Shield,
    items: [
      { id: "purposes", label: "Purposes of Data Processing" },
      { id: "legal", label: "Legal Basis for Processing" },
      { id: "retention", label: "Data Retention" },
    ],
  },
  {
    title: "Sharing and Disclosure",
    icon: CheckCircle,
    items: [
      { id: "thirdparty", label: "Third-Party Sharing" },
      { id: "transfers", label: "International Data Transfers" },
      { id: "disclosure", label: "Legal Disclosure" },
    ],
  },
  {
    title: "Your Rights and Choices",
    icon: Zap,
    items: [
      { id: "access", label: "Access and Portability" },
      { id: "correction", label: "Correction and Deletion" },
      { id: "optout", label: "Opt-Out and Consent" },
      { id: "do-not-track", label: "Do Not Track" },
    ],
  },
  {
    title: "Security",
    icon: Shield,
    items: [
      { id: "measures", label: "Security Measures" },
      { id: "breach", label: "Data Breach Procedures" },
    ],
  },
  {
    title: "Children's Privacy",
    icon: FileText,
    items: [
      { id: "children", label: "Children's Privacy" },
    ],
  },
  {
    title: "Changes to Policy",
    icon: Zap,
    items: [
      { id: "changes", label: "Policy Updates" },
      { id: "contact", label: "Contact Us" },
    ],
  },
];

const CONTENT: Record<string, { title: string; body: React.ReactNode }> = {
  overview: {
    title: "Privacy Policy Overview",
    body: (
      <div className="flex flex-col gap-6">
        <p>This Privacy Policy describes how Visual Node Flow, Inc. ("Company", "we", "us", or "our") collects, uses, discloses, and protects your information when you use our service (the "Service"). By accessing or using the Service, you agree to the terms of this Privacy Policy.</p>
        <p>We are committed to protecting your privacy and ensuring your personal information is handled in a safe and responsible manner.</p>
        <div className="rounded-xl p-4 border border-primary/25 bg-primary/10">
          <p className="text-primary" style={{ fontSize: "0.85rem", fontWeight: 500 }}>📋 Summary</p>
          <p style={{ fontSize: "0.85rem", opacity: 0.8, marginTop: "0.25rem" }}>
            We collect personal information you provide directly, usage data automatically, and use cookies to enhance your experience. We use this information to provide, improve, and communicate about our Service.
          </p>
        </div>
      </div>
    ),
  },
  effective: {
    title: "Effective Date",
    body: (
      <div className="flex flex-col gap-6">
        <p>This Privacy Policy is effective as of May 31, 2026.</p>
        <p>We reserve the right to modify this Privacy Policy at any time, so please review it periodically. Continued use of the Service after any changes constitutes acceptance of the updated policy.</p>
        <div className="rounded-xl p-4 border border-primary/25 bg-primary/10">
          <p className="text-primary" style={{ fontSize: "0.85rem", fontWeight: 500 }}>📅 Important</p>
          <p style={{ fontSize: "0.85rem", opacity: 0.8, marginTop: "0.25rem" }}>
            Your continued use of the Service after we post any modifications constitutes your acknowledgment of the modifications and your consent to abide and be bound by the modified Privacy Policy.
          </p>
        </div>
      </div>
    ),
  },
  personal: {
    title: "Personal Information We Collect",
    body: (
      <div className="flex flex-col gap-6">
        <p>We collect personal information that you voluntarily provide to us when you register for an account, use our Service, or contact us.</p>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex gap-3">
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-primary" style={{ fontWeight: 700, fontSize: "0.75rem" }}>
                {i}
              </div>
              <div>
                <p style={{ fontSize: "0.875rem", lineHeight: 1.65, opacity: 0.8, margin: 0 }}>
                  {[
                    "Contact details such as name, email address, phone number, and mailing address.",
                    "Account credentials including encrypted passwords and authentication tokens.",
                    "Payment information such as credit card details (processed by our payment gateway), billing address, and transaction history.",
                    "Profile information you choose to provide, including profile picture, bio, and preferences.",
                    "Correspondence and support tickets when you contact our customer service team."
                  ][i-1]}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-xl p-4 border border-primary/25 bg-primary/10">
          <p className="text-primary" style={{ fontSize: "0.85rem", fontWeight: 500 }}>✅ Voluntary Provision</p>
          <p style={{ fontSize: "0.85rem", opacity: 0.8, marginTop: "0.25rem" }}>
            While most of the information we collect is voluntary, providing certain details is necessary to use specific features of our Service.
          </p>
        </div>
      </div>
    ),
  },
  usage: {
    title: "Usage Data",
    body: (
      <div className="flex flex-col gap-6">
        <p>When you access and use the Service, we automatically collect certain information about your device and usage patterns.</p>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex gap-3">
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-primary" style={{ fontWeight: 700, fontSize: "0.75rem" }}>
                {i}
              </div>
              <div>
                <p style={{ fontSize: "0.875rem", lineHeight: 1.65, opacity: 0.8, margin: 0 }}>
                  {[
                    "Technical information including IP address, browser type, operating system, device type, and screen resolution.",
                    "Interaction data such as pages viewed, features used, clicks, scroll depth, and time spent on specific areas.",
                    "Performance metrics including load times, error logs, and system responses.",
                    "Referral information detailing how you arrived at our Service (e.g., search engine, social media, referral link)."
                  ][i-1]}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-xl p-4 border border-primary/25 bg-primary/10">
          <p className="text-primary" style={{ fontSize: "0.85rem", fontWeight: 500 }}>📊 Automatic Collection</p>
          <p style={{ fontSize: "0.85rem", opacity: 0.8, marginTop: "0.25rem" }}>
            This data helps us understand how our Service is used, diagnose technical issues, and improve performance and user experience.
          </p>
        </div>
      </div>
    ),
  },
  cookies: {
    title: "Cookies and Tracking Technologies",
    body: (
      <div className="flex flex-col gap-6">
        <p>We use cookies and similar tracking technologies to enhance your experience, analyze usage patterns, and support our marketing efforts.</p>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3">
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-primary" style={{ fontWeight: 700, fontSize: "0.75rem" }}>
                {i}
              </div>
              <div>
                <p style={{ fontSize: "0.875rem", lineHeight: 1.65, opacity: 0.8, margin: 0 }}>
                  {[
                    "Essential cookies: Necessary for the Service to function properly (e.g., session management, security, load balancing).",
                    "Analytics cookies: Help us understand how visitors interact with our Service to improve content and performance.",
                    "Marketing cookies: Used to deliver relevant advertisements and measure the effectiveness of advertising campaigns."
                  ][i-1]}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-xl p-4 border border-primary/25 bg-primary/10">
          <p className="text-primary" style={{ fontSize: "0.85rem", fontWeight: 500 }}>🍪 Cookie Control</p>
          <p style={{ fontSize: "0.85rem", opacity: 0.8, marginTop: "0.25rem" }}>
            You can manage your cookie preferences through your browser settings. Disabling certain cookies may affect the functionality of our Service.
          </p>
        </div>
      </div>
    ),
  },
  purposes: {
    title: "Purposes of Data Processing",
    body: (
      <div className="flex flex-col gap-6">
        <p>We use the information we collect for various legitimate business purposes to provide, maintain, and improve our Service.</p>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex gap-3">
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-primary" style={{ fontWeight: 700, fontSize: "0.75rem" }}>
                {i}
              </div>
              <div>
                <p style={{ fontSize: "0.875rem", lineHeight: 1.65, opacity: 0.8, margin: 0 }}>
                  {[
                    "To provide, operate, and maintain our Service and ensure its security and integrity.",
                    "To create and manage your account, process payments, and deliver customer support.",
                    "To personalize your experience, recommend features, and send service-related communications.",
                    "To analyze usage trends, improve functionality, and develop new features based on user behavior.",
                    "To communicate with you about promotions, updates, and important Service-related information.",
                    "To comply with legal obligations, enforce our terms, and protect against fraud or malicious activity."
                  ][i-1]}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-xl p-4 border border-primary/25 bg-primary/10">
          <p className="text-primary" style={{ fontSize: "0.85rem", fontWeight: 500 }}>🎯 Legitimate Uses</p>
          <p style={{ fontSize: "0.85rem", opacity: 0.8, marginTop: "0.25rem" }}>
            We only use your information for the purposes described in this Privacy Policy or as otherwise disclosed at the time of collection.
          </p>
        </div>
      </div>
    ),
  },
  legal: {
    title: "Legal Basis for Processing",
    body: (
      <div className="flex flex-col gap-6">
        <p>We process your personal information based on the following legal grounds:</p>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex gap-3">
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-primary" style={{ fontWeight: 700, fontSize: "0.75rem" }}>
                {i}
              </div>
              <div>
                <p style={{ fontSize: "0.875rem", lineHeight: 1.65, opacity: 0.8, margin: 0 }}>
                  {[
                    "Consent: When you explicitly agree to specific processing activities (e.g., marketing communications).",
                    "Contract Performance: Necessary to fulfill our obligations under our Terms of Service (e.g., providing the Service you requested).",
                    "Legal Obligation: Required to comply with applicable laws, regulations, or valid legal requests.",
                    "Legitimate Interests: To pursue our business interests while respecting your privacy rights (e.g., fraud prevention, security)."
                  ][i-1]}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-xl p-4 border border-primary/25 bg-primary/10">
          <p className="text-primary" style={{ fontSize: "0.85rem", fontWeight: 500 }}>⚖️ Legal Grounds</p>
          <p style={{ fontSize: "0.85rem", opacity: 0.8, marginTop: "0.25rem" }}>
            We will not process your personal information for any purpose other than those identified in this Privacy Policy without obtaining your consent where required by law.
          </p>
        </div>
      </div>
    ),
  },
  retention: {
    title: "Data Retention",
    body: (
      <div className="flex flex-col gap-6">
        <p>We retain your personal information only for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law.</p>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3">
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-primary" style={{ fontWeight: 700, fontSize: "0.75rem" }}>
                {i}
              </div>
              <div>
                <p style={{ fontSize: "0.875rem", lineHeight: 1.65, opacity: 0.8, margin: 0 }}>
                  {[
                    "Account information is retained for as long as your account remains active or as needed to provide you with the Service.",
                    "Transaction and billing records are maintained for tax, accounting, and legal compliance purposes (typically 7 years).",
                    "Usage logs and analytics data are retained for up to 24 months to analyze trends and improve our Service."
                  ][i-1]}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-xl p-4 border border-primary/25 bg-primary/10">
          <p className="text-primary" style={{ fontSize: "0.85rem", fontWeight: 500 }}>⏳ Retention Policy</p>
          <p style={{ fontSize: "0.85rem", opacity: 0.8, marginTop: "0.25rem" }}>
            Upon request, we will delete or anonymize your personal information unless we are required to retain it by law or for legitimate business purposes.
          </p>
        </div>
      </div>
    ),
  },
  thirdparty: {
    title: "Third-Party Sharing",
    body: (
      <div className="flex flex-col gap-6">
        <p>We share your personal information with trusted third parties who assist us in providing and improving our Service.</p>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex gap-3">
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-primary" style={{ fontWeight: 700, fontSize: "0.75rem" }}>
                {i}
              </div>
              <div>
                <p style={{ fontSize: "0.875rem", lineHeight: 1.65, opacity: 0.8, margin: 0 }}>
                  {[
                    "Service Providers: Vendors that perform functions on our behalf (e.g., hosting, payment processing, email delivery, analytics).",
                    "Business Transfers: In connection with a merger, acquisition, or sale of assets, your information may be transferred as part of the transaction.",
                    "Affiliates: Our parent company, subsidiaries, or other entities under common control for internal operational purposes.",
                    "Advertising Partners: To deliver targeted advertisements and measure campaign effectiveness (only with your consent where required)."
                  ][i-1]}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-xl p-4 border border-primary/25 bg-primary/10">
          <p className="text-primary" style={{ fontSize: "0.85rem", fontWeight: 500 }}>🤝 Trusted Partners</p>
          <p style={{ fontSize: "0.85rem", opacity: 0.8, marginTop: "0.25rem" }}>
            We require these third parties to protect your information in accordance with this Privacy Policy and applicable data protection laws.
          </p>
        </div>
      </div>
    ),
  },
  transfers: {
    title: "International Data Transfers",
    body: (
      <div className="flex flex-col gap-6">
        <p>As a global service, we may transfer, store, and process your personal information in countries outside of your residence.</p>
        <p>Where we transfer personal information outside the European Economic Area (EEA) or other regions with adequate data protection laws, we ensure appropriate safeguards are in place.</p>
        <div className="rounded-xl p-4 border border-primary/25 bg-primary/10">
          <p className="text-primary" style={{ fontSize: "0.85rem", fontWeight: 500 }}>🌍 Global Transfers</p>
          <p style={{ fontSize: "0.85rem", opacity: 0.8, marginTop: "0.25rem" }}>
            We rely on mechanisms such as Standard Contractual Clauses (SCCs), Binding Corporate Rules (BCRs), or your explicit consent to ensure lawful international data transfers.
          </p>
        </div>
      </div>
    ),
  },
  disclosure: {
    title: "Legal Disclosure",
    body: (
      <div className="flex flex-col gap-6">
        <p>We may disclose your personal information when we believe in good faith that disclosure is necessary to:</p>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex gap-3">
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-primary" style={{ fontWeight: 700, fontSize: "0.75rem" }}>
                {i}
              </div>
              <div>
                <p style={{ fontSize: "0.875rem", lineHeight: 1.65, opacity: 0.8, margin: 0 }}>
                  {[
                    "Comply with applicable laws, regulations, court orders, or valid legal processes (e.g., subpoenas, warrants).",
                    "Protect and defend our rights, property, or safety, or that of our users or the public.",
                    "Detect, prevent, or address fraud, security, or technical issues that could harm our Service or users.",
                    "Address urgent circumstances to prevent imminent harm to life or property, or in connection with investigations of illegal activities."
                  ][i-1]}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-xl p-4 border border-primary/25 bg-primary/10">
          <p className="text-primary" style={{ fontSize: "0.85rem", fontWeight: 500 }}>⚖️ Lawful Disclosure</p>
          <p style={{ fontSize: "0.85rem", opacity: 0.8, marginTop: "0.25rem" }}>
            We will only disclose the minimum information necessary and will notify you of such disclosure unless prohibited by law or to prevent imminent harm.
          </p>
        </div>
      </div>
    ),
  },
  access: {
    title: "Access and Portability",
    body: (
      <div className="flex flex-col gap-6">
        <p>You have the right to request access to the personal information we hold about you and to receive a copy of that information in a commonly used electronic format.</p>
        <p>To exercise this right, please contact our privacy team using the contact information provided at the end of this policy.</p>
        <div className="rounded-xl p-4 border border-primary/25 bg-primary/10">
          <p className="text-primary" style={{ fontSize: "0.85rem", fontWeight: 500 }}>📥 Data Access</p>
          <p style={{ fontSize: "0.85rem", opacity: 0.8, marginTop: "0.25rem" }}>
            We will respond to your request within the timeframe required by applicable law, typically within 30 days.
          </p>
        </div>
      </div>
    ),
  },
  correction: {
    title: "Correction and Deletion",
    body: (
      <div className="flex flex-col gap-6">
        <p>You have the right to request correction of inaccurate or incomplete personal information we hold about you.</p>
        <p>Depending on your jurisdiction, you may also have the right to request deletion or erasure of your personal information (the "right to be forgotten").</p>
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="flex gap-3">
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-primary" style={{ fontWeight: 700, fontSize: "0.75rem" }}>
                {i}
              </div>
              <div>
                <p style={{ fontSize: "0.875rem", lineHeight: 1.65, opacity: 0.8, margin: 0 }}>
                  {[
                    "To request correction, please provide details of the inaccurate information and the correct details you wish us to update.",
                    "To request deletion, please note that we may retain certain information as required by law or for legitimate business purposes (e.g., fraud prevention, legal compliance)."
                  ][i-1]}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-xl p-4 border border-primary/25 bg-primary/10">
          <p className="text-primary" style={{ fontSize: "0.85rem", fontWeight: 500 }}>✏️🗑️ Your Rights</p>
          <p style={{ fontSize: "0.85rem", opacity: 0.8, marginTop: "0.25rem" }}>
            We will verify your identity before acting on any request to protect your information from unauthorized access or disclosure.
          </p>
        </div>
      </div>
    ),
  },
  optout: {
    title: "Opt-Out and Consent",
    body: (
      <div className="flex flex-col gap-6">
        <p>You have the right to opt-out of certain uses of your personal information, including:</p>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3">
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-primary" style={{ fontWeight: 700, fontSize: "0.75rem" }}>
                {i}
              </div>
              <div>
                <p style={{ fontSize: "0.875rem", lineHeight: 1.65, opacity: 0.8, margin: 0 }}>
                  {[
                    "Direct marketing communications (email, SMS, etc.). You can unsubscribe using the link in our communications or by contacting us directly.",
                    "Targeted advertising based on your browsing behavior or profile information.",
                    "Sharing your information with third parties for their own marketing purposes."
                  ][i-1]}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-xl p-4 border border-primary/25 bg-primary/10">
          <p className="text-primary" style={{ fontSize: "0.85rem", fontWeight: 500 }}>🚫 Opt-Out Options</p>
          <p style={{ fontSize: "0.85rem", opacity: 0.8, marginTop: "0.25rem" }}>
            We respect your choices and will honor your opt-out requests promptly. Please note that opting out of certain sharing may affect the functionality of our Service.
          </p>
        </div>
      </div>
    ),
  },
  "do-not-track": {
    title: "Do Not Track",
    body: (
      <div className="flex flex-col gap-6">
        <p>We do not alter our data collection and usage practices when we detect a Do Not Track (DNT) signal from your browser.</p>
        <p>Currently, there is no industry standard for how companies should respond to DNT signals. We maintain our commitment to transparency through this Privacy Policy.</p>
        <div className="rounded-xl p-4 border border-primary/25 bg-primary/10">
          <p className="text-primary" style={{ fontSize: "0.85rem", fontWeight: 500 }}>🚫 DNT Policy</p>
          <p style={{ fontSize: "0.85rem", opacity: 0.8, marginTop: "0.25rem" }}>
            We encourage you to review our Privacy Policy to understand how we collect, use, and share your information regardless of DNT signals.
          </p>
        </div>
      </div>
    ),
  },
  measures: {
    title: "Security Measures",
    body: (
      <div className="flex flex-col gap-6">
        <p>We implement appropriate technical and organizational measures to protect your personal information against accidental or unlawful destruction, loss, alteration, unauthorized disclosure, or access.</p>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex gap-3">
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-primary" style={{ fontWeight: 700, fontSize: "0.75rem" }}>
                {i}
              </div>
              <div>
                <p style={{ fontSize: "0.875rem", lineHeight: 1.65, opacity: 0.8, margin: 0 }}>
                  {[
                    "Encryption: We encrypt sensitive data both in transit (using TLS 1.2 or higher) and at rest (using AES-256 encryption where feasible).",
                    "Access Controls: Strict role-based access controls limit who can access personal information within our organization.",
                    "Regular Audits: We conduct periodic security assessments, penetration testing, and vulnerability scans to identify and address weaknesses.",
                    "Employee Training: Our staff receive regular training on data protection, privacy best practices, and security incident response."
                  ][i-1]}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-xl p-4 border border-primary/25 bg-primary/10">
          <p className="text-primary" style={{ fontSize: "0.85rem", fontWeight: 500 }}>🔒 Security Commitment</p>
          <p style={{ fontSize: "0.85rem", opacity: 0.8, marginTop: "0.25rem" }}>
            While we strive to protect your information, no method of transmission over the Internet or electronic storage is 100% secure. We cannot guarantee absolute security.
          </p>
        </div>
      </div>
    ),
  },
  breach: {
    title: "Data Breach Procedures",
    body: (
      <div className="flex flex-col gap-6">
        <p>In the unfortunate event of a data breach that compromises your personal information, we have established procedures to respond promptly and effectively.</p>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3">
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-primary" style={{ fontWeight: 700, fontSize: "0.75rem" }}>
                {i}
              </div>
              <div>
                <p style={{ fontSize: "0.875rem", lineHeight: 1.65, opacity: 0.8, margin: 0 }}>
                  {[
                    "Containment: We will take immediate steps to contain the breach, prevent further unauthorized access, and preserve evidence for investigation.",
                    "Notification: We will notify affected individuals and relevant regulatory authorities as required by applicable law without undue delay.",
                    "Remediation: We will implement corrective actions to address the root cause, mitigate harm, and prevent recurrence of similar incidents."
                  ][i-1]}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-xl p-4 border border-primary/25 bg-primary/10">
          <p className="text-primary" style={{ fontSize: "0.85rem", fontWeight: 500 }}>🚨 Breach Response</p>
          <p style={{ fontSize: "0.85rem", opacity: 0.8, marginTop: "0.25rem" }}>
            Our goal is to be transparent, take responsibility, and provide you with the information and support you need to protect yourself.
          </p>
        </div>
      </div>
    ),
  },
  children: {
    title: "Children's Privacy",
    body: (
      <div className="flex flex-col gap-6">
        <p>Our Service is not directed to children under the age of 13 (or the applicable age in your jurisdiction), and we do not knowingly collect personal information from children.</p>
        <p>If we become aware that we have inadvertently collected personal information from a child under 13, we will take steps to delete such information as soon as possible.</p>
        <div className="rounded-xl p-4 border border-primary/25 bg-primary/10">
          <p className="text-primary" style={{ fontSize: "0.85rem", fontWeight: 500 }}>👶 Children Under 13</p>
          <p style={{ fontSize: "0.85rem", opacity: 0.8, marginTop: "0.25rem" }}>
            Parents and guardians should supervise their children's online activity and ensure they do not provide personal information to our Service without consent.
          </p>
        </div>
      </div>
    ),
  },
  changes: {
    title: "Policy Updates",
    body: (
      <div className="flex flex-col gap-6">
        <p>We may update this Privacy Policy from time to time to reflect changes in our practices, legal requirements, or business operations.</p>
        <p>The updated version will be indicated by a revised "Effective Date" at the top of this policy, and your continued use of the Service after such changes constitutes your acceptance of the updated Privacy Policy.</p>
        <div className="rounded-xl p-4 border border-primary/25 bg-primary/10">
          <p className="text-primary" style={{ fontSize: "0.85rem", fontWeight: 500 }}>🔄 Staying Informed</p>
          <p style={{ fontSize: "0.85rem", opacity: 0.8, marginTop: "0.25rem" }}>
            We recommend that you periodically review this Privacy Policy for any changes. We may also notify you of significant changes via email or through our Service.
          </p>
        </div>
      </div>
    ),
  },
  contact: {
    title: "Contact Us",
    body: (
      <div className="flex flex-col gap-6">
        <p>If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us using the information below:</p>
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="flex gap-3">
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-primary" style={{ fontWeight: 700, fontSize: "0.75rem" }}>
                {i}
              </div>
              <div>
                <p style={{ fontSize: "0.875rem", lineHeight: 1.65, opacity: 0.8, margin: 0 }}>
                  {[
                    "Email: privacy@visualnodeflow.io",
                    "Mail: Visual Node Flow, Inc., Attn: Privacy Officer, 123 Innovation Drive, Wilmington, DE 19801, USA"
                  ][i-1]}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-xl p-4 border border-primary/25 bg-primary/10">
          <p className="text-primary" style={{ fontSize: "0.85rem", fontWeight: 500 }}>📬 Reach Out</p>
          <p style={{ fontSize: "0.85rem", opacity: 0.8, marginTop: "0.25rem" }}>
            We will make every effort to respond to your inquiry in a timely manner, typically within 5-10 business days.
          </p>
        </div>
      </div>
    ),
  },
};

const DEFAULT_SECTION = "overview";

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

export default function PrivacyPolicyPage() {
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
                placeholder="Search privacy policy..."
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
                <span className="text-sm" style={{ color: theme.accent }}>Privacy Policy</span>
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