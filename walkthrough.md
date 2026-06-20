# Firebase → Backend API Server — Walkthrough

## What Was Done

The Firebase/Firestore logic has been extracted from the React frontend into a standalone **Node.js/Express backend API server** that lives in the new `server/` directory.

---

## New Files

### `server/` — Standalone Express Server

| File | Purpose |
|------|---------|
| [package.json](file:///c:/Users/oken/Desktop/oken/node-builder/server/package.json) | Server deps: Express, `firebase-admin`, `cors`, `tsx`, TypeScript |
| [tsconfig.json](file:///c:/Users/oken/Desktop/oken/node-builder/server/tsconfig.json) | NodeNext module resolution for ESM |
| [.env.example](file:///c:/Users/oken/Desktop/oken/node-builder/server/.env.example) | Credential template (never commit the real `.env`) |
| [src/index.ts](file:///c:/Users/oken/Desktop/oken/node-builder/server/src/index.ts) | Express entry point — CORS, JSON parsing, routes, health check |
| [src/firebase-admin.ts](file:///c:/Users/oken/Desktop/oken/node-builder/server/src/firebase-admin.ts) | Firebase Admin SDK init from env vars |
| [src/middleware/auth.ts](file:///c:/Users/oken/Desktop/oken/node-builder/server/src/middleware/auth.ts) | `verifyIdToken` middleware — checks `Authorization: Bearer <token>` |
| [src/routes/auth.ts](file:///c:/Users/oken/Desktop/oken/node-builder/server/src/routes/auth.ts) | `POST /api/auth/profile` — create or fetch user document |
| [src/routes/users.ts](file:///c:/Users/oken/Desktop/oken/node-builder/server/src/routes/users.ts) | `GET /api/users/me`, `PATCH /api/users/me` |

### API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/health` | None | Server health check |
| `POST` | `/api/auth/profile` | Bearer token | Create or fetch Firestore profile |
| `GET` | `/api/users/me` | Bearer token | Get current user's profile |
| `PATCH` | `/api/users/me` | Bearer token | Update profile fields |

---

## Modified Files

### [firebase.ts](file:///c:/Users/oken/Desktop/oken/node-builder/src/app/db/firebase.ts)
Removed Firestore (`getFirestore`, `db` export). Now only exports `auth` — the Firebase Client Auth instance the browser needs for sign-in flows.

### [authStore.ts](file:///c:/Users/oken/Desktop/oken/node-builder/src/app/stores/authStore.ts)
- Removed all `firebase/firestore` imports and direct Firestore calls.
- Added `fetchOrCreateProfile`, `fetchMyProfile`, `patchMyProfile` helpers that call the REST API with `Authorization: Bearer <idToken>`.
- `onAuthStateChanged` still triggers in the browser; profile data now comes from the API.
- `changePassword` still uses Firebase Client SDK directly (no server needed for this).

### [vite.config.ts](file:///c:/Users/oken/Desktop/oken/node-builder/vite.config.ts)
Added proxy entries:
```
/api/auth  →  http://localhost:4000
/api/users →  http://localhost:4000
```
The existing `/api/ai` → OpenRouter proxy is untouched.

### [.env.example](file:///c:/Users/oken/Desktop/oken/node-builder/.env.example)
Added `VITE_API_URL` (empty = use Vite proxy in dev; set to full URL in production).

---

## Architecture

```
Browser (React + Firebase Client SDK)
  │
  ├─ signIn / signInWithPopup ──► Firebase Auth (Google/Password)
  │    └─ returns ID Token (JWT)
  │
  └─ fetch('/api/...') + Authorization: Bearer <idToken>
       │  (Vite proxy in dev)
       ▼
  Express Server  :4000  (server/)
  │   firebase-admin verifies the ID Token
  │   reads/writes Firestore
  │
  └─► Firestore  (users collection)
```

---

## How to Get Running

### Step 1 — Create the server `.env`

Get a service account from **Firebase Console → Project Settings → Service Accounts → Generate new private key**.

```
server/.env
───────────
FIREBASE_PROJECT_ID=vnflo-eddf5
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@vnflo-eddf5.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----\n"
PORT=4000
ALLOWED_ORIGIN=http://localhost:5173
```

> [!CAUTION]
> Add `server/.env` to your `.gitignore`. The service account key has full admin access to your Firebase project.

### Step 2 — Run both processes

**Terminal 1 — Backend API:**
```bash
cd server
npm run dev
# 🚀 API server running on http://localhost:4000
```

**Terminal 2 — Frontend:**
```bash
npm run dev
# Vite proxies /api/auth and /api/users to :4000 automatically
```

### Step 3 — Verify
- Open `http://localhost:4000/health` — should return `{ "status": "ok" }`.
- Sign in via the app — network tab should show `POST /api/auth/profile` → `200`.

---

## What Was Validated
- All server source files compile with `tsx` (ESM + TypeScript).
- `npm install` in `server/` completes successfully.
- Vite proxy config is syntactically correct and coexists with the existing `/api/ai` proxy.
- `authStore.ts` no longer imports `firebase/firestore`.
