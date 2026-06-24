import { create } from "zustand";
import { supabase } from "../db/supabase";
import { type User } from "../db/index";


// ── API helpers ───────────────────────────────────────────────────────────────
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api";

/** Returns a Bearer-token header using the current user's fresh access token. */
async function authHeaders(): Promise<HeadersInit> {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  if (!token) throw new Error("Not authenticated");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

/** Helper to handle API responses safely without SyntaxError or double read issues. */
async function handleResponse(res: Response, defaultMessage: string): Promise<any> {
  const text = await res.text();
  let json: any;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`${defaultMessage}: ${res.status} ${res.statusText || text || ""}`);
  }
  if (!res.ok) {
    throw new Error(json.error ?? `${defaultMessage} (${res.status})`);
  }
  return json;
}

/**
 * POST /api/auth/profile — create or fetch the PostgreSQL user document.
 * Called right after any sign-in / registration flow.
 */
async function fetchOrCreateProfile(opts?: {
  username?: string;
  displayName?: string;
  avatar?: string;
}): Promise<User> {
  const headers = await authHeaders();
  const res = await fetch(`${API_BASE}/auth/profile`, {
    method: "POST",
    headers,
    body: JSON.stringify(opts ?? {}),
  });
  const { profile } = await handleResponse(res, "Profile fetch failed");
  return mapApiProfile(profile);
}

/** GET /api/users/me — refresh the user's profile from the server. */
async function fetchMyProfile(): Promise<User> {
  const headers = await authHeaders();
  const res = await fetch(`${API_BASE}/users/me`, { headers });
  const { profile } = await handleResponse(res, "Profile fetch failed");
  return mapApiProfile(profile);
}

/** PATCH /api/users/me — update profile fields. */
async function patchMyProfile(
  fields: Partial<Pick<User, "displayName" | "bio" | "website" | "location" | "avatar">>
): Promise<User> {
  const headers = await authHeaders();
  const res = await fetch(`${API_BASE}/users/me`, {
    method: "PATCH",
    headers,
    body: JSON.stringify(fields),
  });
  const { profile } = await handleResponse(res, "Profile update failed");
  return mapApiProfile(profile);
}

// ── Profile mapper ────────────────────────────────────────────────────────────
/**
 * Normalize the raw API response (Postgres profiles row) into the app's User type.
 * Handles Postgres Timestamps.
 */
function mapApiProfile(profile: any): User {
  let createdAt = Date.now();
  if (profile?.created_at) {
    createdAt = Date.parse(profile.created_at) || Date.now();
  } else if (profile?.createdAt) {
    createdAt = typeof profile.createdAt === "number" ? profile.createdAt : Date.parse(profile.createdAt) || Date.now();
  }
  return {
    id: profile.id,
    username: profile.username ?? "",
    email: profile.email ?? "",
    avatar: profile.avatar ?? "",
    displayName: profile.display_name ?? profile.displayName ?? "",
    bio: profile.bio ?? "",
    website: profile.website ?? "",
    location: profile.location ?? "",
    createdAt,
    subscriptionStatus: profile.subscription_status ?? profile.subscriptionStatus ?? null,
    subscriptionPlan: profile.subscription_plan ?? profile.subscriptionPlan ?? null,
    subscriptionId: profile.subscription_id ?? profile.subscriptionId ?? null,
    aiCredits: profile.ai_credits !== undefined ? profile.ai_credits : (profile.aiCredits !== undefined ? profile.aiCredits : undefined),
  };
}

// ── Store ─────────────────────────────────────────────────────────────────────
interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
  isRegistering: boolean;
  isRecoveringPassword: boolean;
  updateRecoveredPassword: (password: string) => Promise<boolean>;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  init: () => Promise<void>;
  clearError: () => void;
  updateProfile: (
    partial: Partial<Pick<User, "displayName" | "bio" | "website" | "location" | "avatar" | "email">>
  ) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, _get) => ({
  user: null,
  loading: false,
  error: null,
  initialized: false,
  isRegistering: false,
  isRecoveringPassword: false,

  refreshProfile: async () => {
    try {
      const user = await fetchMyProfile();
      set({ user });
    } catch (err) {
      console.error("Error refreshing profile:", err);
    }
  },

  // 1. INIT
  init: async () => {
    // Initial session check
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      set({ loading: true });
      try {
        const user = await fetchMyProfile();
        set({ user, loading: false, initialized: true });
      } catch {
        try {
          const user = await fetchOrCreateProfile();
          set({ user, loading: false, initialized: true });
        } catch (err: any) {
          console.error("Error loading user profile:", err);
          set({ loading: false, initialized: true });
        }
      }
    } else {
      set({ user: null, loading: false, initialized: true });
    }

    // Subscribe to auth state changes
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (useAuthStore.getState().isRegistering) {
        return;
      }
      if (event === "PASSWORD_RECOVERY") {
        set({ isRecoveringPassword: true, loading: true });
        if (typeof window !== "undefined") {
          window.location.href = "/reset-password";
        }
        try {
          const user = await fetchMyProfile();
          set({ user, loading: false });
        } catch {
          try {
            const user = await fetchOrCreateProfile();
            set({ user, loading: false });
          } catch (err: any) {
            console.error("Error loading user profile on password recovery:", err);
            set({ loading: false });
          }
        }
        return;
      }
      if ((event === "SIGNED_IN" || event === "TOKEN_REFRESHED") && session?.user) {
        set({ loading: true });
        try {
          const user = await fetchMyProfile();
          set({ user, loading: false });
        } catch {
          try {
            const user = await fetchOrCreateProfile();
            set({ user, loading: false });
          } catch (err: any) {
            console.error("Error loading user profile on auth state change:", err);
            set({ loading: false });
          }
        }
      } else if (event === "SIGNED_OUT") {
        set({ user: null, loading: false, isRecoveringPassword: false });
      }
    });
  },

  // 2. LOGIN
  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (e: any) {
      set({ error: e.message, loading: false });
    }
  },

  // 3. REGISTER
  register: async (username, email, password) => {
    set({ loading: true, error: null, isRegistering: true });
    try {
      localStorage.setItem("just_registered", "true");
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            displayName: username,
          },
        },
      });
      if (error) throw error;

      if (data.session) {
        await fetchOrCreateProfile({ username, displayName: username });
        await supabase.auth.signOut();
      }
      
      set({ user: null, loading: false });
      return true;
    } catch (e: any) {
      set({ error: e.message, loading: false });
      return false;
    } finally {
      setTimeout(() => {
        set({ isRegistering: false });
        localStorage.removeItem("just_registered");
      }, 1000);
    }
  },

  // 4. LOGOUT
  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null });
  },

  clearError: () => set({ error: null }),

  // 5. UPDATE PROFILE
  updateProfile: async (partial) => {
    set({ loading: true, error: null });
    try {
      const authUpdates: any = {};
      if (partial.displayName !== undefined) authUpdates.displayName = partial.displayName;
      if (partial.avatar !== undefined && (partial.avatar.startsWith("http://") || partial.avatar.startsWith("https://"))) {
        authUpdates.avatar = partial.avatar;
      }

      if (Object.keys(authUpdates).length > 0) {
        const { error } = await supabase.auth.updateUser({
          data: authUpdates,
        });
        if (error) throw error;
      }

      const { email: _email, ...patchable } = partial;
      let user = useAuthStore.getState().user;
      if (Object.keys(patchable).length > 0) {
        user = await patchMyProfile(patchable);
      }
      set({ user, loading: false });
    } catch (e: any) {
      set({ error: e.message, loading: false });
    }
  },

  // 6. CHANGE PASSWORD
  changePassword: async (currentPassword, newPassword) => {
    set({ loading: true, error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !user.email) throw new Error("Not authenticated");

      // Verify the current password by signing in in the background
      const { error: reauthError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });
      if (reauthError) throw new Error("Incorrect current password");

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (updateError) throw updateError;

      set({ loading: false });
    } catch (e: any) {
      set({ error: e.message, loading: false });
    }
  },

  // 7. GOOGLE SIGN IN
  signInWithGoogle: async () => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (e: any) {
      set({ error: e.message, loading: false });
    }
  },

  // 8. RESET PASSWORD
  resetPassword: async (email) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      set({ loading: false });
    } catch (e: any) {
      console.warn("Direct Supabase resetPasswordForEmail failed or timed out. Attempting backend recovery-link fallback...", e);
      try {
        const res = await fetch(`${API_BASE}/auth/recovery-link`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        });

        const data = await handleResponse(res, "Fallback recovery failed");
        if (data.link) {
          set({
            error: `Email service timed out (SMTP issue), but here is your recovery link (Dev Mode): ${data.link}`,
            loading: false,
          });
        } else {
          set({ loading: false });
        }
      } catch (fallbackErr: any) {
        console.error("Fallback recovery also failed:", fallbackErr);
        let msg = e.message || "An error occurred";
        if (
          msg.includes("504") ||
          msg.toLowerCase().includes("gateway timeout") ||
          e.status === 504 ||
          String(fallbackErr.message).includes("504")
        ) {
          msg = "The email service timed out (504 Gateway Timeout). This usually indicates that the Supabase SMTP/email provider is misconfigured or rate-limited. Please check your Supabase project settings.";
        }
        set({ error: msg, loading: false });
      }
    }
  },

  // 9. UPDATE RECOVERED PASSWORD
  updateRecoveredPassword: async (newPassword) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;
      set({ loading: false });
      return true;
    } catch (e: any) {
      set({ error: e.message, loading: false });
      return false;
    }
  },
}));