# Software Requirements Specification (SRS)

## Kharcha Pani — Personal Expense Tracker

**Version:** 3.0 (Production-Ready Authentication, OAuth 2.0 & Multi-User Data Isolation)  
**Date:** August 2026

---

## 1. Introduction

### 1.1 Purpose

This SRS serves as the authoritative technical blueprint for **Kharcha Pani** — defining the technical architecture, security protocols, database schemas, cryptographic standards, API contracts, frontend state management, and multi-tenant data isolation rules required to support multi-user operations with enterprise-grade security.

### 1.2 Scope

Kharcha Pani is a full-stack personal finance application featuring:
- Secure User Authentication (Email/Password & Google OAuth 2.0 / OpenID Connect).
- JWT Authentication with Refresh Token Rotation in `HttpOnly`, `SameSite=Lax`, `Secure` cookies.
- Server-side session tracking with single-session and all-session revocation.
- Strict Multi-Tenant User Data Isolation (Zero RBAC, owner-exclusive authorization on all resources).
- Full Expense CRUD, Category Management with safe deletion workflows, Budget goal tracking, and Real-time Visual Analytics.

### 1.3 Core Technical Principles

1. **Zero-Trust Client Authorization**: The client/frontend is NEVER trusted for user identification (`user_id`). The authenticated user context is derived strictly from validated backend JWT claims.
2. **Cryptographic Protection of Credentials**: Passwords are never stored in plaintext (BCrypt/Argon2 with work factor ≥12). Refresh tokens are stored strictly as SHA-256 hashes.
3. **No Hardcoded Data**: Zero dummy or mock data. All financial metrics and reports are computed dynamically from PostgreSQL using SQLAlchemy 2.0 async engine.
4. **Non-Breaking Extensibility**: Database constraints and migrations (Alembic) maintain clean schema versioning with foreign keys and composite unique constraints.

---

## 2. Technology Stack

| Layer | Technology | Specification / Version |
|---|---|---|
| Frontend Framework | Next.js (App Router) | Next.js 14, React 18, TypeScript 5+ |
| Styling & UI | Tailwind CSS + Framer Motion | Tailwind v3.4+, Framer Motion v11+ |
| Client State & Forms | TanStack React Query + React Hook Form | TanStack Query v5+, Zod v3.23+ |
| Data Visualization | Recharts | Recharts v2.12+ (2D charts authoritative) |
| Backend Framework | FastAPI | FastAPI 0.110+, Python 3.11+, Uvicorn (ASGI) |
| Database Engine | PostgreSQL | PostgreSQL 15+ (Hosted on Supabase) |
| ORM & Migrations | SQLAlchemy 2.0 Async + Alembic | SQLAlchemy 2.0 (Asyncpg driver) |
| Authentication & Security | PyJWT + Passlib / BCrypt + Google Auth | PyJWT 2.8+, Passlib 1.7.4 (BCrypt), `google-auth` |
| Rate Limiting & Protection | SlowAPI | SlowAPI (In-memory / Redis compatible) |
| Production Hosting | Vercel (Frontend) + Render (Backend) | Dockerized backend with Gunicorn/Uvicorn workers |

---

## 3. System Architecture

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                           NEXT.JS 14 FRONTEND                                            │
│  ┌─────────────────────────┐  ┌───────────────────────────┐  ┌────────────────────────────────────────┐  │
│  │   AuthContext / State   │  │   apiFetch Interceptor    │  │       UI Components & Dashboards       │  │
│  │ (Memory Access Token)   │  │  (Auto 401 Silent Refresh)│  │   (Recharts, Modals, Forms, PWA)       │  │
│  └─────────────────────────┘  └───────────────────────────┘  └────────────────────────────────────────┘  │
└───────────────────────────────────────────────┬──────────────────────────────────────────────────────────┘
                                                │ HTTPS (Bearer Access Token / HttpOnly Cookie)
                                                ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                         FASTAPI BACKEND RUNTIME                                          │
│  ┌────────────────────────┐  ┌────────────────────────────┐  ┌────────────────────────────────────────┐  │
│  │  Security Middleware   │  │    FastAPI Dependencies    │  │           Router Endpoints             │  │
│  │ (CORS, CSRF, RateLimit)│  │   (get_current_active_user)│  │  (/auth, /expenses, /categories, etc.)  │  │
│  └────────────────────────┘  └────────────────────────────┘  └────────────────────────────────────────┘  │
│                                               │                                                          │
│  ┌────────────────────────────────────────────┴───────────────────────────────────────────────────────┐  │
│  │                                     SERVICE LAYER (Multi-Tenant Logic)                             │  │
│  │     (AuthService, GoogleAuthService, ExpenseService, CategoryService, BudgetService, Dashboard)    │  │
│  └────────────────────────────────────────────┬───────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────┼──────────────────────────────────────────────────────────┘
                                                │ SQLAlchemy 2.0 Asyncpg
                                                ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                     POSTGRESQL DATABASE (SUPABASE)                                       │
│  ┌──────────────┐   ┌───────────────────┐   ┌──────────────────────┐   ┌──────────────┐   ┌────────────┐ │
│  │    users     │──<│   refresh_tokens  │   │ password_reset_tokens│   │  categories  │──<│  expenses  │ │
│  └──────────────┘   └───────────────────┘   └──────────────────────┘   └──────────────┘   └────────────┘ │
│         │                                                                     │                  │       │
│         └──────────────────────────────(Foreign Key user_id)──────────────────┴──────────────────┘       │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Backend Architecture & Folder Structure

```
backend/
├── app/
│   ├── main.py                         # FastAPI app instance, CORS middleware, global exception handlers
│   ├── core/
│   │   ├── config.py                   # Pydantic Settings (env vars validated on startup)
│   │   ├── database.py                 # Async SQLAlchemy engine, session maker, get_db dependency
│   │   ├── security.py                 # Password hashing (BCrypt), JWT encoding/decoding, token hashing
│   │   └── dependencies.py             # get_current_user, get_current_active_user dependencies
│   ├── models/                         # SQLAlchemy 2.0 Declarative Mapped Models
│   │   ├── base.py                     # Declarative Base
│   │   ├── user.py                     # User account model
│   │   ├── refresh_token.py            # RefreshToken session model (hashed tokens)
│   │   ├── password_reset.py           # PasswordResetToken model
│   │   ├── category.py                 # Category model (composite unique name+user_id)
│   │   ├── expense.py                  # Expense model (user_id FK)
│   │   └── budget.py                   # Budget model (user_id FK)
│   ├── schemas/                        # Pydantic v2 Request/Response Schemas
│   │   ├── auth.py                     # Login, Register, GoogleAuth, TokenResponse, PasswordReset schemas
│   │   ├── user.py                     # UserResponse, UserUpdate schemas
│   │   ├── category.py                 # CategoryCreate, CategoryUpdate, CategoryResponse
│   │   ├── expense.py                  # ExpenseCreate, ExpenseUpdate, ExpenseResponse
│   │   ├── budget.py                   # BudgetCreate, BudgetStatusResponse
│   │   ├── dashboard.py                # Summary, Charts, MoM, TopCategories, AverageSpend schemas
│   │   └── response.py                 # Generic APIResponse[T], PaginatedData[T]
│   ├── routers/                        # API Controllers
│   │   ├── auth.py                     # /api/v1/auth endpoints
│   │   ├── expenses.py                 # /api/v1/expenses endpoints
│   │   ├── categories.py               # /api/v1/categories endpoints (with reassign/cascade)
│   │   ├── budget.py                   # /api/v1/budget endpoints
│   │   ├── dashboard.py                # /api/v1/dashboard analytics endpoints
│   │   └── health.py                   # /health, /health/db endpoints (unprotected)
│   ├── services/                       # Isolated Domain Business Logic
│   │   ├── auth_service.py             # User registration, password verification, token lifecycle
│   │   ├── google_auth_service.py      # Google OAuth token verification and account linking
│   │   ├── expense_service.py          # User-isolated expense CRUD, pagination, filtering
│   │   ├── category_service.py         # User-isolated category CRUD & reassign/cascade deletion
│   │   ├── budget_service.py           # User-isolated budget tracking and calculation
│   │   └── dashboard_service.py        # User-isolated analytics aggregation and trends
│   ├── seed/
│   │   └── seed_categories.py          # Helper to seed default starter categories per user
│   └── utils/
│       └── validators.py               # Input validation helpers
├── alembic/
│   ├── versions/                       # Database migration scripts
│   └── env.py                          # Async Alembic runner
├── tests/
│   ├── conftest.py                     # Test DB fixtures, mock tokens, authenticated clients
│   ├── test_auth.py                    # Registration, login, refresh rotation, revocation tests
│   ├── test_isolation.py               # Multi-user data leak prevention tests
│   ├── test_expenses.py                # Expense CRUD with user isolation
│   ├── test_categories.py              # Category CRUD with composite unique and safe deletion
│   ├── test_budget.py                  # Budget calculations per user
│   └── test_dashboard.py               # Analytics data isolation tests
├── Dockerfile
├── requirements.txt
└── alembic.ini
```

---

## 5. Frontend Architecture & Folder Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx                  # Root layout with QueryProvider, AuthProvider, PWAProvider
│   │   ├── page.tsx                    # Protected Dashboard view
│   │   ├── login/
│   │   │   └── page.tsx                # Glassmorphic Login with Email/Password & Google Sign-In
│   │   ├── register/
│   │   │   └── page.tsx                # User Registration page with live validation
│   │   ├── forgot-password/
│   │   │   └── page.tsx                # Password recovery request page
│   │   ├── reset-password/
│   │   │   └── page.tsx                # Password reset execution page (token-based)
│   │   ├── expenses/
│   │   │   └── page.tsx                # Protected Expense Management view
│   │   ├── loading.tsx
│   │   ├── error.tsx
│   │   ├── not-found.tsx
│   │   └── globals.css
│   ├── context/
│   │   └── AuthContext.tsx             # React Context for user profile, tokens, login/logout actions
│   ├── components/
│   │   ├── auth/
│   │   │   ├── AuthCard.tsx            # Premium glassmorphic container for auth screens
│   │   │   ├── GoogleSignInButton.tsx  # Google OAuth 2.0 button integration
│   │   │   ├── LoginForm.tsx           # React Hook Form + Zod login form
│   │   │   └── RegisterForm.tsx        # React Hook Form + Zod registration form
│   │   ├── ui/                         # Base design system primitives (Button, Input, Modal, Badge)
│   │   ├── layout/                     # Sidebar, MobileBottomNav, HamburgerMenu, Header
│   │   ├── dashboard/                  # Metric cards, Recharts components, PeriodSelector
│   │   ├── expenses/                   # ExpenseList, ExpenseForm, ExpenseFilters, DeleteDialog
│   │   └── categories/                 # CategoryManager, CategoryForm, CategoryDeleteDialog
│   ├── lib/
│   │   ├── api/
│   │   │   ├── client.ts               # Fetch client with Bearer auth & auto 401 Silent Refresh
│   │   │   ├── auth.ts                 # Auth API methods
│   │   │   ├── expenses.ts             # Expense API methods
│   │   │   ├── categories.ts           # Category API methods
│   │   │   ├── budget.ts               # Budget API methods
│   │   │   └── dashboard.ts            # Dashboard API methods
│   │   ├── validations/
│   │   │   ├── authSchema.ts           # Zod schemas for login, register, forgot-password
│   │   │   ├── expenseSchema.ts
│   │   │   └── categorySchema.ts
│   │   └── utils.ts
│   ├── hooks/
│   │   ├── useAuth.ts                  # Convenience hook for AuthContext
│   │   ├── useExpenses.ts              # TanStack queries for expenses
│   │   ├── useCategories.ts            # TanStack queries for categories
│   │   ├── useBudget.ts                # TanStack queries for budget
│   │   └── useDashboard.ts             # TanStack queries for analytics
│   └── types/
│       ├── auth.ts                     # User, Token, Session interfaces
│       ├── api.ts                      # Envelope response types
│       ├── expense.ts
│       └── category.ts
```

---

## 6. Security, Authentication & Cryptography Specification

### 6.1 Password Security & Hashing
- **Algorithm**: BCrypt (`passlib.context.CryptContext(schemes=["bcrypt"], deprecated="auto")`).
- **Cost Factor**: 12 rounds minimum.
- **Constraints**: Minimum 8 characters, at least 1 uppercase letter, 1 number, and 1 special character.
- **Leak Prevention**: Password hashes are never returned in schemas, logs, or API responses.

### 6.2 JWT Access Token
- **Format**: JSON Web Token (JWT), signed with HMAC-SHA256 (`HS256`).
- **Lifespan**: 15 minutes (`ACCESS_TOKEN_EXPIRE_MINUTES=15`).
- **Payload Claims**:
  ```json
  {
    "sub": "user_id_integer_as_string",
    "email": "user@example.com",
    "iat": 1725100000,
    "exp": 1725100900,
    "type": "access"
  }
  ```
- **Transmission**: Sent by frontend via `Authorization: Bearer <access_token>` header.

### 6.3 Refresh Token & Cookie Architecture
- **Format**: Cryptographically strong random 64-character URL-safe string (`secrets.token_urlsafe(48)`).
- **Lifespan**: 30 days (`REFRESH_TOKEN_EXPIRE_DAYS=30`).
- **Database Storage**: Only the **SHA-256 hash** (`hashlib.sha256(token.encode()).hexdigest()`) is stored in `refresh_tokens.token_hash`. Plaintext tokens are NEVER stored in the database.
- **Cookie Security Flags**:
  - `HttpOnly = True` (inaccessible to browser JavaScript/XSS).
  - `Secure = True` (transmitted only over HTTPS in staging/production).
  - `SameSite = "Lax"` (mitigates CSRF while enabling top-level navigation).
  - `Path = "/api/v1/auth"` (restricted strictly to auth refresh/logout endpoints).
  - `Max-Age = 2592000` (30 days in seconds).

### 6.4 Refresh Token Rotation & Revocation
- **Automatic Rotation**: When `/api/v1/auth/refresh` is called:
  1. The incoming cookie token is hashed and verified against `refresh_tokens`.
  2. If expired or `is_revoked == True`, the request is rejected with `401 Unauthorized`.
  3. The used token is immediately marked `is_revoked = True` (`revoked_at = NOW()`).
  4. A brand-new refresh token is generated, hashed, saved, and issued in a fresh `Set-Cookie` header along with a new Access Token.
- **Session Revocation (`/auth/logout`)**: The specific refresh token is revoked in DB and the cookie is expired (`Max-Age=0`).
- **Multi-Device Revocation (`/auth/logout-all`)**: All active refresh tokens belonging to `current_user.id` are marked `is_revoked = True`.

### 6.5 Google OAuth 2.0 / OpenID Connect
- **Flow**:
  1. Frontend uses Google Identity Services to obtain a signed Google ID Token (`id_token`).
  2. Frontend sends `POST /api/v1/auth/google` with `{ "id_token": "..." }`.
  3. Backend verifies the token signature using `google.oauth2.id_token.verify_oauth2_token(id_token, requests.Request(), GOOGLE_CLIENT_ID)`.
  4. Backend verifies audience (`aud == GOOGLE_CLIENT_ID`) and issuer (`iss in ["accounts.google.com", "https://accounts.google.com"]`).
  5. User is retrieved by verified email or created with `google_id`. If newly created, default starter categories are seeded.
  6. Backend issues standard application Access Token + HttpOnly Refresh Token.

### 6.6 Strict Multi-Tenant Data Isolation (Zero RBAC)
- There are no admin roles or bypass mechanisms.
- Every API endpoint derives identity from `get_current_active_user` dependency.
- **All SQL Queries** strictly append `where(Model.user_id == current_user.id)`:
  - `SELECT * FROM expenses WHERE id = :id AND user_id = :current_user_id`
  - `UPDATE expenses SET ... WHERE id = :id AND user_id = :current_user_id`
  - `DELETE FROM expenses WHERE id = :id AND user_id = :current_user_id`
- If an entity exists but belongs to another user, the API responds with **`404 Not Found`** (preventing user enumeration and ID manipulation attacks).

### 6.7 CORS & Rate Limiting
- **CORS Configuration**: `CORSMiddleware` configured with `allow_credentials=True` and strict origin matching (`ALLOWED_ORIGINS`). Wildcard `*` with credentials is explicitly prohibited.
- **Rate Limiting**:
  - `POST /api/v1/auth/login`: 5 requests / minute per IP.
  - `POST /api/v1/auth/register`: 3 requests / minute per IP.
  - `POST /api/v1/auth/forgot-password`: 3 requests / minute per IP.

---

## 7. API Contract Standards

All endpoints follow the standard envelope format:
```json
// Success Envelope
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}

// Error Envelope
{
  "success": false,
  "error": "Error description",
  "detail": "Granular validation or reason details"
}
```

### 7.1 Authentication Endpoints (`/api/v1/auth`)

| Endpoint | Method | Auth Required | Request Body | Response `data` | Description |
|---|---|---|---|---|---|
| `/register` | `POST` | None | `{ email, password, full_name }` | `{ user, access_token }` + Set Cookie | Register account & seed categories |
| `/login` | `POST` | None | `{ email, password }` | `{ user, access_token }` + Set Cookie | Email/Password login |
| `/google` | `POST` | None | `{ id_token }` | `{ user, access_token }` + Set Cookie | Google OAuth verification |
| `/refresh` | `POST` | Cookie | None | `{ access_token }` + Set Cookie | Token Rotation |
| `/logout` | `POST` | Cookie | None | `{ message: "Logged out" }` + Clear Cookie | Revoke current session |
| `/logout-all` | `POST` | Bearer | None | `{ message: "Logged out all" }` + Clear Cookie | Revoke all user sessions |
| `/forgot-password`| `POST` | None | `{ email }` | `{ message: "Reset link sent" }` | Request password reset token |
| `/reset-password` | `POST` | None | `{ token, new_password }` | `{ message: "Password reset" }` | Reset password via token |
| `/change-password`| `POST` | Bearer | `{ current_password, new_password }` | `{ message: "Password updated" }` | Authenticated password update |
| `/me` | `GET` | Bearer | None | `{ id, email, full_name, created_at }` | Get current user profile |

### 7.2 Expense Endpoints (`/api/v1/expenses`)

| Endpoint | Method | Query Parameters / Body | Description |
|---|---|---|---|
| `/expenses` | `GET` | `page`, `page_size`, `category_id`, `search`, `start_date`, `end_date`, `min_amount`, `max_amount`, `payment_mode`, `sort_by`, `order` | Paginated, filtered expenses belonging strictly to `current_user.id` |
| `/expenses` | `POST` | `{ title, amount, category_id, date, notes?, payment_mode? }` | Create expense linked to `current_user.id` |
| `/expenses/{id}` | `PUT` | `{ title?, amount?, category_id?, date?, notes?, payment_mode? }` | Update expense owned by `current_user.id` |
| `/expenses/{id}` | `DELETE` | None | Delete expense owned by `current_user.id` |

### 7.3 Category Endpoints (`/api/v1/categories`)

| Endpoint | Method | Query Parameters / Body | Description |
|---|---|---|---|
| `/categories` | `GET` | None | List all categories for `current_user.id` with linked expense counts |
| `/categories` | `POST` | `{ name }` | Create custom category for `current_user.id` |
| `/categories/{id}` | `PUT` | `{ name }` | Rename category owned by `current_user.id` |
| `/categories/{id}` | `DELETE` | `?reassign_to={cat_id}` or `?cascade=true` | Safe deletion: 409 Conflict if linked; reassign or cascade delete |

### 7.4 Budget Endpoints (`/api/v1/budget`)

| Endpoint | Method | Body | Description |
|---|---|---|---|
| `/budget` | `POST` | `{ period, amount_limit, category_id? }` | Set or update budget limit for `current_user.id` |
| `/budget/status` | `GET` | `?period=monthly` | Real-time budget progress, remaining balance, and alert status (`on_track`, `near_limit`, `over_budget`) |

### 7.5 Dashboard Analytics (`/api/v1/dashboard`)

| Endpoint | Method | Query Parameters | Description |
|---|---|---|---|
| `/dashboard/summary` | `GET` | `?period=day\|week\|month` | Total spend, recent expenses, and budget status for `current_user.id` |
| `/dashboard/charts` | `GET` | `?period=day\|week\|month` | Category donut data and spending trend line/bars for `current_user.id` |
| `/dashboard/comparison` | `GET` | `?period=month` | Month-over-Month comparison with percentage delta |
| `/dashboard/top-categories`| `GET`| `?period=...&limit=5` | Ranked top spend categories for `current_user.id` |
| `/dashboard/average-spend` | `GET` | `?period=...` | Normalized daily and weekly spend averages for `current_user.id` |

---

## 8. Database Design & Relational Schema

### 8.1 Table Specifications

#### 1. `users` Table
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    hashed_password VARCHAR(255) NULL,
    full_name VARCHAR(150) NOT NULL,
    google_id VARCHAR(255) NULL UNIQUE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX ix_users_email ON users(email);
CREATE INDEX ix_users_google_id ON users(google_id);
```

#### 2. `refresh_tokens` Table
```sql
CREATE TABLE refresh_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(64) NOT NULL UNIQUE,
    device_info VARCHAR(255) NULL,
    ip_address VARCHAR(45) NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    is_revoked BOOLEAN NOT NULL DEFAULT FALSE,
    revoked_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX ix_refresh_tokens_hash ON refresh_tokens(token_hash);
CREATE INDEX ix_refresh_tokens_user_id ON refresh_tokens(user_id);
```

#### 3. `password_reset_tokens` Table
```sql
CREATE TABLE password_reset_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(64) NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    is_used BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX ix_password_reset_hash ON password_reset_tokens(token_hash);
```

#### 4. `categories` Table
```sql
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_category_name_user UNIQUE (name, user_id)
);
CREATE INDEX ix_categories_user_id ON categories(user_id);
```

#### 5. `expenses` Table
```sql
CREATE TABLE expenses (
    id SERIAL PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
    date DATE NOT NULL,
    notes TEXT NULL,
    payment_mode VARCHAR(50) NULL,
    category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX ix_expenses_user_id ON expenses(user_id);
CREATE INDEX ix_expenses_date ON expenses(date);
CREATE INDEX ix_expenses_category_id ON expenses(category_id);
```

#### 6. `budgets` Table
```sql
CREATE TABLE budgets (
    id SERIAL PRIMARY KEY,
    period VARCHAR(20) NOT NULL DEFAULT 'monthly',
    amount_limit NUMERIC(10, 2) NOT NULL CHECK (amount_limit > 0),
    category_id INTEGER NULL REFERENCES categories(id) ON DELETE SET NULL,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX ix_budgets_user_id ON budgets(user_id);
```

---

## 9. Frontend Client Interceptor & Session Lifecycle

### 9.1 Silent Token Refresh Protocol (`apiFetch`)
```
Request triggered
   │
   ├─► Attach Authorization: Bearer <accessToken>
   │
   ▼
Server returns response
   │
   ├─► Status 200/201: Return Data
   │
   └─► Status 401 (Unauthorized):
         │
         ├─► Lock concurrent requests (Queue mechanism)
         ├─► Call POST /api/v1/auth/refresh (Cookie sent automatically)
         │     │
         │     ├─► 200 OK: Update in-memory AccessToken, replay queued requests
         │     │
         │     └─► 401/403 Failed: Clear AuthContext, redirect to /login
```

---

## 10. Verification & Test Plan

1. **Unit & Security Tests (`pytest`)**:
   - `test_register_success`: Verifies password hashing and default category creation.
   - `test_login_invalid_password`: Verifies 401 on bad credentials.
   - `test_refresh_token_rotation`: Verifies that using a refresh token revokes it and produces a new valid hash.
   - `test_refresh_token_revocation`: Verifies logout prevents subsequent refresh calls.
   - `test_user_data_isolation`: Verifies that User A receives 404 when querying/modifying User B's expenses.
2. **E2E & Frontend Flow**:
   - Google Sign-In button flow with verified token payload.
   - Complete login -> dashboard -> log expense -> logout cycle.
   - Cross-browser cookie persistence and silent token refresh.
