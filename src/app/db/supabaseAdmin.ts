import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder";

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn("⚠️ Missing Supabase server-side environment variables (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)!");
}

// Service role client bypasses RLS policies and handles admin updates (like updating subscriptions/credits)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
