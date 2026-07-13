"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import { useInView } from "motion/react";
import { Check, Zap, Crown, ChevronDown, ArrowRight, X } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../stores/authStore";
import { supabase } from "../../db/supabase";
import { toast } from "sonner";

const PLANS = [
  {
    name: "Free Trial",
    badge: "3 days / month",
    price: { monthly: 0, annual: 0 },
    description: "Try Visual Node Flow risk-free. Explore core features with a 3-day monthly access window.",
    icon: Zap,
    color: "#a78bfa",
    cta: "Start free trial",
    popular: false,
    features: [
      { text: "3 days access per month", included: true },
      { text: "5 diagrams", included: true },
      { text: "Up to 50 nodes per diagram", included: true },
      { text: "PNG export", included: true },
      { text: "10 starter templates", included: true },
      { text: "Visual Node Flow watermark", included: true },
      { text: "Unlimited diagrams", included: false },
      { text: "No watermark", included: false },
      { text: "PDF / JPEG / SVG export", included: false },
      { text: "Collaboration", included: false },
    ],
  },
  {
    name: "Pro",
    badge: "Most popular",
    price: { monthly: 399, annual: 319 },
    description: "Everything you need to create, export, and collaborate without limits.",
    icon: Crown,
    color: "#818cf8",
    cta: "Start 3-day trial",
    popular: true,
    features: [
      { text: "Unlimited diagrams", included: true },
      { text: "Unlimited nodes per diagram", included: true },
      { text: "PNG, JPEG, PDF, SVG, Mermaid export", included: true },
      { text: "Premium templates", included: true },
      { text: "No watermark", included: true },
      { text: "Priority email support", included: true },
      { text: "Embed & share links", included: true },
      { text: "Real-time collaboration", included: true },
      { text: "All future features", included: true },
    ],
  },
];

const FAQS = [
  { q: "What happens after the 3-day free trial?", a: "Your diagrams remain safe. After the trial period you can continue with the free plan (3 days access per month with limited features) or upgrade to Pro for unlimited access." },
  { q: "Can I switch from monthly to annual billing?", a: "Yes, you can switch at any time. When switching to annual you'll be billed the annual rate immediately and save ~20% compared to monthly." },
  { q: "What happens to my diagrams if I downgrade?", a: "All your diagrams are preserved. If you exceed the free plan limits, existing diagrams are kept in read-only mode until you delete some or upgrade again." },
  { q: "Do you offer discounts for nonprofits or education?", a: "Yes! We offer 50% discounts for verified nonprofit organizations and educational institutions. Contact our team to apply." },
  { q: "What payment methods do you accept?", a: "We accept all major credit cards (Visa, Mastercard, Amex) and PayPal. Annual plans can also be paid by bank transfer." },
  { q: "Is my data safe?", a: "Visual Node Flow is local-first — your diagrams are stored on your device. Nothing is sent to the cloud unless you explicitly use collaboration or share features." },
];

function FaqItem({ faq }: { faq: typeof FAQS[0] }) {
  const [open, setOpen] = useState(false);
  const { isDark } = useTheme();
  const textPrimary = isDark ? "text-white" : "text-gray-900";
  const textSecondary = isDark ? "text-white/55" : "text-gray-600";
  const borderColor = isDark ? "border-white/8" : "border-gray-200";

  return (
    <div className={`border-b ${borderColor}`}>
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between py-5 text-left gap-4">
        <span className={textPrimary} style={{ fontWeight: 500, fontSize: "0.95rem" }}>{faq.q}</span>
        <ChevronDown className={`w-4 h-4 flex-shrink-0 transition-transform ${open ? "rotate-180" : ""} ${isDark ? "text-white/40" : "text-gray-400"}`} />
      </button>
      {open && (
        <p className={`pb-5 ${textSecondary}`} style={{ fontSize: "0.875rem", lineHeight: 1.7 }}>{faq.a}</p>
      )}
    </div>
  );
}

export default function PricingPage() {
  const [annual, setAnnual] = useState(true);
  const { isDark, theme } = useTheme();
  const router = useRouter();
  const navigate = (path: string) => router.push(path);
  const heroRef = useRef(null);
  const heroInView = useInView(heroRef, { once: true });
  const plansRef = useRef(null);
  const plansInView = useInView(plansRef, { once: true, margin: "-80px" });

  const { user } = useAuthStore();
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => {
    const pendingPlan = localStorage.getItem("pending_plan_checkout");
    if (pendingPlan && user) {
      localStorage.removeItem("pending_plan_checkout");
      handleSubscribe(pendingPlan as "monthly" | "annual");
    }
  }, [user]);

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleSubscribe = async (planType: "monthly" | "annual") => {
    if (!user) {
      localStorage.setItem("pending_plan_checkout", planType);
      toast.info("Please sign in to subscribe to the Pro Plan");
      navigate("/auth");
      return;
    }

    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      toast.error("Failed to load Razorpay SDK. Please check your connection.");
      return;
    }

    setSubscribing(true);
    const toastId = toast.loading("Initiating subscription...");

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error("Authentication token missing");

      const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api";
      const res = await fetch(`${API_BASE}/subscriptions/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ planType }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to initiate subscription");
      }

      const { subscriptionId, keyId } = await res.json();
      toast.dismiss(toastId);

      const options = {
        key: keyId,
        subscription_id: subscriptionId,
        name: "Visual Node Flow",
        description: planType === "monthly" ? "Pro Plan - Monthly (₹399/mo)" : "Pro Plan - Annual (₹319/mo, ₹3828/yr)",
        handler: async (response: any) => {
          const verifyToastId = toast.loading("Verifying payment...");
          try {
            const verifyRes = await fetch(`${API_BASE}/subscriptions/verify`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_subscription_id: response.razorpay_subscription_id,
                razorpay_signature: response.razorpay_signature,
                planType,
              }),
            });

            if (!verifyRes.ok) {
              const err = await verifyRes.json();
              throw new Error(err.error || "Verification failed");
            }

            toast.dismiss(verifyToastId);
            toast.success("Subscription activated successfully!");

            // Reload user profile in Zustand store
            const authStore = useAuthStore.getState();
            await authStore.init();

            navigate("/dashboard");
          } catch (e: any) {
            toast.dismiss(verifyToastId);
            toast.error(e.message || "Failed to verify subscription");
          } finally {
            setSubscribing(false);
          }
        },
        prefill: {
          name: user.displayName || user.username,
          email: user.email,
        },
        theme: {
          color: theme.accent,
        },
        modal: {
          ondismiss: () => {
            setSubscribing(false);
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      toast.dismiss(toastId);
      console.error(err);
      toast.error(err.message || "Failed to start subscription process");
      setSubscribing(false);
    }
  };

  const bg = "bg-background text-foreground";
  const textPrimary = "text-foreground";
  const textSecondary = "text-muted-foreground";
  const cardBg = theme.panel;
  const cardBorder = theme.border;

  return (
    <div className={`min-h-screen pt-16 ${bg}`} style={{ backgroundColor: theme.canvas }}>
      {/* Hero */}
      <div className="relative overflow-hidden py-24">
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{ background: `radial-gradient(ellipse at 50% 0%, ${theme.accent} 0%, transparent 70%)` }}
        />
        <div className="relative max-w-3xl mx-auto px-6 text-center" ref={heroRef}>
          <motion.div initial={{ opacity: 0, y: 24 }} animate={heroInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-6"
              style={{ borderColor: `${theme.accent}4d`, background: `${theme.accent}1a`, color: theme.accent }}>
              <span className="text-xs">Simple, transparent pricing</span>
            </div>
            <h1 className={`mb-4 ${textPrimary}`} style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 800, fontSize: "clamp(2.2rem,5vw,3.5rem)", lineHeight: 1.1, letterSpacing: "-0.02em" }}>
              Choose the plan that fits
              <span style={{ backgroundImage: `linear-gradient(135deg, ${theme.accent}, #818cf8, #60a5fa)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}> your needs</span>
            </h1>
            <p className={`max-w-xl mx-auto mb-8 ${textSecondary}`} style={{ fontSize: "1rem", lineHeight: 1.7 }}>
              Start with a free trial, upgrade when you're ready. No hidden fees, cancel anytime.
            </p>

            {/* Annual/Monthly toggle */}
            <div className="inline-flex items-center gap-1 p-1 rounded-xl" style={{ backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)" }}>
              {["Monthly", "Annual"].map((opt) => (
                <button
                  key={opt}
                  onClick={() => setAnnual(opt === "Annual")}
                  className="px-5 py-2 rounded-lg text-sm transition-all"
                  style={{
                    background: (opt === "Annual") === annual ? (isDark ? "rgba(255,255,255,0.12)" : "var(--background)") : "transparent",
                    color: (opt === "Annual") === annual ? "var(--foreground)" : "var(--muted-foreground)",
                    fontWeight: (opt === "Annual") === annual ? 600 : 400,
                    boxShadow: (opt === "Annual") === annual ? "0 1px 4px rgba(0,0,0,0.1)" : "none",
                  }}
                >
                  {opt}
                  {opt === "Annual" && <span className="ml-2 text-xs font-semibold" style={{ color: theme.accent }}>–20%</span>}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Plans — 2 columns, centered */}
      <div className="max-w-3xl mx-auto px-6 pb-16" ref={plansRef}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {PLANS.map((plan, i) => {
            const Icon = plan.icon;
            const price = annual ? plan.price.annual : plan.price.monthly;
            const isFree = price === 0;
            const planColor = plan.popular ? theme.accent : (isDark ? "rgba(255,255,255,0.6)" : "rgba(15,10,40,0.6)");
            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                animate={plansInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                className="relative rounded-2xl border flex flex-col overflow-hidden @container animate-all duration-300 hover:border-primary/40"
                style={{
                  background: cardBg,
                  borderColor: plan.popular ? theme.accent : cardBorder,
                  boxShadow: plan.popular ? `0 0 40px ${theme.accent}20` : "none",
                }}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: `linear-gradient(to right, ${theme.accent}, ${theme.accent}80)` }} />
                )}

                <div className="p-7 flex flex-col flex-1">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: plan.popular ? `${planColor}18` : "rgba(255,255,255,0.06)", border: `1px solid ${plan.popular ? planColor + "35" : "var(--border)"}` }}>
                        <Icon className="w-4.5 h-4.5" style={{ color: planColor, width: 18, height: 18 }} />
                      </div>
                      <div>
                        <p className={textPrimary} style={{ fontWeight: 700, fontSize: "1rem", fontFamily: "Plus Jakarta Sans, sans-serif" }}>
                          {plan.name}
                        </p>
                        <p className="text-xs" style={{ color: planColor, fontWeight: 500 }}>{plan.badge}</p>
                      </div>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-1">
                    {isFree ? (
                      <span className={textPrimary} style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 800, fontSize: "2.6rem", lineHeight: 1 }}>
                        Free
                      </span>
                    ) : (
                      <div className="flex items-end gap-1">
                        <span className={textPrimary} style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 800, fontSize: "2.6rem", lineHeight: 1 }}>
                          ₹{price}
                        </span>
                        <span className={textSecondary} style={{ fontSize: "0.9rem", marginBottom: "0.35rem" }}>/mo</span>
                      </div>
                    )}
                  </div>
                  {annual && !isFree && (
                    <p className="mb-1" style={{ color: planColor, fontSize: "0.75rem", fontWeight: 500 }}>
                      Billed annually · ₹{(price * 12).toFixed(2)}/yr
                    </p>
                  )}
                  {!annual && !isFree && (
                    <p className={`mb-1 ${textSecondary}`} style={{ fontSize: "0.75rem" }}>
                      Switch to annual and save 20%
                    </p>
                  )}

                  <p className={`mt-3 mb-6 ${textSecondary}`} style={{ fontSize: "0.85rem", lineHeight: 1.6 }}>{plan.description}</p>

                  {/* CTA */}
                  <motion.button
                    onClick={() => {
                      if (isFree) {
                        if (!user) navigate("/auth");
                        else navigate("/dashboard");
                      } else {
                        if (user?.subscriptionStatus === "active") {
                          toast.info("You already have an active subscription!");
                          navigate("/dashboard");
                        } else {
                          handleSubscribe(annual ? "annual" : "monthly");
                        }
                      }
                    }}
                    disabled={subscribing}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="w-full py-3 rounded-xl text-sm mb-6 flex items-center justify-center gap-2 disabled:opacity-50"
                    style={{
                      background: plan.popular ? `linear-gradient(135deg, ${theme.accent}, ${theme.accent}dd)` : isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
                      color: plan.popular ? "var(--primary-foreground)" : "var(--foreground)",
                      fontWeight: 600,
                    }}
                  >
                    {subscribing && !isFree ? (
                      <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                    ) : (
                      <>
                        {user?.subscriptionStatus === "active" && !isFree ? "Active Subscription" : plan.cta}
                        {plan.popular && <ArrowRight className="w-3.5 h-3.5" />}
                      </>
                    )}
                  </motion.button>

                  {/* Divider */}
                  <div className="border-t mb-6" style={{ borderColor: theme.border }} />

                  {/* Features */}
                  <ul className="grid grid-cols-1 @[340px]:grid-cols-2 gap-x-4 gap-y-3 flex-1 items-start">
                    {plan.features.map((f) => (
                      <li key={f.text} className="flex items-center gap-2.5">
                        {f.included ? (
                          <Check className="w-4 h-4 flex-shrink-0" style={{ color: plan.color }} />
                        ) : (
                          <X className="w-4 h-4 flex-shrink-0" style={{ color: isDark ? "rgba(255,255,255,0.2)" : "#d1d5db" }} />
                        )}
                        <span
                          style={{
                            fontSize: "0.85rem",
                            color: f.included
                              ? isDark ? "rgba(255,255,255,0.75)" : "#374151"
                              : isDark ? "rgba(255,255,255,0.25)" : "#9ca3af",
                          }}
                        >
                          {f.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Coming soon banner */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={plansInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-6 rounded-2xl border px-6 py-5 flex items-center gap-4"
          style={{
            background: `${theme.accent}12`,
            borderColor: `${theme.accent}40`,
          }}
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${theme.accent}22`, border: `1px solid ${theme.accent}40` }}>
            <Crown className="w-5 h-5" style={{ color: theme.accent }} />
          </div>
          <div>
            <p className={`${textPrimary}`} style={{ fontWeight: 600, fontSize: "0.95rem", fontFamily: "Plus Jakarta Sans, sans-serif" }}>
              Team & Enterprise plans coming soon
            </p>
            <p className={textSecondary} style={{ fontSize: "0.82rem", marginTop: "0.15rem" }}>
              SSO, team workspaces, admin controls, and dedicated support. Join the waitlist to get early access.
            </p>
          </div>
          <button
            className="flex-shrink-0 px-4 py-2 rounded-xl text-xs border hover:bg-primary/10 transition-colors font-semibold"
            style={{ color: theme.accent, borderColor: `${theme.accent}40` }}
          >
            Join waitlist
          </button>
        </motion.div>

        {/* FAQ */}
        <div className="mt-24 max-w-2xl mx-auto">
          <h2 className={`text-center mb-12 ${textPrimary}`} style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 800, fontSize: "2rem" }}>
            Frequently asked questions
          </h2>
          {FAQS.map((faq) => (
            <FaqItem key={faq.q} faq={faq} />
          ))}
        </div>
      </div>
    </div>
  );
}
