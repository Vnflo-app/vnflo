"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../stores/authStore";

/**
 * /auth/callback
 *
 * Supabase OAuth (implicit flow) redirects here with tokens in the URL hash
 * fragment (#access_token=...&refresh_token=...). The Supabase JS client
 * (imported transitively via authStore) automatically detects these and
 * fires an onAuthStateChange → SIGNED_IN event, which the authStore handles
 * by fetching/creating the user profile.
 *
 * This page waits until the authStore has a `user` set (i.e. the full
 * sign-in + profile-fetch pipeline has completed), then redirects to the
 * dashboard.
 */
export default function AuthCallbackPage() {
  const router = useRouter();
  const hasRedirected = useRef(false);
  const { user, initialized, loading } = useAuthStore();

  useEffect(() => {
    if (hasRedirected.current) return;

    // Wait until the auth store is done loading.
    if (!initialized || loading) return;

    hasRedirected.current = true;

    if (user) {
      router.replace("/dashboard");
    } else {
      // Session token was present but profile fetch failed — send to login.
      router.replace("/auth");
    }
  }, [user, initialized, loading, router]);

  // Safety-net timeout — if nothing resolves in 8 s, bail to login.
  useEffect(() => {
    const t = setTimeout(() => {
      if (!hasRedirected.current) {
        hasRedirected.current = true;
        router.replace("/auth");
      }
    }, 8000);
    return () => clearTimeout(t);
  }, [router]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0a0a0a",
        color: "#fff",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            width: 32,
            height: 32,
            border: "3px solid rgba(255,255,255,0.15)",
            borderTopColor: "#fff",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
            margin: "0 auto 16px",
          }}
        />
        <p style={{ fontSize: 14, opacity: 0.7 }}>Signing you in…</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}
