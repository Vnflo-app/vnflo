# Visual Node Flow (vnflo)

Visual Node Flow (vnflo) is a premium, real-time collaborative diagramming application built with **Next.js 15 (App Router)**, **React 19**, and **Tailwind CSS v4**. It allows users to build stunning flowcharts, mind maps, organizational charts, and entity-relationship diagrams in seconds using an interactive canvas, a custom-built text-based DSL editor, or natural language AI prompts.

---

## 🚀 Key Features

*   **Interactive Visual Canvas**: Drag, drop, group, scale, and connect nodes in a fluid interface powered by `@xyflow/react`.
*   **Dynamic Container Frames**: Group related diagram scopes inside parent frame nodes. Each frame supports three visualization modes:
    *   **Diagram View**: Interactive canvas editing.
    *   **AI Chat**: Instruct the AI assistant to perform edits restricted to the frame's scope.
    *   **Code Editor**: Code the diagram structure using a custom DSL, compiling changes instantly back onto the canvas.
*   **Dual DSL Compiler**: Supports custom DSL parsing and compilation for both standard flowcharts and Entity-Relationship Diagrams (ERDs).
*   **Real-time Collaboration**: Synchronize diagram edits and user cursors across peers in real time using P2P **WebRTC data channels**.
*   **AI Diagram Assistant**: Prompt-based full-canvas diagram creation, styling adjustments, and layout generation.
*   **Automatic Elk Layouts**: Instant structural organization and line alignments powered by the `elkjs` layout solver.
*   **Multiple Export Filters**: Export workspace contents to PNG, SVG vectors, raw HTML codes, Markdown schemas, or shareable link URLs.
*   **Dynamic Theme Engine**: Six tailored themes (`light`, `dark`, `midnight`, `ocean`, `forest`, `sunset`) featuring instant hydration-flash blocking.
*   **Pro Subscriptions**: Fully integrated monthly/annual plan upgrades, credit calculations, and signature verification powered by **Razorpay** and **Supabase**.

---

## 🛠️ Technology Stack & Libraries

### Frontend Core
*   **Next.js 15 (App Router)** & **React 19** - Application architecture and server-side rendering support.
*   **Zustand** - Light, reactive global store management (`auth`, `diagram`, `editor`, `aiChat`).
*   **Tailwind CSS v4** & **PostCSS** - Fluid utility styling, modern CSS custom properties, and customizable theme classes.
*   **Framer Motion (`motion/react`)** - Smooth animations, tab transitions, and sidebar drawer slides.
*   **Lucide React** - Vector iconography system.

### Diagram Canvas & Layouts
*   **`@xyflow/react`** - Interactive node-based canvas, custom handle attachments, and drag-and-drop connections.
*   **`elkjs`** - High-performance graph layouts to calculate coordinates and align nodes automatically.

### Database, Auth & Real-Time
*   **Supabase Client & Admin SDK** - PostgreSQL backend, OAuth authentication (Google Sign-In), session management, and Row Level Security (RLS) policies.
*   **IndexedDB (`idb`)** - Client-side metadata caching and configurations.
*   **Simple-Peer / WebRTC** - Low-latency peer-to-peer data syncing.

### Subscriptions & Payments
*   **`razorpay`** - Secure subscription transaction orders, invoice creation, and server webhook validations.

### Utilities
*   **`html-to-image`** & **`jspdf`** - Canvas extraction and formatting for PNG/SVG and PDF files.
*   **`react-hook-form`** - Form validations (login, settings, profile updates).
*   **`canvas-confetti`** - Micro-animations on billing completions.

---

## ⚙️ Environment Variables Setup

Before running the application, copy the example environment file:

```bash
cp .env.example .env.local
```

Fill in the appropriate configuration keys inside `.env.local`:

```env
# Next.js Public Client Environment Variables
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_public_key

# Server-Side Private Environment Variables
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
ALLOWED_ORIGIN=*
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
OPENROUTER_API_KEY=your_openrouter_api_key
```

---

## 🗄️ Database Setup (Supabase)

Initialize the Supabase database by applying the schema:

1.  Go to your **Supabase Dashboard** -> **SQL Editor**.
2.  Click **New Query**.
3.  Copy and paste the entire SQL contents from the [supabase_migration.sql](file:///c:/Users/oken/Desktop/oken/vnflo/supabase_migration.sql) file.
4.  Click **Run** to set up:
    *   `profiles`, `diagrams`, and `settings` tables.
    *   Automatic profile generation trigger for new signups.
    *   Row-Level Security (RLS) policies.

---

## 💻 Getting Started

To run the application locally:

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](file:///c:/Users/oken/Desktop/oken/vnflo/LICENSE) file for details.
