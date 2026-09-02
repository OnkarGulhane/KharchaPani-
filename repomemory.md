# Kharcha Pani — Repository Memory & Knowledge Context

**Last Updated:** September 2, 2026  
**Active Architecture Version:** v3.2 (Universal Cross-Platform Multi-User SaaS, Light/Night Mode Theme Engine, 3D Interactive Physics, Dual-Mode Google OAuth 2.0 & FedCM, Cross-Origin Session Persistence & Zero-Trust Multi-Tenant Data Isolation)

---

## 🏛️ 1. Architecture & Tech Stack

```
Frontend (Next.js 14 App Router + TypeScript + Tailwind CSS + Framer Motion)
   │  HTTPS (Bearer Access Token in Memory/SessionStorage + LocalStorage Fallback + Cross-Origin HttpOnly Cookie for Refresh)
   ▼
Backend (FastAPI + SQLAlchemy 2.0 Asyncpg/Aiosqlite + Uvicorn)
   │  Direct Queries strictly scoped with WHERE user_id == current_user.id
   ▼
Database (PostgreSQL / Supabase + SQLite + Alembic)
```

- **Frontend:** Next.js 14, React 18, TanStack Query v5, Recharts, Framer Motion (3D Tilt & Spring Physics), Google Identity Services (GSI) Universal integration, `react-hook-form`, `zod`, `sonner`, `lucide-react`.
- **Backend:** FastAPI, Python 3.11+, SQLAlchemy 2.0 Async, `bcrypt`, `pyjwt`, `google-auth`, `httpx` (async persistent client for Google token & userinfo verification with keep-alive), `slowapi`, `pytest`.
- **Database Tables:** `users`, `refresh_tokens`, `password_reset_tokens`, `categories` (Composite Unique `(name, user_id)`), `expenses`, `budgets`.

---

## 🔒 2. Authentication & Cross-Platform Security Engine

1. **Access Token (JWT):**
   - Lifespan: 15 minutes (`ACCESS_TOKEN_EXPIRE_MINUTES=15`).
   - Alg: `HS256`, Payload: `{"sub": "<user_id>", "email": "<email>", "exp": ..., "iat": ...}`.
   - Storage: In-memory (React Context / `client.ts`) with dual fallback to `localStorage` for cross-origin tab persistence.
2. **Refresh Token & Cross-Origin Cookies:**
   - Lifespan: 30 days (`REFRESH_TOKEN_EXPIRE_DAYS=30`).
   - Format: Cryptographic 64-char URL-safe random string (`secrets.token_urlsafe(48)`).
   - Storage: Set as `HttpOnly`, `SameSite=none`, `Secure=True` cookie (`kharcha_refresh_token`) + JSON body token backup for browsers with third-party cookie restrictions (Chrome Privacy Sandbox / Safari ITP).
   - DB Record: Only the **SHA-256 hash** (`hashlib.sha256(token).hexdigest()`) is stored in `refresh_tokens.token_hash`.
3. **Token Rotation & Revocation:**
   - Every `/api/v1/auth/refresh` revokes the used token (`is_revoked=True`) and generates a fresh token pair.
   - Single device logout: `POST /api/v1/auth/logout`.
   - All devices logout: `POST /api/v1/auth/logout-all` (revokes all active tokens for `user_id`).
4. **Google Identity Services (GSI) Universal Cross-Platform Engine:**
   - Real custom SaaS React button with official 4-color Google logo and zero user-email exposure prior to clicking.
   - Pre-initialized Google Identity TokenClient with synchronous user-gesture click activation.
   - In-page One-Tap / FedCM fallback (`google.accounts.id.prompt()`).
   - Backend verification: Asynchronous `httpx` client verifying either Google OpenID ID Token or Google OAuth2 Access Token via `oauth2.googleapis.com/tokeninfo` & `googleapis.com/oauth2/v3/userinfo` (< 50ms fast-path).
   - Automatic user account creation/linking + Self-healing starter categories provisioning.
5. **Backend Pre-Warming (Zero Cold-Start Lag):**
   - On `/login` and `/register` mount, frontend fires background `/health` ping, waking Render cloud container before user finishes clicking.
6. **Zero-Trust Multi-Tenant Data Isolation:**
   - Identity is derived exclusively from JWT via `get_current_active_user`.
   - All DB operations enforce `WHERE model.user_id == current_user.id`.
   - Querying or manipulating other users' records returns `404 Not Found`.

---

## 🎨 3. UI/UX Design System & Theme Engine

1. **Light & Night Mode Theme Engine (`ThemeProvider.tsx`, `ThemeToggle.tsx`):**
   - **Night Mode (Dark):** Obsidian `#070b14` background, deep slate `#0f172a` surfaces, emerald neon accents, glassmorphic cards.
   - **Day Mode (Light):** Pure crystal `#f8fafc` background, crisp slate `#0f172a` typography, soft borders, subtle elevation.
   - **System Auto Mode:** Syncs dynamically with OS `prefers-color-scheme`.
   - Anti-flicker inline hydration script in `<head>` preventing white/black flash on reload.
   - 3 UI Toggle variants: Floating Pill (AuthCard), Segmented Switcher (Sidebar & Drawer), Compact Header Icon.
2. **3D Interactive Physics (`Interactive3DCard.tsx`, `ThreeDTiltCard.tsx`):**
   - Mouse-tracking 3D perspective tilt with dynamic specular radial glare spotlight.
   - Tactile spring feedback (`active:scale-95`) across all primary action buttons.

---

## 📁 4. Core File Map

| Path | Purpose |
|---|---|
| `backend/app/models/` | `user.py`, `refresh_token.py`, `password_reset.py`, `category.py`, `expense.py`, `budget.py` |
| `backend/app/core/` | `config.py`, `security.py` (BCrypt + JWT), `dependencies.py` (`get_current_active_user`), `database.py`, `init_db.py` |
| `backend/app/services/` | `auth_service.py`, `google_auth_service.py` (Async OpenID & OAuth2 Token verification), `expense_service.py`, `category_service.py` (Auto-seed on demand), `budget_service.py`, `dashboard_service.py` |
| `backend/app/routers/` | `auth.py` (Cross-origin SameSite=none cookies & token rotation), `expenses.py`, `categories.py`, `budget.py`, `dashboard.py`, `health.py` |
| `backend/tests/` | 23/23 Tests Passed (100%) (`test_auth.py`, `test_isolation.py`, `test_expenses.py`, `test_categories.py`, `test_budget.py`, `test_dashboard.py`, `test_database_layer.py`, `test_api_endpoints.py`) |
| `frontend/src/context/` | `AuthContext.tsx` (State, dual token persistence, silent refresh on mount, login/register/logout actions, instant native redirect) |
| `frontend/src/lib/api/` | `client.ts` (Bearer interceptor + auto 401 silent refresh + storage token fallback), `auth.ts`, `expenses.ts`, `categories.ts`, `budget.ts`, `dashboard.ts` |
| `frontend/src/components/providers/` | `ThemeProvider.tsx` (Dark/Light/Auto), `GoogleProvider.tsx` (Global SDK loader), `QueryProvider.tsx`, `CurrencyProvider.tsx`, `PWAProvider.tsx` |
| `frontend/src/components/common/` | `ThemeToggle.tsx` (3D morphing sun/moon switch), `PWAInstallBanner.tsx`, `PWAInstallModal.tsx` |
| `frontend/src/components/3d/` | `Interactive3DCard.tsx` (Cursor tilt & radial glare spotlight), `ThreeDTiltCard.tsx` |
| `frontend/src/components/auth/` | `AuthCard.tsx` (Glassmorphic card with floating theme toggle), `GoogleSignInButton.tsx` (Clean SaaS button + synchronous user-gesture + FedCM fallback) |
| `frontend/public/` | `sw.js` (PWA Service Worker `kharcha-pani-v3-fresh` with Network-First strategy), `manifest.json` |

---

## ⚡ 5. Health & Testing Status

- **Backend Pytest:** 23/23 Passed (100%) ✅
- **Frontend TypeScript & Build:** `next build` 12/12 static pages generated with 0 errors ✅
- **Git Deployment:** Pushed to `feature/backend-database-setup` (Latest commit `4d7a615`) ✅
- **Port Status:** 3000 & 8000 closed/clean; PostgreSQL available on 5432.
