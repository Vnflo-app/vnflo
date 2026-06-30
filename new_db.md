# vnflo Database Schema Migration & Implementation Plan

## 🎯 Objective
Migrate vnflo from a bloated, row-based node/edge storage system to a highly optimized, Yjs-compatible binary storage system (`BYTEA`). This reduces database size by ~70%, enables true real-time collaboration, and keeps us strictly within the Supabase Free Tier limits.

---

## DB NEW SCHEMA
-- ==========================================
-- 1. ENUMS & EXTENSIONS
-- ==========================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- pgcrypto is needed for gen_random_uuid() in newer Postgres versions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Keep plans as an enum to prevent typos and save space
DROP TYPE IF EXISTS user_plan CASCADE;
CREATE TYPE user_plan AS ENUM ('free', 'pro', 'team', 'enterprise');

DROP TYPE IF EXISTS member_role CASCADE;
CREATE TYPE member_role AS ENUM ('owner', 'admin', 'editor', 'viewer');

-- ==========================================
-- 2. PROFILES (Extends Supabase Auth)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    avatar_url TEXT,
    plan user_plan DEFAULT 'free' NOT NULL,
    ai_credits INTEGER DEFAULT 5 NOT NULL, -- Hard limit for free tier
    razorpay_customer_id TEXT,
    stripe_customer_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Auto-create profile on signup (You already have this, but ensure it's robust)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, avatar_url)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==========================================
-- 3. WORKSPACES (The B2B Money Maker)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.workspaces (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL, -- For URLs: vnflo.com/w/my-team
    owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    plan user_plan DEFAULT 'team' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.workspace_members (
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    role member_role DEFAULT 'editor' NOT NULL,
    joined_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    PRIMARY KEY (workspace_id, user_id)
);

-- ==========================================
-- 4. DIAGRAMS (The Core - Optimized for Yjs)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.diagrams (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE, -- NULL if personal
    owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,

    title TEXT DEFAULT 'Untitled' NOT NULL,
    description TEXT,

    -- CRITICAL: Do NOT store nodes/edges as rows.
    -- Store the Yjs CRDT state as a binary byte array.
    -- It's 10x smaller than JSONB and required for Yjs.
    yjs_state BYTEA,

    -- Store lightweight metadata (viewport position, grid settings, theme) as JSONB
    metadata JSONB DEFAULT '{"viewport": {"x": 0, "y": 0, "zoom": 1}}'::jsonb,

    -- NEVER store the actual thumbnail image in the DB.
    -- Store the Supabase Storage URL here.
    thumbnail_url TEXT,

    is_public BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for fast querying
CREATE INDEX IF NOT EXISTS idx_diagrams_owner ON public.diagrams(owner_id);
CREATE INDEX IF NOT EXISTS idx_diagrams_workspace ON public.diagrams(workspace_id);
CREATE INDEX IF NOT EXISTS idx_diagrams_updated ON public.diagrams(updated_at DESC);
-- GIN index if you ever need to query inside the JSONB metadata
CREATE INDEX IF NOT EXISTS idx_diagrams_metadata ON public.diagrams USING GIN (metadata);

-- ==========================================
-- 5. AI USAGE LOGS (Cost Control)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.ai_usage_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    prompt_hash TEXT NOT NULL, -- Hash the prompt to prevent storing PII/abuse
    tokens_used INTEGER NOT NULL,
    cost_usd NUMERIC(10, 6) NOT NULL, -- Track exact cost to the cent
    model_used TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_ai_logs_user ON public.ai_usage_logs(user_id, created_at DESC);

-- ==========================================
-- 6. PAYMENTS (Transaction History)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    razorpay_payment_id TEXT,
    razorpay_subscription_id TEXT,
    razorpay_signature TEXT,
    amount INTEGER NOT NULL,              -- Amount in smallest currency unit (paise for INR)
    currency TEXT DEFAULT 'INR' NOT NULL,
    plan_type TEXT NOT NULL,              -- 'monthly' or 'annual'
    status TEXT DEFAULT 'success' NOT NULL, -- 'success', 'failed', 'refunded'
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_payments_user ON public.payments(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_razorpay ON public.payments(razorpay_payment_id);

-- ==========================================
-- 6. AUTO-UPDATE TIMESTAMPS
-- ==========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_diagrams_updated_at ON public.diagrams;
CREATE TRIGGER update_diagrams_updated_at BEFORE UPDATE ON public.diagrams FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_payments_updated_at ON public.payments;
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

---

---
## db RLS Policy
-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagrams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- PAYMENTS: Users can only view their own payment history
CREATE POLICY "Users can view own payments" ON public.payments FOR SELECT USING (auth.uid() = user_id);

-- PROFILES: Users can only view/update their own profile
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- WORKSPACES: Members can view, Owners/Admins can update
CREATE POLICY "Members can view workspace" ON public.workspaces FOR SELECT 
    USING (id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()));
CREATE POLICY "Owners/Admins can update workspace" ON public.workspaces FOR UPDATE 
    USING (id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin')));

-- DIAGRAMS: The complex one. 
-- 1. Owner can always access.
-- 2. Workspace members can access if it belongs to their workspace.
-- 3. Anyone can access if is_public = true.
CREATE POLICY "Diagrams select policy" ON public.diagrams FOR SELECT USING (
    owner_id = auth.uid() 
    OR workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid())
    OR is_public = true
);

CREATE POLICY "Diagrams insert policy" ON public.diagrams FOR INSERT WITH CHECK (
    owner_id = auth.uid()
);

CREATE POLICY "Diagrams update policy" ON public.diagrams FOR UPDATE USING (
    owner_id = auth.uid() 
    OR workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'editor'))
);

CREATE POLICY "Diagrams delete policy" ON public.diagrams FOR DELETE USING (
    owner_id = auth.uid() 
    OR workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid() AND role = 'owner')
);
---

## 🗓️ Phase 2: Backend & Type Definitions

### 2.1 Update Database Types
**File to change:** `src/app/db/index.ts` (or wherever your DB types are defined)

**Changes:**
- Remove old `Node` and `Edge` array types from the `Diagram` interface.
- Add `yjs_state` (as `string` for base64/JSON transport, or `Uint8Array` if using Supabase client directly).
- Add `Workspace` and `WorkspaceMember` types.

```typescript
// src/app/db/types.ts (New file or update existing)
export type UserPlan = 'free' | 'pro' | 'team' | 'enterprise';
export type MemberRole = 'owner' | 'admin' | 'editor' | 'viewer';

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  plan: UserPlan;
  ai_credits: number;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
  plan: UserPlan;
}

export interface Diagram {
  id: string;
  workspace_id: string | null;
  owner_id: string;
  title: string;
  description: string | null;
  // Base64 string for API transport, converted to Uint8Array in the editor
  yjs_state: string | null; 
  metadata: {
    viewport: { x: number; y: number; zoom: number };
    theme?: string;
  };
  thumbnail_url: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}
```

### 2.2 Update API Routes
**Files to change:** 
- `src/app/api/diagrams/route.ts` (or equivalent GET/POST route)
- `src/app/api/diagrams/[id]/route.ts`

**Changes:**
- **GET /diagrams (Dashboard list):** ONLY select `id, title, thumbnail_url, metadata, updated_at`. **NEVER select `yjs_state` here.** This keeps the dashboard lightning fast.
- **GET /diagrams/[id] (Editor load):** Select all fields, including `yjs_state`.
- **PUT /diagrams/[id] (Editor save):** Accept `yjs_state` (base64 encoded string from frontend) and `metadata`. Update `updated_at`.

```typescript
// Example: src/app/api/diagrams/[id]/route.ts (PUT handler)
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const { yjs_state_base64, metadata, title } = body;

  // Convert base64 back to Uint8Array for Supabase BYTEA column
  const binaryString = atob(yjs_state_base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);

  const { error } = await supabaseAdmin
    .from('diagrams')
    .update({ 
      yjs_state: bytes, 
      metadata, 
      title,
      updated_at: new Date().toISOString() 
    })
    .eq('id', params.id);

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ success: true });
}
```

### 2.3 Implement AI Cost Tracking
**File to change:** `src/app/api/ai/generate/route.ts`

**Changes:**
- After a successful OpenRouter API call, insert a row into `ai_usage_logs`.
- Deduct `ai_credits` from the user's `profiles` row.

```typescript
// Inside the AI generation success block:
await supabaseAdmin.from('ai_usage_logs').insert({
  user_id: user.id,
  prompt_hash: crypto.createHash('sha256').update(prompt).digest('hex'),
  tokens_used: response.usage.total_tokens,
  cost_usd: calculateCost(response.usage),
  model_used: 'openrouter/auto'
});

await supabaseAdmin.rpc('decrement_ai_credits', { user_id: user.id, amount: 1 });
```
*(Note: Create a simple Postgres function `decrement_ai_credits` to handle the atomic deduction safely).*

---

## 🗓️ Phase 3: Frontend State Management (Zustand)

### 3.1 Refactor Diagram Store
**File to change:** `src/app/stores/diagramStore.ts`

**Changes:**
- Remove `nodes` and `edges` from the initial state payload.
- Add `yjsState: Uint8Array | null`.
- Add `metadata` state.

```typescript
// src/app/stores/diagramStore.ts
interface DiagramState {
  currentDiagram: {
    id: string;
    title: string;
    yjsState: Uint8Array | null; // The heavy binary data
    metadata: { viewport: { x: number; y: number; zoom: number } };
  } | null;
  
  // Actions
  fetchDiagramMetadata: (id: string) => Promise<void>; // For dashboard
  fetchDiagramFull: (id: string) => Promise<void>;     // For editor
  saveDiagram: () => Promise<void>;
}
```

---

## 🗓️ Phase 4: Editor & Yjs Integration (The Critical Path)

This is where the magic happens. We replace the old WebRTC/ReactFlow state sync with Yjs.

### 4.1 Initialize Yjs in the Editor
**File to change:** `src/app/editor/EditorContent.tsx` (or `DiagramEditor.tsx`)

**Changes:**
- Import `yjs`, `y-websocket` (or `y-supabase` if using a Supabase realtime adapter).
- Initialize the `Y.Doc` when the component mounts.
- Apply the `yjsState` fetched from the database.

```typescript
// src/app/editor/EditorContent.tsx
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket'; // Or your chosen provider

export default function EditorContent({ diagramId }) {
  const { currentDiagram } = useDiagramStore();
  const [ydoc] = useState(() => new Y.Doc());
  
  useEffect(() => {
    if (currentDiagram?.yjsState) {
      // Apply the saved state from the database
      Y.applyUpdate(ydoc, currentDiagram.yjsState);
    }

    // Connect to realtime provider (using a free tier compatible setup)
    // Note: For $0 budget, you might use Supabase Realtime channels 
    // instead of a dedicated y-websocket server.
    
    return () => {
      ydoc.destroy();
    };
  }, [currentDiagram]);

  // Pass ydoc to your custom hooks and ReactFlow
  return <Canvas ydoc={ydoc} />;
}
```

### 4.2 Bind Yjs to ReactFlow
**File to change:** Create `src/app/editor/hooks/useYjsBinding.ts`

**Changes:**
- Create a custom hook that listens to `ydoc.getArray('nodes')` and `ydoc.getArray('edges')`.
- When Yjs changes, update ReactFlow state.
- When ReactFlow changes (drag, drop), update Yjs.

```typescript
// src/app/editor/hooks/useYjsBinding.ts
export function useYjsBinding(ydoc: Y.Doc) {
  const { setNodes, setEdges } = useReactFlow(); // or your custom store
  
  useEffect(() => {
    const yNodes = ydoc.getArray('nodes');
    const yEdges = ydoc.getArray('edges');

    const observer = () => {
      // Convert Yjs arrays back to ReactFlow format
      const rfNodes = yNodes.toArray().map(item => item.toJSON());
      const rfEdges = yEdges.toArray().map(item => item.toJSON());
      
      setNodes(rfNodes);
      setEdges(rfEdges);
    };

    yNodes.observe(observer);
    yEdges.observe(observer);
    
    // Initial load
    observer();

    return () => {
      yNodes.unobserve(observer);
      yEdges.unobserve(observer);
    };
  }, [ydoc]);
}
```

### 4.3 Auto-Save the Yjs State
**File to change:** `src/app/editor/hooks/useAutoSave.ts` (or create it)

**Changes:**
- Listen to the `ydoc` `update` event.
- Debounce the save function (e.g., save every 3 seconds after the last change).
- Convert the Yjs state to a base64 string and send it to the API.

```typescript
// src/app/editor/hooks/useAutoSave.ts
export function useAutoSave(ydoc: Y.Doc, diagramId: string) {
  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const handleUpdate = () => {
      clearTimeout(timeout);
      timeout = setTimeout(async () => {
        // Get the full state as a binary Uint8Array
        const state = Y.encodeStateAsUpdate(ydoc);
        
        // Convert to base64 for JSON transport to our API
        const base64 = btoa(String.fromCharCode(...new Uint8Array(state)));

        await fetch(`/api/diagrams/${diagramId}`, {
          method: 'PUT',
          body: JSON.stringify({ yjs_state_base64: base64, metadata: getMetadata() }),
        });
      }, 3000); // 3 second debounce
    };

    ydoc.on('update', handleUpdate);
    return () => {
      ydoc.off('update', handleUpdate);
      clearTimeout(timeout);
    };
  }, [ydoc, diagramId]);
}
```

### 4.4 Delete the Old WebRTC Code
**Files to delete or completely rewrite:**
- `src/app/editor/hooks/useWebRTC.ts` -> **DELETE**.
- `src/app/editor/components/WebRTCModal.tsx` -> **DELETE** (Replace with a simple "Share Link" modal).
- `src/app/editor/components/LiveCursorsOverlay.tsx` -> **UPDATE** to read from Yjs Awareness protocol instead of WebRTC data channels.

---

## 🗓️ Phase 5: Dashboard & UI Updates

### 5.1 Optimize Dashboard Fetching
**File to change:** `src/app/dashboard/DashboardPage.tsx`

**Changes:**
- Ensure the Supabase query explicitly selects only the lightweight columns.

```typescript
// src/app/dashboard/DashboardPage.tsx
const { data: diagrams } = await supabase
  .from('diagrams')
  .select('id, title, thumbnail_url, metadata, updated_at, is_public')
  .eq('owner_id', user.id)
  .order('updated_at', { ascending: false });
```

### 5.2 Update Thumbnail Generation
**File to change:** `src/app/editor/hooks/useExportDiagram.ts` (or similar)

**Changes:**
- When a user saves or exports, generate the PNG client-side.
- Upload the PNG to **Supabase Storage** (Free tier: 1GB).
- Save the public URL in the `thumbnail_url` column of the `diagrams` table.
- *Never* store the base64 image string in the database.

---

## ✅ Final Checklist for Launch

- [ ] Run SQL migration in Supabase.
- [ ] Update `src/app/db/types.ts`.
- [ ] Update API routes to handle `BYTEA` (base64 conversion).
- [ ] Update `diagramStore.ts` to remove old node/edge arrays.
- [ ] Implement Yjs initialization in `EditorContent.tsx`.
- [ ] Implement `useYjsBinding` to connect Yjs to ReactFlow.
- [ ] Implement `useAutoSave` to push binary state to DB.
- [ ] Delete old WebRTC files.
- [ ] Update Dashboard to only fetch metadata (no `yjs_state`).
- [ ] Test with a diagram containing 500+ nodes to ensure no lag.
- [ ] Verify RLS policies block unauthorized access.