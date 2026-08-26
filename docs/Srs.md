# Software Requirements Specification (SRS)

## Kharcha Pani — Personal Expense Tracker

**Version:** 2.0 (Corrected — 100% aligned with PRD v2.0)
**Date:** August 2026

---

## 1. Introduction

### 1.1 Purpose

This SRS translates the Kharcha Pani PRD v2.0 into a concrete technical blueprint — tech stack, architecture, folder structures, environment configuration, API contract, UI/UX standards, and deployment strategy — so that development can proceed without ambiguity.

### 1.2 Scope

Kharcha Pani is a single-user personal expense tracking web application (V1/MVP) that allows a user to log expenses, manage self-created categories, view spending through a dashboard with charts and comparisons, and track a live budget goal. Login, multi-user support, recurring expenses, bank sync, and **data export** are explicitly out of scope for V1 (see PRD v2.0 Section 6).

### 1.3 Guiding Principle

**No hardcoded or dummy data at any stage.** All data (expenses, categories, budgets, reports) is dynamically created, stored, and fetched from the real data layer — including during development. Only default starter categories may be seeded (see Section 8.3).

---

## 2. Technology Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js (App Router) + TypeScript + Tailwind CSS |
| Backend | FastAPI (Python, async) |
| Database | PostgreSQL (hosted on Supabase) |
| ORM | SQLAlchemy 2.0 (async) |
| Migrations | Alembic |
| Form Handling | react-hook-form + zod |
| Data Fetching | TanStack React Query |
| Charts | Recharts |
| Animation | Framer Motion |
| 3D (optional, limited use) | @react-three/fiber + @react-three/drei |
| Hosting — Frontend | Vercel |
| Hosting — Backend | Render (Docker-based) |
| Hosting — Database | Supabase (managed Postgres) |

---

## 3. System Architecture

```
┌─────────────────┐        REST API (HTTPS)        ┌──────────────────┐        ┌─────────────────┐
│   Next.js App     │ ─────────────────────────────> │   FastAPI Backend  │ ─────> │  Supabase (Postgres) │
│   (Vercel)         │ <───────────────────────────── │   (Render, Docker)  │ <───── │                     │
└─────────────────┘        JSON (envelope format)    └──────────────────┘        └─────────────────┘
```

- Frontend never talks to Supabase directly — all data flows through the FastAPI backend.
- Backend uses a **pooled connection (port 6543)** for runtime queries and a **direct connection (port 5432)** for Alembic migrations.
- All environments (dev/staging/prod) are environment-variable driven — no hardcoded URLs, ports, or secrets anywhere in code.
- Since V1 is publicly hosted with no full auth layer, **every request (except `/health`) must include a shared-access key header**, validated by backend middleware (see Section 6.5).

---

## 4. Backend — Folder Structure

```
backend/
├── app/
│   ├── main.py                    # FastAPI entrypoint, CORS, router registration, access-key middleware
│   ├── core/
│   │   ├── config.py               # pydantic-settings — all env vars
│   │   ├── database.py             # async engine + session
│   │   └── security.py             # V1: shared-access-key middleware; Phase 2: replaced with real auth
│   ├── models/                     # SQLAlchemy models
│   │   ├── expense.py
│   │   ├── category.py
│   │   └── budget.py
│   ├── schemas/                    # Pydantic request/response schemas
│   │   ├── expense.py
│   │   ├── category.py
│   │   ├── budget.py
│   │   ├── dashboard.py            # MoM comparison, top categories, average spend schemas
│   │   └── response.py             # SuccessResponse / ErrorResponse / PaginatedResponse
│   ├── routers/
│   │   ├── expenses.py
│   │   ├── categories.py           # includes DELETE with ?reassign_to= support
│   │   ├── budget.py
│   │   ├── dashboard.py            # includes ?period= day|week|month
│   │   └── health.py               # /health, /health/db — NOT gated by access key
│   ├── services/                   # business logic layer
│   │   ├── expense_service.py
│   │   ├── category_service.py     # handles unused/reassign/cascade delete logic
│   │   ├── budget_service.py
│   │   └── dashboard_service.py    # totals, charts, MoM comparison, top categories, avg spend
│   ├── seed/
│   │   └── seed_categories.py      # default categories ONLY — no demo expenses
│   └── utils/
│       └── validators.py
├── alembic/
│   ├── versions/
│   └── env.py
├── tests/
│   ├── test_expenses.py
│   ├── test_categories.py          # includes reassign/cascade delete test cases
│   ├── test_budget.py
│   └── test_dashboard.py           # totals, period toggle, MoM, top categories, avg spend
├── Dockerfile
├── .dockerignore
├── .gitignore
├── .env.example
├── .env                             # gitignored
├── alembic.ini
├── requirements.txt
└── pytest.ini
```

---

## 5. Frontend — Folder Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                 # Dashboard (default route)
│   │   ├── loading.tsx
│   │   ├── error.tsx
│   │   ├── not-found.tsx
│   │   ├── access/
│   │   │   └── page.tsx             # V1 shared-access-key entry screen
│   │   ├── expenses/
│   │   │   └── page.tsx             # Expenses + Category management (modal)
│   │   └── globals.css
│   │
│   ├── components/
│   │   ├── ui/                      # Button, Input, Modal, Toast, Skeleton (primitives)
│   │   ├── common/
│   │   │   ├── ConfirmDialog.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   └── LoadingSkeleton.tsx
│   │   ├── providers/
│   │   │   └── QueryProvider.tsx
│   │   ├── expenses/
│   │   │   ├── ExpenseForm.tsx
│   │   │   ├── ExpenseList.tsx
│   │   │   ├── ExpenseCard.tsx
│   │   │   ├── ExpenseFilters.tsx
│   │   │   ├── ExpenseSearch.tsx
│   │   │   └── ExpenseDeleteDialog.tsx
│   │   ├── categories/
│   │   │   ├── CategoryList.tsx     # shows per-category expense count
│   │   │   ├── CategoryForm.tsx
│   │   │   ├── CategoryDeleteDialog.tsx  # reassign-or-cascade warning UI
│   │   │   └── CategoryManager.tsx
│   │   ├── dashboard/
│   │   │   ├── SummaryCards.tsx
│   │   │   ├── CategoryPieChart.tsx
│   │   │   ├── SpendTrendChart.tsx
│   │   │   ├── RecentExpenses.tsx
│   │   │   ├── BudgetStatus.tsx
│   │   │   ├── ReportPeriodSelector.tsx   # day/week/month toggle, drives all cards below
│   │   │   ├── MonthComparisonCard.tsx    # FR-23: MoM % change
│   │   │   ├── TopCategoriesList.tsx      # FR-24: ranked top categories
│   │   │   └── AverageSpendCard.tsx       # FR-25: avg daily/weekly spend
│   │   ├── budget/
│   │   │   ├── BudgetForm.tsx
│   │   │   └── BudgetProgress.tsx
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx          # desktop nav
│   │   │   └── HamburgerMenu.tsx    # mobile nav
│   │   └── 3d/
│   │       └── EmptyStateScene.tsx  # optional, lazy-loaded, mobile fallback required
│   │
│   ├── lib/
│   │   ├── api/
│   │   │   ├── client.ts            # attaches shared-access-key header to every request
│   │   │   ├── expenses.ts
│   │   │   ├── categories.ts
│   │   │   ├── budget.ts
│   │   │   ├── dashboard.ts
│   │   │   └── health.ts
│   │   ├── validations/
│   │   │   ├── expenseSchema.ts
│   │   │   ├── categorySchema.ts
│   │   │   └── budgetSchema.ts
│   │   ├── animations/
│   │   │   └── variants.ts
│   │   ├── constants.ts
│   │   └── utils.ts
│   │
│   ├── hooks/
│   │   ├── useExpenses.ts
│   │   ├── useCategories.ts
│   │   ├── useBudget.ts
│   │   ├── useDashboard.ts
│   │   └── useMediaQuery.ts
│   │
│   ├── types/
│   │   ├── expense.ts
│   │   ├── category.ts
│   │   ├── budget.ts
│   │   ├── dashboard.ts
│   │   └── api.ts
│   │
│   └── config/
│       └── env.ts
│
├── public/
├── tests/
│   ├── dashboard.test.tsx           # ReportPeriodSelector, MoM, top categories, avg spend
│   ├── expenses.test.tsx
│   └── categories.test.tsx          # reassign/cascade flow
├── Dockerfile
├── .dockerignore
├── .gitignore
├── .env.local.example
├── .env.local                       # gitignored
├── .eslintrc.json
├── postcss.config.js
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 6. Environment Configuration

### 6.1 Principle

No literal URL, port, secret, or credential appears anywhere in source code. All configuration is read from environment variables via `pydantic-settings` (backend) and `process.env` (frontend), validated at startup.

### 6.2 backend/.env.example

```env
# App
APP_ENV=development
DEBUG=true

# Database (Supabase)
DATABASE_URL=postgresql+asyncpg://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres?sslmode=require
DATABASE_URL_POOLED=postgresql+asyncpg://postgres:[PASSWORD]@db.xxxxx.supabase.co:6543/postgres?sslmode=require

# CORS
ALLOWED_ORIGINS=http://localhost:3000,https://kharcha-pani.vercel.app

# API
API_V1_PREFIX=/api/v1

# V1 shared-access gate (temporary, replaces real auth until Phase 2)
APP_ACCESS_KEY=change-me-to-a-long-random-value

# Render injects PORT automatically — do not hardcode
PORT=8000
```

### 6.3 frontend/.env.local.example

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_APP_ENV=development
```

### 6.4 Rules

| Rule | Reason |
|---|---|
| `.env` / `.env.local` are git-ignored | Secrets must never be committed |
| `.env.example` / `.env.local.example` are committed | Onboarding clarity for new developers |
| Missing required var → app fails to start | Silent misconfiguration is worse than a crash |
| Production secrets set only in Render/Vercel dashboards | `sync: false` in `render.yaml`, Vercel env UI for frontend |

### 6.5 Temporary Access Control (V1 Public Deployment)

Because V1 is deployed publicly (Vercel + Render + Supabase) but has **no login system**, the backend enforces a lightweight gate so the app isn't fully open to the internet:

- Every route except `/health` and `/health/db` requires header `X-App-Key: <APP_ACCESS_KEY>`.
- A FastAPI middleware in `core/security.py` checks this header against `APP_ACCESS_KEY` before the request reaches any router; mismatched/missing key → `401 Unauthorized`.
- The frontend prompts once for this key on first visit (`/access` page), stores it in memory/cookie for the session, and the API client attaches it to every request automatically.
- **This is explicitly a stop-gap, not real authentication.** It is fully replaced by proper login/session auth in Phase 2 (PRD Section 13).

---

## 7. API Contract Standards

### 7.1 Versioning

All routes are prefixed `/api/v1/...` to allow non-breaking evolution in later phases.

### 7.2 Response Envelope

```json
// Success
{ "success": true, "data": { ... }, "message": null }

// Error
{ "success": false, "error": "Validation failed", "detail": "Amount must be positive" }
```

### 7.3 Pagination Contract

Paginated endpoints return the pagination object **nested inside `data`** — never as a top-level shape on its own:

```json
{
  "success": true,
  "data": {
    "items": [ ... ],
    "total": 124,
    "page": 1,
    "page_size": 20,
    "has_next": true
  },
  "message": null
}
```

Query pattern: `GET /api/v1/expenses?page=1&page_size=20&sort_by=date&order=desc&category=Food`

### 7.4 Dashboard Endpoints

| Endpoint | Purpose |
|---|---|
| `GET /api/v1/dashboard/summary?period=day\|week\|month` | Total spend, recent expenses, budget status for the selected period |
| `GET /api/v1/dashboard/charts?period=...` | Pie (by category) + trend (over time) chart data |
| `GET /api/v1/dashboard/comparison?period=month` | FR-23 — current vs previous period totals + % change |
| `GET /api/v1/dashboard/top-categories?period=...&limit=5` | FR-24 — ranked category spend |
| `GET /api/v1/dashboard/average-spend?period=...` | FR-25 — normalized average spend per day/week |

### 7.5 Category Deletion Contract

`DELETE /api/v1/categories/{id}`

| Query Param | Behavior |
|---|---|
| *(none)*, category unused | Deletes immediately |
| *(none)*, category has linked expenses | Returns `409 Conflict` with `{ "linked_expense_count": N }` — frontend shows warning dialog |
| `?reassign_to={other_category_id}` | Reassigns all linked expenses to the target category, then deletes the category |
| `?cascade=true` | Deletes the category **and** all linked expenses (after explicit user confirmation) |

### 7.6 Health Endpoints

| Endpoint | Purpose |
|---|---|
| `GET /health` | Liveness — app process is running (no access key required) |
| `GET /health/db` | Readiness — database connection is alive (no access key required; used by Render health checks) |

### 7.7 Documentation

FastAPI auto-generates OpenAPI/Swagger at `/docs` and `/redoc`. Every endpoint must declare a `response_model` so the contract stays accurate without manual documentation drift.

---

## 8. Database Design

### 8.1 ORM & Migrations

- SQLAlchemy 2.0 (async, declarative with `Mapped[]` typing)
- Alembic for all schema changes — no manual DDL, no hand-edited tables
- `Amount` fields use `Numeric(10,2)`, never `Float` (money precision)
- Every table includes `user_id` (default = 1 in V1) to keep Phase 2 login migration non-breaking

### 8.2 Core Tables

| Table | Key Fields |
|---|---|
| `users` | id, (auth fields added in Phase 2) |
| `categories` | id, name, is_default, user_id |
| `expenses` | id, title, amount, category_id (FK), date, notes, payment_mode, user_id |
| `budgets` | id, period, amount_limit, category_id (nullable = overall), user_id |

### 8.3 Seed Policy

Only default starter categories (Food, Transport, Rent, Utilities, Entertainment, Other) may be seeded, marked `is_default = true`. **No fake expenses, no dummy budgets** — this directly satisfies PRD requirement FR-30.

---

## 9. UI/UX Requirements

### 9.1 Form Validation

- `react-hook-form` + `zod`, validation mode: `onChange`
- Rules mirror backend Pydantic validation exactly: positive amount, no future date, required title/category
- Errors shown inline; toast (`sonner`) for submit-level failures

### 9.2 Animation — Framer Motion (centralized in `lib/animations/variants.ts`)

| Area | Animation |
|---|---|
| Expense list add/remove | `AnimatePresence` + `layout` — fade/slide in, slide-out on delete |
| Dashboard totals | Count-up animation on value change |
| Budget progress bar | Animated width + color transition (green → yellow → red) |
| Category pills | `whileTap={{ scale: 0.95 }}` |
| Modals/drawers | Slide-up (mobile), fade+scale (desktop) |
| Animation duration | Kept within 150–300ms — never longer |

### 9.3 Micro-interactions

- Button hover: subtle scale/shadow lift
- Input focus: smooth border/glow transition
- Success states: checkmark animation; budget-goal-achieved gets a celebratory moment
- Skeleton loaders (not spinners) for dashboard/list data fetches
- Friendly empty state (real, dynamic — never a hardcoded placeholder record)

### 9.4 Responsive Design (all devices)

- Tailwind CSS, mobile-first breakpoints
- Mobile: stacked charts, card-based expense list, `HamburgerMenu` (slide-in drawer)
- Desktop: side-by-side chart grid, table-based expense list, persistent `Sidebar`
- Minimum 44×44px touch targets on mobile
- `useMediaQuery` hook drives conditional rendering between Sidebar/HamburgerMenu

### 9.5 3D (limited, purposeful use only)

- `@react-three/fiber` + `@react-three/drei`, used **only** for empty-state illustration or a budget-goal-achieved celebration
- Never used for charts (Recharts/2D stays authoritative for data readability)
- Lazy-loaded (`dynamic(..., { ssr: false })`), with a static image fallback on mobile for performance

---

## 10. Deployment Strategy

### 10.1 Stage 1 — Local Development (No Docker)

- Local PostgreSQL instance (or local Supabase CLI) for iteration
- Backend: `uvicorn app.main:app --reload --port 8000`
- Frontend: `npm run dev`
- Full CRUD, dashboard, and validation flow manually verified before moving to containerization
- Access-key middleware can be disabled locally via `APP_ENV=development` for faster iteration, but must be re-enabled before any deployed environment

### 10.2 Stage 2 — Docker (Deployment Parity)

- Separate Dockerfiles for `backend/` and `frontend/`
- `docker-compose.yml` retained for local container-parity testing only, not for production

### 10.3 Production Hosting

| Component | Platform | Notes |
|---|---|---|
| Frontend | Vercel | Auto preview deployments per branch; env vars set in dashboard |
| Backend | Render | Docker-based; `render.yaml` for infra-as-code; `/health` used for health checks; free tier has cold starts |
| Database | Supabase | Pooled connection (6543) for app runtime, direct (5432) for migrations; `sslmode=require` |

V1 is intentionally deployed publicly for accessibility, and is protected by the shared-access-key gate described in Section 6.5 — this resolves the earlier conflict between "no public exposure" and cloud hosting by making public hosting safe rather than forbidding it.

### 10.4 CORS

`ALLOWED_ORIGINS` must include both the Vercel production URL and `localhost:3000` for local testing against a deployed backend.

---

## 11. Version Control — .gitignore Policy

**Backend, Frontend, and Root each maintain their own `.gitignore`.** Environment files (including `APP_ACCESS_KEY`), dependency directories, build artifacts, caches, and OS files are excluded; `.env.example` files are the only environment-related files committed.

---

## 12. Non-Functional Requirements (carried from PRD)

- Dashboard and reports must load from real, database-driven data at any data volume
- Architecture must support later phases (login, recurring expenses, multi-currency) without major rework
- No hardcoded or dummy data in any phase, at any layer
- Every module (backend routes, frontend components/hooks) must be independently testable
- Each phase follows Run → Test → Deploy before the next phase begins
- The V1 access-key gate must not silently fail open — a missing/misconfigured `APP_ACCESS_KEY` must fail app startup, not skip the check

---

## 13. Testing Strategy

| Layer | Tooling |
|---|---|
| Backend | `pytest` + `httpx.AsyncClient` — one test file per router (expenses, categories, budget, **dashboard**) |
| Frontend | Component/hook tests under `frontend/tests/` (dashboard, expenses, categories) |
| API Contract | Swagger (`/docs`) cross-checked against frontend `types/api.ts` |
| Manual E2E (V1) | Full add → view → edit → delete → dashboard-reflects-change flow, category delete with reassign/cascade, on both mobile and desktop breakpoints |

---

## 14. Definition of Done (V1) — carried from PRD

- Full expense CRUD working end-to-end
- Dynamic categories: create, edit, delete (with reassign-or-cascade guard and warning)
- Dashboard: total spend, recent expenses, at least 2 charts, MoM comparison, top categories, average spend, live budget status
- Daily/Weekly/Monthly period toggle functional across the dashboard
- Search + at least 2 filters + at least 2 sort options, usable together
- Budget goal with live remaining balance and status indicator
- Navigation functional across breakpoints
- Amount/date validation enforced on both frontend and backend
- Shared-access-key gate protects all non-health routes
- Zero hardcoded/demo data anywhere in the app
- Backend tests exist for all four routers; frontend tests exist for dashboard, expenses, categories
- Deployed (Vercel + Render + Supabase) and verified end-to-end before Phase 2 begins

---

## 15. Future Phases (Reference — see PRD v2.0 Section 13)

Real login (replacing the shared-key gate) & sync, income tracking, recurring expenses, **report export**, social/shared budgets, AI-based prediction, multi-currency, biometric lock, and monetization are explicitly deferred beyond V1 and must not be pulled forward into this scope.
