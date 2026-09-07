# Kharcha Pani — Repository Memory & Knowledge Context

**Last Updated:** September 7, 2026  
**Active Architecture Version:** v4.0 (Universal Multi-User SaaS, Enterprise AI Suite: Financial Health Score & Diagnostics, Burn Rate & Budget Forecast Engine, Expense Sentiment & Emotional Spending Analyzer with Emojis & Remorse Detection, Multi-Lingual Voice Assistant "बोली खर्चा", Spotify-Wrapped Monthly Money Digest, Multimodal Vision Receipt Scanner, "Kharcha Guru" Interactive AI Chatbot, Cash Flow Forecaster, Smart Indian Tax 80C/80D Advisor, Recurring Subscriptions & EMI Detector, Goal Savings Simulator, Smart Real-time Auto-Categorization & Auto-Seeded Category Engine)

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

## ⚡ 2. AI Architecture & Intelligence (v4.0)

1. **Provider-Agnostic Interface (`app/services/ai/base_provider.py`)**:
   - `BaseAIProvider`: Abstract contract for `parse_expense`, `generate_recommendations`, `scan_receipt`, `chat_query`, `detect_subscriptions`, `simulate_savings_goal`, `analyze_financial_health`, `forecast_budget_burn`, and `analyze_expense_sentiment`.
   - `GeminiAIProvider`: Uses Google Gemini 1.5 Flash REST API with structured schema outputs (`temperature=0.2`).
   - `LocalNLPAIProvider`: 100% offline mathematical and heuristic analyzers for every feature with zero external API dependencies.
   - `AIService`: Dynamic factory router selecting active provider via `settings.AI_PROVIDER` (`gemini` or `local_nlp`) with resilient fallback.

2. **Core AI Modules & Endpoints**:
   - `GET /api/v1/ai/financial-health`: 0-100 Score, 50/30/20 Rule compliance, emergency fund runway, savings rate, and prioritized health actions.
   - `GET /api/v1/ai/budget-forecast`: Spending velocity, projected month-end deficit, safe daily burn limits, category runways.
   - `GET /api/v1/ai/expense-sentiment`: Emotional motive extraction with emojis (`🤩`, `⚡`, `😢`, `😤`, `😌`), buyer's remorse indicators, peak spending heatmaps, and CBT nudges.
   - `POST /api/v1/ai/voice-expense`: Speech-to-expense in Marathi, Hindi & English with instant transaction creation.
   - `GET /api/v1/ai/money-digest`: Gamified story cards, persona badges, spending highlights, and savings wins.
   - `POST /api/v1/ai/receipt-scan`: Multimodal OCR bill and receipt digitizer.
   - `POST /api/v1/ai/chat`: "Kharcha Guru" conversational advisor.
   - `POST /api/v1/ai/cashflow-forecast`: 30-day runway projection & zero-day burn timeline.
   - `POST /api/v1/ai/tax-advisor`: 80C, 80D, HRA deductions, Old vs New Regime optimizer.
   - `GET /api/v1/ai/subscriptions`: Recurring bill & EMI pattern detection.
   - `POST /api/v1/ai/savings-goal`: "What-If" timeline & monthly savings solver.
   - `POST /api/v1/ai/quick-parse` & `GET /api/v1/ai/recommendations`: Quick natural language logging and overview insights.

---

## 🔒 3. Authentication, Multi-Tenancy & Data Integrity

1. **Access Token (JWT):** Lifespan 15 minutes (`HS256`, payload `{"sub": "<user_id>", "email": "<email>"}`).
2. **Refresh Token & Cross-Origin Cookies:** Lifespan 30 days (`HttpOnly`, `SameSite=none`, `Secure=True` cookie + JSON body fallback). SHA-256 hash stored in DB.
3. **Email Verification Gatekeeper:** Accounts start as `is_verified = False`. `/login` blocks unverified users with HTTP 403 Forbidden.
4. **Zero-Trust Multi-Tenant Isolation:** Identity derived exclusively from JWT via `get_current_active_user`. All DB operations enforce `WHERE model.user_id == current_user.id`.
5. **Category Resilience & Auto-Seeding:**
   - `CategoryService.get_user_categories`: Automatically checks and seeds the 6 core default categories (`Food`, `Transport`, `Rent`, `Utilities`, `Entertainment`, `Other`) if missing.
   - `ExpenseForm.tsx`: Real-time keyword auto-matching without forced default selection.

---

## 🎨 4. UI/UX Design System & Theme Engine

1. **Light & Night Mode Theme Engine (`ThemeProvider.tsx`, `ThemeToggle.tsx`):**
   - **Night Mode (Dark):** Obsidian `#070b14` background, deep slate `#0f172a` surfaces, emerald neon accents, glassmorphic cards.
   - **Day Mode (Light):** Pure crystal `#f8fafc` background, crisp slate `#0f172a` typography.
2. **AI Dashboard Component Suite:**
   - `FinancialHealthModal.tsx`: Health score gauge, 50/30/20 breakdown, emergency fund assessment.
   - `BudgetBurnForecastModal.tsx`: Daily burn rate dial, projected overspend alerts, category runways.
   - `ExpenseSentimentModal.tsx`: Emotional spending badges with emojis, remorse flags, peak hours heatmap, CBT advice.
   - `VoiceExpenseModal.tsx`: Voice recorder modal with real-time waveform and multi-lingual parsing.
   - `MoneyDigestModal.tsx`: Spotify-Wrapped style interactive slide deck.
   - `ReceiptScanModal.tsx`: Drag-and-drop bill scanner with live OCR preview.
   - `KharchaGuruChat.tsx`: Conversational AI chat with suggestion chips.
   - `CashFlowForecastModal.tsx`: Runway timeline and zero-day alert.
   - `TaxAdvisorModal.tsx`: Tax regime comparison and deduction gauges.
   - `SubscriptionsCard.tsx`: Recurring bill tracker card.
   - `SavingsGoalSimulator.tsx`: Goal timeline and monthly deposit calculator.
   - `AIInsightsCard.tsx` & `QuickAddModal.tsx`: Primary dashboard AI cards.

---

## 📁 5. Core File Map

| Path | Purpose |
|---|---|
| `backend/app/services/ai/base_provider.py` | `BaseAIProvider` abstract contract |
| `backend/app/services/ai/gemini_provider.py` | Google Gemini 1.5 Flash Provider |
| `backend/app/services/ai/local_provider.py` | Local Offline NLP & Deterministic Heuristic Provider |
| `backend/app/services/ai_service.py` | Dynamic AI Provider Factory & Strategy Dispatcher |
| `backend/app/schemas/ai.py` | All AI Request/Response Pydantic Schemas |
| `backend/app/routers/ai.py` | All AI REST endpoints with tenant-isolation |
| `backend/app/services/category_service.py` | Category CRUD + Missing category auto-seeding |
| `backend/tests/test_ai_suite_v3.py` | Tests for Health, Budget Forecast, Sentiment |
| `backend/tests/test_ai_suite_v2.py` | Tests for Receipts, Chat, Subscriptions, Goals |
| `backend/tests/test_ai_recommendations.py` | Tests for AI recommendations |
| `backend/tests/test_ai_quick_parse.py` | Tests for multi-lingual expense quick-parse |
| `frontend/src/types/ai.ts` | Complete TypeScript definitions for AI features |
| `frontend/src/lib/api/ai.ts` | Complete frontend AI API client |
| `frontend/src/components/dashboard/FinancialHealthModal.tsx` | Financial Health Score Modal |
| `frontend/src/components/dashboard/BudgetBurnForecastModal.tsx` | Burn Rate & Budget Forecast Modal |
| `frontend/src/components/dashboard/ExpenseSentimentModal.tsx` | Sentiment & Emotional Spending Modal |
| `frontend/src/components/expenses/ExpenseForm.tsx` | Expense form with keyword auto-categorization |

---

## 🧪 6. Health & Testing Status

- **Backend Pytest:** 72/72 Passed (100% Green) ✅
- **Frontend TypeScript Check:** `tsc --noEmit` 0 errors ✅
- **Frontend Production Build:** `next build` 13/13 static pages generated successfully ✅
- **Git Status:** Clean tree, all changes committed and pushed to GitHub `feature/backend-database-setup` (Commit `d2bb2f4`).
