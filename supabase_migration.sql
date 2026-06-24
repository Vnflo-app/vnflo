-- ============================================================================
-- Visual Node Flow — Full Database Setup
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ============================================================================

-- 1. PROFILES TABLE
-- Stores user profile data, subscription info, and AI credits.
-- The `id` column references Supabase Auth's `auth.users.id`.
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT NOT NULL DEFAULT '',
  username      TEXT NOT NULL DEFAULT '',
  display_name  TEXT NOT NULL DEFAULT '',
  avatar        TEXT NOT NULL DEFAULT '',
  bio           TEXT NOT NULL DEFAULT '',
  website       TEXT NOT NULL DEFAULT '',
  location      TEXT NOT NULL DEFAULT '',

  -- Subscription fields (Razorpay)
  subscription_status  TEXT DEFAULT NULL,          -- 'active', 'trialing', 'canceled', or NULL
  subscription_plan    TEXT DEFAULT NULL,          -- 'pro_monthly', 'pro_annual', or NULL
  subscription_id      TEXT DEFAULT NULL,          -- Razorpay subscription ID
  pending_subscription_id TEXT DEFAULT NULL,       -- Razorpay subscription ID (pending verification)
  pending_plan_type    TEXT DEFAULT NULL,          -- 'monthly' or 'annual' (pending verification)

  -- AI credits
  ai_credits    INTEGER DEFAULT 0,

  -- Timestamps
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast username lookups
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles (username);


-- 2. DIAGRAMS TABLE
-- Stores user-created diagrams with nodes, edges, viewport, and thumbnail.
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.diagrams (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL DEFAULT 'Untitled Diagram',
  owner_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  nodes       JSONB NOT NULL DEFAULT '[]'::JSONB,
  edges       JSONB NOT NULL DEFAULT '[]'::JSONB,
  viewport    JSONB NOT NULL DEFAULT '{"x": 0, "y": 0, "zoom": 1}'::JSONB,
  thumbnail   TEXT DEFAULT NULL,

  -- Timestamps
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast owner lookups (dashboard loads user's diagrams)
CREATE INDEX IF NOT EXISTS idx_diagrams_owner_id ON public.diagrams (owner_id);


-- 3. SETTINGS TABLE
-- Key-value store for app-level settings (e.g. cached Razorpay plan IDs).
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.settings (
  key         TEXT PRIMARY KEY,
  value       JSONB NOT NULL DEFAULT '{}'::JSONB,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================================
-- 4. AUTO-CREATE PROFILE ON SIGN-UP (Trigger)
-- Automatically creates a profiles row whenever a new user signs up via
-- Supabase Auth (email/password or OAuth). This prevents the "profile not
-- found" error on first login.
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username, display_name, avatar)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data ->> 'username', SPLIT_PART(COALESCE(NEW.email, ''), '@', 1), ''),
    COALESCE(
      NEW.raw_user_meta_data ->> 'displayName',
      NEW.raw_user_meta_data ->> 'full_name',
      NEW.raw_user_meta_data ->> 'name',
      SPLIT_PART(COALESCE(NEW.email, ''), '@', 1),
      ''
    ),
    COALESCE(NEW.raw_user_meta_data ->> 'avatar_url', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Drop the trigger if it already exists, then re-create it
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();


-- ============================================================================
-- 5. ROW LEVEL SECURITY (RLS)
-- Ensures users can only access their own data via the client-side
-- Supabase client (which uses the anon key). Server-side API routes use
-- the service_role key which bypasses RLS.
-- ============================================================================

-- Profiles: users can read/update only their own profile
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Diagrams: users can CRUD only their own diagrams
ALTER TABLE public.diagrams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own diagrams"
  ON public.diagrams FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert their own diagrams"
  ON public.diagrams FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own diagrams"
  ON public.diagrams FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own diagrams"
  ON public.diagrams FOR DELETE
  USING (auth.uid() = owner_id);

-- Allow public read for diagram count on the hero section
CREATE POLICY "Anyone can count diagrams"
  ON public.diagrams FOR SELECT
  USING (true);

-- Settings: read-only for authenticated users (admin writes via service role)
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read settings"
  ON public.settings FOR SELECT
  TO authenticated
  USING (true);
