# Visual Node Flow (vnflo) Project Documentation

This documentation provides a comprehensive overview of the **Visual Node Flow (vnflo)** application codebase. It outlines the project's architecture, folder structure, styling system, state management, database schema, and the detailed purpose of every source file.

---

## Table of Contents
1. [High-Level Architecture](#high-level-architecture)
2. [Project Root & Configuration Files](#project-root--configuration-files)
3. [Database & Backend Operations](#database--backend-operations)
4. [Global Styles & Styling System](#global-styles--styling-system)
5. [Application Routing (`src/app/`)](#application-routing-srcapp)
6. [Zustand Global Stores (`src/app/stores/`)](#zustand-global-stores-srcappstores)
7. [The Diagram Editor Component (`src/app/editor/`)](#the-diagram-editor-component-srcappeditor)
   - [Editor Core](#editor-core)
   - [Editor Components](#editor-components)
   - [Editor Nodes](#editor-nodes)
   - [Editor Panels](#editor-panels)
   - [Editor Utilities & Templates](#editor-utilities--templates)
   - [Custom React Hooks](#custom-react-hooks)
8. [API Endpoints (`src/app/api/`)](#api-endpoints-srcappapi)

---

## High-Level Architecture

Visual Node Flow is a modern collaborative diagramming application built with **Next.js 15 (App Router)**, **React 19**, **Zustand**, and **Tailwind CSS v4**. It features interactive flowcharting, mind mapping, and ER diagramming.

```
┌────────────────────────────────────────────────────────┐
│                      Client Browser                    │
│  ┌─────────────────────────┐  ┌─────────────────────┐  │
│  │   xyflow React Canvas   │  │   Zustand Stores    │  │
│  │   (Flowchart & ERD)     │◄─┤ (diagram, editor,   │  │
│  └────────────┬────────────┘  │  auth, aiChat)      │  │
│               │               └──────────▲──────────┘  │
│               │ WebRTC Peer Sync         │             │
│               ▼                          │ REST API    │
│  ┌─────────────────────────┐             │             │
│  │   WebRTC Data Channels  │             │             │
│  └─────────────────────────┘             │             │
└──────────────────────────────────────────┼─────────────┘
                                           │
                                           ▼
┌────────────────────────────────────────────────────────┐
│                       Cloud & API                      │
│        ┌──────────────────────────────────────┐        │
│        │          Next.js Route APIs          │        │
│        │  (Auth, AI, Users, Subscriptions)   │        │
│        └────┬────────────────────────────┬────┘        │
│             │                            │             │
│             ▼ Supabase client            ▼ SDK Calls   │
│        ┌──────────┐                ┌──────────┐        │
│        │ Supabase │                │ Razorpay │        │
│        │ Database │                │ Gateway  │        │
│        └──────────┘                └──────────┘        │
└────────────────────────────────────────────────────────┘
```

The application relies on:
1. **`xyflow` (@xyflow/react)**: Powering the visual canvas, nodes, edges, connections, and interactive navigation.
2. **Supabase**: Managing client-side authentication, user sessions, and hosting the backend database.
3. **Razorpay**: Direct integration for handling Pro subscriptions, monthly/annual upgrades, and payment verification.
4. **OpenRouter AI / OpenAI**: Translating user descriptions into diagrams via structural JSON outputs.
5. **WebRTC**: Direct peer-to-peer data channels that allow real-time collaborative workspace editing.
6. **IndexedDB (`idb`)**: Local client caching for application-level state and API settings.

---

## Project Root & Configuration Files

These configuration files define compile-time rules, runtime environment settings, and project dependencies.

*   **[package.json](file:///c:/Users/oken/Desktop/oken/vnflo/package.json)**: Declares application metadata and npm packages. Key dependencies include `@xyflow/react` (canvas), `@supabase/supabase-js`, `zustand` (state), `razorpay` (payments), `elkjs` (layout automation), `jspdf` / `html-to-image` (export utilities), and `motion` (animation).
*   **[next.config.ts](file:///c:/Users/oken/Desktop/oken/vnflo/next.config.ts)**: Configures Next.js compiling, enabling strict React modes and path resolutions for deployment trace roots.
*   **[tsconfig.json](file:///c:/Users/oken/Desktop/oken/vnflo/tsconfig.json)**: TypeScript compilation rules and alias paths (e.g. `@/*`).
*   **[postcss.config.mjs](file:///c:/Users/oken/Desktop/oken/vnflo/postcss.config.mjs)**: Configures Tailwind CSS processing for style compiles.
*   **[.env.local](file:///c:/Users/oken/Desktop/oken/vnflo/.env.local)**: Contains local secrets, including Supabase keys, Razorpay credential keys, and OpenRouter API tokens.
*   **[.npmrc](file:///c:/Users/oken/Desktop/oken/vnflo/.npmrc)**: Holds local package registry overrides and package-lock preferences.
*   **[.gitignore](file:///c:/Users/oken/Desktop/oken/vnflo/.gitignore)**: Specfies directory directories, logs, and sensitive `.env` files to ignore from Git commits.
*   **[README.md](file:///c:/Users/oken/Desktop/oken/vnflo/README.md)**: Standard introduction to Visual Node Flow, describing features, technology stack, and run scripts.
*   **[CONTRIBUTING.md](file:///c:/Users/oken/Desktop/oken/vnflo/CONTRIBUTING.md)**: Developer contributing workflow regulations.
*   **[LICENSE](file:///c:/Users/oken/Desktop/oken/vnflo/LICENSE)**: Holds the project license.
*   **[default_shadcn_theme.css](file:///c:/Users/oken/Desktop/oken/vnflo/default_shadcn_theme.css)**: Predefined colors and variables representing the default base for custom UI elements.

---

## Database & Backend Operations

*   **[supabase_migration.sql](file:///c:/Users/oken/Desktop/oken/vnflo/supabase_migration.sql)**: Complete SQL schema migration script for Supabase. It sets up three tables:
    1.  `profiles`: User profiles, subscription metadata, and AI billing credits.
    2.  `diagrams`: Stores canvas configurations (nodes, edges, thumbnail, viewports) mapped to owner IDs.
    3.  `settings`: Global administrator key-value config options.
    It also registers the `handle_new_user()` trigger to auto-generate a profile on new signups, and applies Row Level Security (RLS) policies.
*   **[src/app/db/supabase.ts](file:///c:/Users/oken/Desktop/oken/vnflo/src/app/db/supabase.ts)**: Configures and exports the client-side Supabase connection. Uses public environment keys.
*   **[src/app/db/supabaseAdmin.ts](file:///c:/Users/oken/Desktop/oken/vnflo/src/app/db/supabaseAdmin.ts)**: Configures and exports a server-side Supabase client instance using `SUPABASE_SERVICE_ROLE_KEY`. This client bypasses RLS and is restricted to API routes.
*   **[src/app/db/index.ts](file:///c:/Users/oken/Desktop/oken/vnflo/src/app/db/index.ts)**: Unified module defining TypeScript database types (`User`, `DiagramData`, `Setting`). Initiates a local browser IndexedDB (`Visual Node Flow-db`) using the `idb` helper library for caching settings. Exposes database helpers (`saveDiagram`, `getDiagram`, `getDiagramsByOwner`, `deleteDiagram`).

---

## Global Styles & Styling System

Located under `src/styles/`, these files implement a unified styling system based on Tailwind v4 and modern CSS variables.

*   **[src/styles/fonts.css](file:///c:/Users/oken/Desktop/oken/vnflo/src/styles/fonts.css)**: Imports and registers the project typography fonts: *Inter* and *Plus Jakarta Sans*.
*   **[src/styles/globals.css](file:///c:/Users/oken/Desktop/oken/vnflo/src/styles/globals.css)**: Standard wrapper file initiating core Tailwind utility components.
*   **[src/styles/tailwind.css](file:///c:/Users/oken/Desktop/oken/vnflo/src/styles/tailwind.css)**: Exposes compiler rules and imports required by Tailwind v4.
*   **[src/styles/theme.css](file:///c:/Users/oken/Desktop/oken/vnflo/src/styles/theme.css)**: The theme engine config. Defines color palettes, shadow styles, borders, text, and active node highlights for both **Light/Dark** states and individual sub-themes:
    *   `dark` (default dark mode)
    *   `light` (default light mode)
    *   `midnight` (vibrant purple-tinted interface)
    *   `ocean` (deep oceanic blue theme)
    *   `forest` (natural mossy green design)
    *   `sunset` (warm orange/brown gradient palette)
*   **[src/styles/index.css](file:///c:/Users/oken/Desktop/oken/vnflo/src/styles/index.css)**: Houses styling configurations for xyflow canvas modules. Overrides styling rules for grid dots, context menus, connection line vectors, selection markers, dialog boxes, and drag handlers.

---

## Application Routing (`src/app/`)

Next.js App Router entry points and layout controls.

*   **[src/app/layout.tsx](file:///c:/Users/oken/Desktop/oken/vnflo/src/app/layout.tsx)**: Root layout wrapper. Imports structural schemas (JSON-LD SEO markers). Injects a blocking inline script in `<head>` to inspect `nb-site-theme` in `localStorage` and apply theme styles immediately to avoid screen flashes during initial page loads.
*   **[src/app/providers.tsx](file:///c:/Users/oken/Desktop/oken/vnflo/src/app/providers.tsx)**: Registers React context providers, including `NextThemes` support and the `Sonner` toast alert overlay.
*   **[src/global.d.ts](file:///c:/Users/oken/Desktop/oken/vnflo/src/global.d.ts)**: Declares custom global type definitions for JavaScript libraries (e.g., Razorpay bindings on `window`).

### Authentication Routes (`src/app/auth/`)
*   **[src/app/auth/page.tsx](file:///c:/Users/oken/Desktop/oken/vnflo/src/app/auth/page.tsx)**: Simple router pointing to the primary unified login view.
*   **[src/app/auth/AuthPage.tsx](file:///c:/Users/oken/Desktop/oken/vnflo/src/app/auth/AuthPage.tsx)**: Comprehensive login interface. Coordinates account sign-up, sign-in, and OAuth credentials using Supabase Auth.
*   **[src/app/auth/ForgotPasswordPage.tsx](file:///c:/Users/oken/Desktop/oken/vnflo/src/app/auth/ForgotPasswordPage.tsx)**: Password recovery request page.
*   **[src/app/auth/ResetPasswordPage.tsx](file:///c:/Users/oken/Desktop/oken/vnflo/src/app/auth/ResetPasswordPage.tsx)**: Secure credentials reset page.
*   **[src/app/auth/callback/page.tsx](file:///c:/Users/oken/Desktop/oken/vnflo/src/app/auth/callback/page.tsx)**: Landing page to handle OAuth redirects (e.g. Google Sign-In) and authorize user sessions.

### Marketing Routes (`src/app/(marketing)/`)
*   **[src/app/(marketing)/page.tsx](file:///c:/Users/oken/Desktop/oken/vnflo/src/app/(marketing)/page.tsx)**: Unified marketing landing page.
*   **[src/app/(marketing)/layout.tsx](file:///c:/Users/oken/Desktop/oken/vnflo/src/app/(marketing)/layout.tsx)**: Marketing navigation shell.
*   Contains directories for `docs/` (documentation), `features/` (feature lists), `pricing/` (pricing lists), `privacy-policy/`, `refund-policy/`, `templates/` (landing template lists), `terms-and-conditions/`, and `use-cases/`.

### Dashboard Route (`src/app/dashboard/`)
*   **[src/app/dashboard/page.tsx](file:///c:/Users/oken/Desktop/oken/vnflo/src/app/dashboard/page.tsx)**: Entry route to load the user's dashboard.
*   **[src/app/dashboard/DashboardPage.tsx](file:///c:/Users/oken/Desktop/oken/vnflo/src/app/dashboard/DashboardPage.tsx)**: The main management panel. Allows users to:
    *   Search and browse personal diagrams.
    *   Create diagrams using templates.
    *   Manage profile details and change passwords.
    *   View Razorpay billing transactions, upgrade plans, or cancel active subscriptions.

---

## Zustand Global Stores (`src/app/stores/`)

*   **[src/app/stores/authStore.ts](file:///c:/Users/oken/Desktop/oken/vnflo/src/app/stores/authStore.ts)**: Coordinates user sessions. Interfaces with Supabase Auth, fetches profile documents, updates account information, handles passwords, and executes fallback auth recovery flows.
*   **[src/app/stores/diagramStore.ts](file:///c:/Users/oken/Desktop/oken/vnflo/src/app/stores/diagramStore.ts)**: Handles diagram operations, communicating canvas configurations with Supabase (getting, saving, updating, and deleting diagrams).
*   **[src/app/stores/editorStore.ts](file:///c:/Users/oken/Desktop/oken/vnflo/src/app/stores/editorStore.ts)**: Manages diagram editor states, including active selection tools, layout options, unsaved changes, active panels, collaboration states, and playback modes.
*   **[src/app/stores/aiChatStore.ts](file:///c:/Users/oken/Desktop/oken/vnflo/src/app/stores/aiChatStore.ts)**: Stores active messages and status flags for the AI canvas builder.

---

## The Diagram Editor Component (`src/app/editor/`)

This directory contains the core elements of the visual editing workspace.

### Editor Core
*   **[src/app/editor/[id]/page.tsx](file:///c:/Users/oken/Desktop/oken/vnflo/src/app/editor/[id]/page.tsx)**: Route page initializing the dynamic parameter lookup for diagram IDs.
*   **[src/app/editor/DiagramEditor.tsx](file:///c:/Users/oken/Desktop/oken/vnflo/src/app/editor/DiagramEditor.tsx)**: Client-side routing wrapper. Combines `EditorThemeProvider` and the `@xyflow/react` `ReactFlowProvider` around the visual editor.
*   **[src/app/editor/EditorContent.tsx](file:///c:/Users/oken/Desktop/oken/vnflo/src/app/editor/EditorContent.tsx)**: The visual editor itself. Orchestrates canvas grids, registers custom node types and templates, monitors keyboard actions, triggers autosave, coordinates panel layouts, and runs real-time collaboration updates.
*   **[src/app/editor/constants.ts](file:///c:/Users/oken/Desktop/oken/vnflo/src/app/editor/constants.ts)**: Defines constants, such as theme maps, configuration templates, node types, and prompt strings.
*   **[src/app/editor/types.ts](file:///c:/Users/oken/Desktop/oken/vnflo/src/app/editor/types.ts)**: Exposes TypeScript interfaces for diagrams, frames, templates, and coordinate types.

### Editor Components
*   **[src/app/editor/components/EditorToolbar.tsx](file:///c:/Users/oken/Desktop/oken/vnflo/src/app/editor/components/EditorToolbar.tsx)**: Top menu bar containing undo/redo buttons, export actions, collaborative peer tools, and diagram name editing.
*   **[src/app/editor/components/CanvasAIChat.tsx](file:///c:/Users/oken/Desktop/oken/vnflo/src/app/editor/components/CanvasAIChat.tsx)**: Chat panel allowing users to request diagram modifications from the AI assistant.
*   **[src/app/editor/components/CanvasContextMenu.tsx](file:///c:/Users/oken/Desktop/oken/vnflo/src/app/editor/components/CanvasContextMenu.tsx)**: Right-click menu for the canvas. Supports node insertion, style copying/pasting, group configurations, asking the AI, and layer adjustments.
*   **[src/app/editor/components/EditableEdge.tsx](file:///c:/Users/oken/Desktop/oken/vnflo/src/app/editor/components/EditableEdge.tsx)**: Custom connection line with editable text fields and deletion buttons.
*   **[src/app/editor/components/CustomConnectionLine.tsx](file:///c:/Users/oken/Desktop/oken/vnflo/src/app/editor/components/CustomConnectionLine.tsx)**: Styled connection line shown when connecting nodes.
*   **[src/app/editor/components/LiveCursorsOverlay.tsx](file:///c:/Users/oken/Desktop/oken/vnflo/src/app/editor/components/LiveCursorsOverlay.tsx)**: Collaborative cursor overlay showing peer positions on the shared workspace.
*   **[src/app/editor/components/TouchDock.tsx](file:///c:/Users/oken/Desktop/oken/vnflo/src/app/editor/components/TouchDock.tsx)**: Quick-access buttons for canvas adjustments on mobile screens.
*   **[src/app/editor/components/WebRTCModal.tsx](file:///c:/Users/oken/Desktop/oken/vnflo/src/app/editor/components/WebRTCModal.tsx)**: Configuration popup to connect and synchronize diagrams via WebRTC peer IDs.

### Editor Nodes
*   **[src/app/editor/nodes/CustomNode.tsx](file:///c:/Users/oken/Desktop/oken/vnflo/src/app/editor/nodes/CustomNode.tsx)**: Custom node logic. Renders shapes (circle, rect, triangle, diamond, parallelogram, etc.) using SVG maps. Supports double-click label updates, custom font sizes, icons, images, and nested sub-nodes.
*   **[src/app/editor/nodes/FrameNode.tsx](file:///c:/Users/oken/Desktop/oken/vnflo/src/app/editor/nodes/FrameNode.tsx)**: Container frame that groups nodes. Includes tab controls to toggle between canvas diagrams, localized AI chats, and DSL code editing.

### Editor Panels
*   **[src/app/editor/panels/ToolsPanel.tsx](file:///c:/Users/oken/Desktop/oken/vnflo/src/app/editor/panels/ToolsPanel.tsx)**: Left toolbar. Provides shape selection, custom templates, AI prompts, frames, and background themes.
*   **[src/app/editor/panels/PropertiesPanel.tsx](file:///c:/Users/oken/Desktop/oken/vnflo/src/app/editor/panels/PropertiesPanel.tsx)**: Sidebar for modifying node and edge properties (color, style, border, labels, routing rules).
*   **[src/app/editor/panels/ScopedAIChatPanel.tsx](file:///c:/Users/oken/Desktop/oken/vnflo/src/app/editor/panels/ScopedAIChatPanel.tsx)**: AI assistant panel restricted to a selected frame node.
*   **[src/app/editor/panels/ScopedCodeEditorPanel.tsx](file:///c:/Users/oken/Desktop/oken/vnflo/src/app/editor/panels/ScopedCodeEditorPanel.tsx)**: Live code editor to generate and compile flowchart/ERD DSL code directly onto the frame canvas.
*   **[src/app/editor/panels/DSLPanel.tsx](file:///c:/Users/oken/Desktop/oken/vnflo/src/app/editor/panels/DSLPanel.tsx)**: Full code workspace.
*   **[src/app/editor/panels/ERDiagramPanel.tsx](file:///c:/Users/oken/Desktop/oken/vnflo/src/app/editor/panels/ERDiagramPanel.tsx)**: Details entity relationships.

### Editor Utilities & Templates
*   **[src/app/editor/utils/dsl.ts](file:///c:/Users/oken/Desktop/oken/vnflo/src/app/editor/utils/dsl.ts)**: Parser and generator for Flowchart and ERD DSL formats. It handles text translations (e.g. `n1 [label="Step 1"] -> n2`) to build canvas structures.
*   **[src/app/editor/utils/nodeUtils.ts](file:///c:/Users/oken/Desktop/oken/vnflo/src/app/editor/utils/nodeUtils.ts)**: Geometry helper script. Handles z-index calculations, boundary coordinates, overlap checks, and cleanup of orphaned sub-nodes.
*   **[src/app/editor/templates/diagramTemplates.ts](file:///c:/Users/oken/Desktop/oken/vnflo/src/app/editor/templates/diagramTemplates.ts)**: Defines structural mockups (such as Org Charts, Microservice Architectures, Database schemas) used to populate the template picker.

### Custom React Hooks
*   **[src/app/editor/hooks/useNodeOperations.ts](file:///c:/Users/oken/Desktop/oken/vnflo/src/app/editor/hooks/useNodeOperations.ts)**: Coordinates node updates, deletions, scaling, and nested positioning.
*   **[src/app/editor/hooks/useEdgeOperations.ts](file:///c:/Users/oken/Desktop/oken/vnflo/src/app/editor/hooks/useEdgeOperations.ts)**: Manages connector drag, drop, and reconnection events.
*   **[src/app/editor/hooks/useClipboard.ts](file:///c:/Users/oken/Desktop/oken/vnflo/src/app/editor/hooks/useClipboard.ts)**: Coordinates standard commands (Copy, Cut, Paste, Duplicate) for canvas nodes.
*   **[src/app/editor/hooks/useEditorHistory.ts](file:///c:/Users/oken/Desktop/oken/vnflo/src/app/editor/hooks/useEditorHistory.ts)**: Implements undo/redo logs tracking user edits.
*   **[src/app/editor/hooks/useAutoLayout.ts](file:///c:/Users/oken/Desktop/oken/vnflo/src/app/editor/hooks/useAutoLayout.ts)**: Automated layout controller.
*   **[src/app/editor/hooks/useElkLayout.ts](file:///c:/Users/oken/Desktop/oken/vnflo/src/app/editor/hooks/useElkLayout.ts)**: Integrates the ELK layout solver (`elkjs`) to format nodes vertically or horizontally.
*   **[src/app/editor/hooks/useExportDiagram.ts](file:///c:/Users/oken/Desktop/oken/vnflo/src/app/editor/hooks/useExportDiagram.ts)**: Exports diagrams as PNG/SVG images, Markdown schemas, raw HTML code, or sharing links.
*   **[src/app/editor/hooks/useContextMenu.ts](file:///c:/Users/oken/Desktop/oken/vnflo/src/app/editor/hooks/useContextMenu.ts)**: Controls mouse trigger positioning for the custom right-click menus.
*   **[src/app/editor/hooks/useAIDiagram.ts](file:///c:/Users/oken/Desktop/oken/vnflo/src/app/editor/hooks/useAIDiagram.ts)**: Handles prompts for generating full diagrams.
*   **[src/app/editor/hooks/useKeyboardShortcuts.ts](file:///c:/Users/oken/Desktop/oken/vnflo/src/app/editor/hooks/useKeyboardShortcuts.ts)**: Binds editor actions to hotkeys (e.g. Ctrl+Z, Ctrl+Y, Ctrl+C, Ctrl+V, Delete).
*   **[src/app/editor/hooks/useWebRTC.ts](file:///c:/Users/oken/Desktop/oken/vnflo/src/app/editor/hooks/useWebRTC.ts)**: Establishes P2P connections to synchronize node edits across collaborators in real time.

---

## API Endpoints (`src/app/api/`)

Next.js Server Actions and Route Handlers.

*   **[src/app/api/authHelper.ts](file:///c:/Users/oken/Desktop/oken/vnflo/src/app/api/authHelper.ts)**: Decodes JWT authorization headers to identify and verify authenticated users.
*   **[src/app/api/auth/profile/route.ts](file:///c:/Users/oken/Desktop/oken/vnflo/src/app/api/auth/profile/route.ts)**: Handles profile creation and loading for user records.
*   **[src/app/api/auth/recovery-link/route.ts](file:///c:/Users/oken/Desktop/oken/vnflo/src/app/api/auth/recovery-link/route.ts)**: Fallback handler for recovery links.
*   **[src/app/api/users/me/route.ts](file:///c:/Users/oken/Desktop/oken/vnflo/src/app/api/users/me/route.ts)**: Retrieves and updates the logged-in user's profile database row.
*   **[src/app/api/ai/generate/route.ts](file:///c:/Users/oken/Desktop/oken/vnflo/src/app/api/ai/generate/route.ts)**: Proxies requests to OpenRouter, processes system instructions, tracks tokens, and deducts credits from user accounts.
*   **[src/app/api/subscriptions/create/route.ts](file:///c:/Users/oken/Desktop/oken/vnflo/src/app/api/subscriptions/create/route.ts)**: Invokes Razorpay SDK APIs to generate purchase requests.
*   **[src/app/api/subscriptions/verify/route.ts](file:///c:/Users/oken/Desktop/oken/vnflo/src/app/api/subscriptions/verify/route.ts)**: Verifies payment signatures and updates subscription flags.
*   **[src/app/api/subscriptions/cancel/route.ts](file:///c:/Users/oken/Desktop/oken/vnflo/src/app/api/subscriptions/cancel/route.ts)**: Terminates subscriptions via Razorpay APIs.
*   **[src/app/api/subscriptions/razorpayHelper.ts](file:///c:/Users/oken/Desktop/oken/vnflo/src/app/api/subscriptions/razorpayHelper.ts)**: Helper class wrapper validating Razorpay payment signatures.
