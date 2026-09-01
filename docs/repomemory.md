# Kharcha Pani — Repository Memory & Knowledge Context

**Last Updated:** August 31, 2026  
**Active Architecture Version:** v3.0 (Multi-User, Production-Ready JWT + OAuth 2.0 Auth & Strict Data Isolation)

---

## 🏛️ 1. Architecture & Tech Stack

```
Frontend (Next.js 14 App Router + TypeScript + Tailwind CSS)
   │  HTTPS (Bearer Access Token in Memory + HttpOnly Cookie for Refresh Token)
   ▼
Backend (FastAPI + SQLAlchemy 2.0 Asyncpg + Uvicorn)
   │  Direct Queries strictly scoped with WHERE user_id == current_user.id
   ▼
Database (PostgreSQL / Supabase + Alembic)
```

- **Frontend:** Next.js 14, React 18, TanStack Query v5, Recharts, Framer Motion, `@react-oauth/google`, `react-hook-form`, `zod`, `sonner`.
- **Backend:** FastAPI, Python 3.11+, SQLAlchemy 2.0 Async, `bcrypt`, `pyjwt`, `google-auth`, `slowapi`, `httpx`, `pytest`.
- **Database Tables:** `users`, `refresh_tokens`, `password_reset_tokens`, `categories` (Composite Unique `(name, user_id)`), `expenses`, `budgets`.

---

## 🔒 2. Authentication & Security Engine

1. **Access Token (JWT):**
   - Lifespan: 15 minutes (`ACCESS_TOKEN_EXPIRE_MINUTES=15`).
   - Alg: `HS256`, Payload: `{"sub": "<user_id>", "email": "<email>", "exp": ..., "iat": ...}`.
   - Storage: In-memory (React Context / `client.ts`).
2. **Refresh Token:**
   - Lifespan: 30 days (`REFRESH_TOKEN_EXPIRE_DAYS=30`).
   - Format: Cryptographic 64-char URL-safe random string (`secrets.token_urlsafe(48)`).
   - Storage: Set as `HttpOnly`, `SameSite=Lax`, `Secure` cookie (`kharcha_refresh_token`).
   - DB Record: Only the **SHA-256 hash** (`hashlib.sha256(token).hexdigest()`) is stored in `refresh_tokens.token_hash`.
3. **Token Rotation & Revocation:**
   - Every `/api/v1/auth/refresh` revokes the used token (`is_revoked=True`) and generates a fresh token pair.
   - Single device logout: `POST /api/v1/auth/logout`.
   - All devices logout: `POST /api/v1/auth/logout-all` (revokes all active tokens for `user_id`).
4. **Google Sign-In:**
   - Backend verification: `google.oauth2.id_token.verify_oauth2_token` with Google API public certs.
   - Automatic user account creation/linking + Starter categories provisioning.
5. **Zero-Trust Multi-Tenant Data Isolation:**
   - Identity is derived exclusively from JWT via `get_current_active_user`.
   - All DB operations enforce `WHERE model.user_id == current_user.id`.
   - Querying or manipulating other users' records returns `404 Not Found`.

---

## 📁 3. Core File Map

| Path | Purpose |
|---|---|
| `backend/app/models/` | `user.py`, `refresh_token.py`, `password_reset.py`, `category.py`, `expense.py`, `budget.py` |
| `backend/app/core/` | `config.py`, `security.py` (BCrypt + JWT), `dependencies.py` (`get_current_active_user`), `database.py`, `init_db.py` |
| `backend/app/services/` | `auth_service.py`, `google_auth_service.py`, `expense_service.py`, `category_service.py`, `budget_service.py`, `dashboard_service.py` |
| `backend/app/routers/` | `auth.py`, `expenses.py`, `categories.py`, `budget.py`, `dashboard.py`, `health.py` |
| `backend/tests/` | `test_auth.py`, `test_isolation.py`, `test_expenses.py`, `test_categories.py`, `test_budget.py`, `test_dashboard.py` (20/20 Passed) |
| `frontend/src/context/` | `AuthContext.tsx` (State, silent refresh on mount, login/register/logout actions) |
| `frontend/src/lib/api/` | `client.ts` (Bearer interceptor + auto 401 silent refresh), `auth.ts`, `expenses.ts`, `categories.ts`, `budget.ts`, `dashboard.ts` |
| `frontend/src/components/auth/` | `AuthCard.tsx` (Glassmorphic UI), `GoogleSignInButton.tsx` (`@react-oauth/google`) |
| `frontend/src/app/` | `/login`, `/register`, `/forgot-password`, `/reset-password`, `/` (Dashboard), `/expenses` |

---

## ⚡ 4. Health & Testing Status

- **Backend Pytest:** 20/20 Passed (100%) ✅
- **Frontend TypeScript & Build:** `tsc --noEmit` 0 errors, `next build` 11/11 static pages generated ✅
- **Port Status:** 3000 & 8000 closed/clean; PostgreSQL available on 5432.
