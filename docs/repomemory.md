# Kharcha Pani — Repository Memory & Knowledge Context

**Last Updated:** September 7, 2026  
**Active Architecture Version:** v3.6 (Universal Cross-Platform Multi-User SaaS, Provider-Agnostic AI Recommendations & Spending Insights Engine, Google Gemini 1.5 Flash + Local NLP Dual Engine, Natural Language "Quick Add" AI Expense Parsing, Web Speech Voice Recognition, Provider-Independent Email Service & Verification Gate, Light/Night Mode Theme Engine, 3D Interactive Physics, Dual-Mode Google OAuth 2.0 & FedCM, Cross-Origin Session Persistence & Zero-Trust Multi-Tenant Data Isolation)

---

## 🏛️ 1. Architecture & Tech Stack

```
Frontend (Next.js 14 App Router + TypeScript + Tailwind CSS + Framer Motion + Web Speech API)
   │  HTTPS (Bearer Access Token in Memory/SessionStorage + LocalStorage Fallback + Cross-Origin HttpOnly Cookie for Refresh)
   ▼
Backend (FastAPI + SQLAlchemy 2.0 Asyncpg/Aiosqlite + Uvicorn)
   │  Direct Queries strictly scoped with WHERE user_id == current_user.id
   ├─► Decoupled AI Provider Engine (BaseAIProvider -> GeminiAIProvider / LocalNLPAIProvider)
   ▼
Database (PostgreSQL / Supabase + SQLite + Alembic)
```

- **Frontend:** Next.js 14, React 18, TanStack Query v5, Recharts, Framer Motion (3D Tilt & Spring Physics), Web Speech API, Google Identity Services (GSI) Universal integration, `react-hook-form`, `zod`, `sonner`, `lucide-react`.
- **Backend:** FastAPI, Python 3.11+, SQLAlchemy 2.0 Async, `bcrypt`, `pyjwt`, `google-auth`, `httpx` (async persistent client for Google token & Gemini AI REST integration), `slowapi`, `pytest`.
- **Database Tables:** `users`, `refresh_tokens`, `password_reset_tokens`, `email_verification_tokens`, `categories` (Composite Unique `(name, user_id)`), `expenses`, `budgets`.

---

## ⚡ 2. AI Architecture & Intelligence (v3.6)

1. **Provider-Agnostic Interface (`app/services/ai/base_provider.py`)**:
   - `BaseAIProvider`: Abstract interface for `parse_expense` and `generate_recommendations`.
   - `GeminiAIProvider`: Uses Google Gemini 1.5 Flash REST API with JSON mode (`temperature=0.2`).
   - `LocalNLPAIProvider`: Deterministic offline mathematical analyzer calculating velocity, category ratios, overspending warnings, and saving suggestions.
   - `AIService`: Dynamic factory router selecting active provider via `settings.AI_PROVIDER` (`gemini` or `local_nlp`) with automatic fallback.
2. **AI Recommendations & Spending Forecast (`GET /api/v1/ai/recommendations`)**:
   - Financial Health Score (0–100) + Status badge (Excellent, Good, Fair, Attention Needed).
   - Month-End Spend Projection ($v = \text{spent} / \text{days\_elapsed} \times \text{days\_in\_month}$) vs Budget Goal.
   - 3–4 Actionable Recommendations (warnings, saving opportunities, tips, achievements).
   - Total Potential Monthly Savings calculation.
   - Strict Zero-Trust data privacy: AI prompt receives only anonymous statistical aggregates computed on server.
3. **Natural Language "Quick Add" & Voice Engine (`POST /api/v1/ai/quick-parse`)**:
   - Web Speech API voice input + suggestion chips.
   - Parses multi-lingual phrasing (English, Hinglish, Marathi) into structured expense entries.

---

## 🔒 3. Authentication & Security Engine

1. **Access Token (JWT):** Lifespan 15 minutes (`HS256`, payload `{"sub": "<user_id>", "email": "<email>"}`).
2. **Refresh Token & Cross-Origin Cookies:** Lifespan 30 days (`HttpOnly`, `SameSite=none`, `Secure=True` cookie + JSON body fallback). SHA-256 hash stored in DB.
3. **Email Verification Gatekeeper:** Accounts start as `is_verified = False`. `/login` blocks unverified users with HTTP 403 Forbidden.
4. **Zero-Trust Multi-Tenant Isolation:** Identity derived exclusively from JWT via `get_current_active_user`. All DB operations enforce `WHERE model.user_id == current_user.id`.

---

## 🎨 4. UI/UX Design System & Theme Engine

1. **Light & Night Mode Theme Engine (`ThemeProvider.tsx`, `ThemeToggle.tsx`):**
   - **Night Mode (Dark):** Obsidian `#070b14` background, deep slate `#0f172a` surfaces, emerald neon accents, glassmorphic cards.
   - **Day Mode (Light):** Pure crystal `#f8fafc` background, crisp slate `#0f172a` typography.
2. **AI Dashboard Components:**
   - `AIInsightsCard.tsx`: Glassmorphic AI insights, health score badge, spend forecast, and saving recommendations.
   - `QuickAddModal.tsx`: Voice recognition, speech-to-text, live preview card, and instant save.

---

## 📁 5. Core File Map

| Path | Purpose |
|---|---|
| `backend/app/services/ai/base_provider.py` | `BaseAIProvider` abstract interface |
| `backend/app/services/ai/gemini_provider.py` | Google Gemini 1.5 Flash Provider |
| `backend/app/services/ai/local_provider.py` | Local Offline NLP & Heuristic Provider |
| `backend/app/services/ai_service.py` | Dynamic AI Provider Factory & Dispatcher |
| `backend/app/schemas/ai.py` | `AIQuickParseRequest`, `AIRecommendationsResponse`, `RecommendationItem` |
| `backend/app/routers/ai.py` | `POST /api/v1/ai/quick-parse`, `GET /api/v1/ai/recommendations` |
| `backend/tests/test_ai_recommendations.py` | 5 unit & integration tests for AI recommendations |
| `backend/tests/test_ai_quick_parse.py` | 7 tests for multi-lingual natural language expense parsing |
| `frontend/src/types/ai.ts` | AI TypeScript definitions |
| `frontend/src/lib/api/ai.ts` | `quickParseExpense` and `getAIRecommendations` API client |
| `frontend/src/components/dashboard/AIInsightsCard.tsx` | Dashboard AI Recommendations & Insights card |
| `frontend/src/components/expenses/QuickAddModal.tsx` | Voice recognition + Suggestion chips + Live preview + Instant save |
| `frontend/src/app/page.tsx` | Dashboard view with AI Insights Card and Quick Add button |

---

## 🧪 6. Health & Testing Status

- **Backend Pytest:** 49/49 Passed (100% Green) ✅
- **Frontend TypeScript Check:** `tsc --noEmit` 0 errors ✅
- **Frontend Production Build:** `next build` 13/13 static pages generated successfully ✅
- **Git Branch:** `feature/backend-database-setup`
