# Product Requirements Document (PRD)

## Kharcha Pani — Personal Expense Tracker

**Version:** 3.8 (Enterprise AI Suite: Predictive Cash Flow Runway, Indian Tax 80C/80D Advisor, Multi-Lingual Voice "बोली खर्चा", Spotify-Wrapped Monthly Digest, Vision Receipt Scanner, "Kharcha Guru" AI Assistant)


---

### 1. Overview / Introduction

**Product Name:** Kharcha Pani

**Summary:** Kharcha Pani is a secure personal finance web app that lets individual users sign up, log daily expenses, organize them into personal categories, track a live budget, analyze spending patterns, and receive personalized AI financial recommendations and spending forecasts — with guaranteed private data isolation so that each user's financial records are strictly visible only to themselves.

### 2. Problem Statement

Most people don't track their expenses properly and struggle to gain meaningful, actionable insights from raw tables of numbers:
- They need their financial data to be 100% private and protected from other users.
- They want frictionless access via Email/Password or 1-click **Google Sign-In**.
- They want fast, effortless expense entry via natural language and voice commands.
- They need smart, personalized **AI recommendations** (e.g. overspending alerts, savings tips, month-end forecast) driven by their actual real data without hardcoding.
- The AI layer must be **provider-independent and environment-driven** so models (Gemini, Claude, OpenAI, Local LLMs) can be swapped seamlessly.

### 3. Core Product Loop & Scope Evolution

- **V1 (Completed MVP):** Core Loop (Log expense → Visual charts → Live budget tracking with temporary access key).
- **Phase 2 (Completed):** Real Production-Ready Authentication (Sign Up, Login, Google 1-Click Login, Forgot/Reset Password, Multi-Device Logout), Mandatory Email Verification Gate, and **Strict User Data Privacy / Isolation**.
- **Phase 3 (Active Focus):** **Provider-Agnostic AI Engine & Smart Financial Intelligence** (Natural Language Quick Add, Voice Logging, AI Financial Recommendations, Spending Velocity Forecast, and Saving Opportunities).

### 4. Goals

| Goal | Why It Matters |
|---|---|
| 1-Click Google Sign-In & Email Sign-Up | Fast, frictionless onboarding |
| 100% Private Financial Data Isolation | User A never sees User B's spending, budget, or categories |
| AI Quick Add with Voice Input | Log an expense in under 3 seconds using natural language |
| AI Recommendations & Insights | Actionable financial guidance (overspending alerts, saving tips) from real data |
| Provider-Agnostic Architecture | Seamlessly switch between Gemini, OpenAI, Claude, or Local LLMs via `.env` |
| Safe, Persistent Login Sessions | User stays logged in securely without exposing sensitive tokens |
| Visual charts & Live budget tracking | Clear insights into spending habits |

---

### 6. Scope (Phase 3 Current Scope)

**In-Scope:**
- **Provider-Agnostic AI Architecture:**
  - Pluggable AI Provider Interface (`BaseAIProvider`, `GeminiProvider`, `LocalNLPProvider`, extensible for `OpenAIProvider`, `ClaudeProvider`).
  - Environment-driven provider selection (`AI_PROVIDER=gemini`, `GEMINI_API_KEY`, etc.).
- **AI Financial Recommendations & Spending Insights:**
  - Real-time spending health score and category overspending anomalies.
  - Month-end expense forecasting based on user's current velocity.
  - 3-5 concrete, personalized actionable recommendations to save money.
  - Zero hardcoded business data; calculated dynamically from the user's active database records.
- **Natural Language & Voice Quick Add:**
  - Multi-lingual text & voice parsing (English, Hinglish, Marathi) into structured expense entries.
  - Instant 1-click expense creation with category matching and payment mode detection.
- **User Accounts, Authentication & Isolation:**
  - Email verification, password reset, Google OAuth 2.0 / FedCM, token rotation, and multi-tenant data isolation.

**Out-of-Scope (Deferred to Future Phases):**
- Split expenses between multiple users / shared wallets (Phase 4)
- Bank / SMS / UPI auto-import (Phase 5)
- Automated bill notifications & recurring scheduler (Phase 6)

---

### 7. Functional Requirements & User Stories

#### 7.0 User Authentication & Privacy (Phase 2)

| ID | User Story | Requirement (Non-Technical) | Priority |
|---|---|---|---|
| FR-A1 | User Registration | As a new user, I can create an account using my name, email, and a secure password. Upon registration, common starter categories (Food, Travel, Rent, etc.) are automatically set up for me. | P0 |
| FR-A2 | User Login | As a registered user, I can log into my account securely using my email and password. | P0 |
| FR-A3 | 1-Click Google Sign-In | As a user, I can sign in or sign up with one click using my Google account. | P0 |
| FR-A4 | Secure Session Persistence | As a user, I remain logged in securely so I don't have to re-enter my credentials every few minutes. | P0 |
| FR-A5 | Complete Data Privacy | As a user, all my expenses, custom categories, budgets, and dashboard statistics are 100% private to my account. No other user can view or modify my data. | P0 |
| FR-A6 | Logout (Current / All Devices) | As a user, I can log out of my current device or choose "Log out from all devices" if I lose a device. | P0 |
| FR-A7 | Forgot & Reset Password | As a user, if I forget my password, I can request a secure reset link via email to create a new password. | P1 |
| FR-A8 | Change Password | As an active user, I can update my password by providing my current password and choosing a new one. | P1 |

---

**FR-1 — Hamburger menu (mobile) / Sidebar (desktop)**

Requirement: Responsive navigation with two sections: Dashboard (view-only summary) and Expenses (add/edit/delete/search/filter/sort). Hamburger drawer on mobile, persistent sidebar on desktop.

**Priority:** P0

**User Story:** As a user, I want a simple menu so I can move between my Dashboard and my Expenses easily, on any device.

#### 7.2 Expense Fields & Validation

| Field | Description |
|---|---|
| Title | Short description (e.g. "Groceries") |
| Category | Dynamic; pick an existing one or create a new one |
| Amount | How much was spent |
| Date | Defaults to today, can be changed |
| Notes (optional) | Any extra detail |
| Payment Mode (optional) | e.g. Cash, Card, UPI |

| Validation Rule | Why | Enforced Where |
|---|---|---|
| Amount must be a positive number | Prevents bad data from skewing totals and charts | Frontend (zod) + Backend (Pydantic) |
| Date cannot be in the future | Keeps the log honest to actual spending | Frontend (zod) + Backend (Pydantic) |

#### 7.3 Expense CRUD

| ID | Action | Description | Priority |
|---|---|---|---|
| FR-2 | Add | Create a new expense entry | P0 |
| FR-3 | View | See all logged expenses in a paginated list | P0 |
| FR-4 | Edit | Update any field of an existing expense | P0 |
| FR-5 | Delete | Remove an expense, with a confirmation step to avoid deleting by mistake | P0 |

#### 7.4 Category Management

| ID | Action | Description | Priority |
|---|---|---|---|
| FR-6 | Create | Add a new category by name while logging an expense, or from a category list | P0 |
| FR-7 | Edit | Rename an existing category | P0 |
| FR-8 | Delete | Remove a category. If unused, delete directly. **If linked to expenses, the user must either (a) reassign all linked expenses to another category, or (b) cascade-delete those expenses — with an explicit warning stating the expense count affected before either action proceeds** | P0 |
| FR-9 | View | See the list of categories, each showing how many expenses use it | P1 |
| FR-10 | Default Categories | Ship with a few common starter categories (Food, Transport, Rent, Utilities, Entertainment, Other), seeded once, marked as default | P2 |

#### 7.5 Search, Filter & Sort

All capabilities below work together (e.g. filter by "Food" category, then sort by highest amount).

| ID | Capability | Details | Priority |
|---|---|---|---|
| FR-11 | Search | By title or notes text | P1 |
| FR-12 | Filter — Date Range | e.g. this week, this month | P0 |
| FR-13 | Filter — Category | Isolate spend on a specific category | P0 |
| FR-14 | Filter — Amount Range | Narrow down to a spend bracket | P1 |
| FR-15 | Filter — Payment Mode | Separate cash vs card vs UPI spend | P1 |
| FR-16 | Sort | By amount, date, or category | P1 |

#### 7.6 Dashboard

| ID | Requirement | Why | Priority |
|---|---|---|---|
| FR-17 | Total amount spent (overall, and current month by default) | The single most-asked question: "how much did I spend?" | P0 |
| FR-18 | Quick view of recent expenses | Snapshot without opening the full list | P0 |
| FR-19 | Pie/donut chart — spending by category | Instantly shows where money is going | P0 |
| FR-20 | Bar/line chart — spending over time | Reveals patterns and spikes across days/months | P0 |
| FR-21 | Budget status vs goal | Turns the dashboard into a budgeting tool, not just a log | P0 |
| FR-22 | Daily/Weekly/Monthly report views — a period toggle that re-queries totals, charts, and comparisons for the selected window | Lets the user analyze spending across different time periods | P0 |
| FR-23 | Month-over-month comparison with % change | Tells the user if they're improving or not | P1 |
| FR-24 | Top categories by spend, ranked (top 3–5) | Surfaces the biggest spending areas without digging | P1 |
| FR-25 | Average daily/weekly spend for the selected period | Gives a normalized sense of spending pace | P2 |

#### 7.7 Budget / Spending Goal

| ID | Requirement | Priority |
|---|---|---|
| FR-26 | Set an overall monthly budget goal and per-category budget limits | P0 |
| FR-27 | Live remaining-balance tracking as expenses are added | P0 |
| FR-28 | Alert/status indicator when nearing (≥80%) or exceeding (≥100%) a limit | P1 |

#### 7.8 Data Integrity Principle

| ID | Requirement | Priority |
|---|---|---|
| FR-30 | No hardcoded/demo data at any stage — all data is dynamically created, stored, and fetched from the real data layer | P0 |

#### 7.9 AI Financial Recommendations & Smart Insights (Phase 3)

| ID | Requirement | Description | Priority |
|---|---|---|---|
| FR-AI1 | Provider-Agnostic AI Engine | Abstracted AI Service supporting Gemini 1.5 Flash, Local Rule-Engine, and extensible to Claude/OpenAI/Groq via `.env` settings (`AI_PROVIDER`). | P0 |
| FR-AI2 | Real-Time Spending Insights | Evaluates user's real transactions to provide a Financial Health Score (0-100), key spending summary, and positive/warning signals. | P0 |
| FR-AI3 | Month-End Expense Forecast | Projects total expected monthly spend based on daily velocity ($v = \text{spent} / \text{days\_elapsed} \times \text{total\_days}$) and alerts if budget will be exceeded. | P0 |
| FR-AI4 | Category Optimization Tips | Generates 3-5 prioritized, concrete actionable recommendations for saving money based on highest non-essential spend categories. | P0 |
| FR-AI5 | Natural Language "Quick Add" | Parses plain text/voice sentences into structured expense entries with automatic category matching and payment mode detection. | P0 |
| FR-AI6 | Zero-Trust Data Privacy | AI prompt only receives aggregated financial statistics of the authenticated user (`WHERE user_id == current_user.id`). No cross-tenant data leak. | P0 |

#### 7.10 Next-Gen AI Financial Suite (v3.7)

| ID | Requirement | Description | Priority |
|---|---|---|---|
| FR-AI7 | Smart Receipt & Bill Scanner | Multimodal Vision AI (`POST /api/v1/ai/receipt-scan`) extracting merchant, amount, date, payment mode, tax, and itemized lines from images/PDFs with auto-category mapping. | P0 |
| FR-AI8 | "Kharcha Guru" AI Chatbot | Interactive financial assistant (`POST /api/v1/ai/chat`) answering natural language queries in English/Hinglish/Marathi with contextual transaction data and mini-charts. | P0 |
| FR-AI9 | Subscriptions & EMI Detector | AI frequency detector (`GET /api/v1/ai/subscriptions`) analyzing cadence of recurring charges (Netflix, Spotify, Gym, Rent, SIP, EMI) with annual drain projections. | P0 |
| FR-AI10 | Goal-Based Savings Simulator | AI goal planner (`POST /api/v1/ai/savings-goal`) calculating category spending cuts to achieve target dream purchases within defined timelines. | P0 |
| FR-AI11 | 50/30/20 Rule Classifier | Real-time classification of transactions into Needs (50%), Wants (30%), and Savings (20%) with visual distribution gauge. | P0 |

### 8. Key User Flows

| Flow | Steps |
|---|---|
| Add an expense | Expenses → Add New → Fill form (pick or create a category) → Save → Expense appears in list, dashboard totals update |
| Check spending | Dashboard → Select period (day/week/month) → See total spent, charts, MoM comparison, top categories, and budget status |
| Find a past expense | Expenses → Search / Filter / Sort → Find it → Edit or Delete |
| Set a budget goal | Set spending limit → Dashboard shows remaining balance, updates live as expenses are added |
| Delete a category in use | Categories → Delete → Warning shows affected expense count → Choose "Reassign to..." or "Delete expenses too" → Confirm |

### 9. Non-Functional Requirements

- **Performance:** Dashboard and reports must load with real, database-driven data (no hardcoded/static values) at any data volume.
- **Scalability:** Architecture should support later phases without major rework.
- **Data Integrity:** No hardcoded or dummy data in any phase.
- **Testability:** Every feature/module must be independently testable before deployment, including automated backend tests for every router (expenses, categories, budget, **and dashboard**).
- **Reliability:** Each phase must be fully functional (run → test → deploy) before the next phase begins.
- **Deployment (V1):** V1 **is publicly hosted** (Vercel + Render + Supabase) for accessibility during development and personal use. Because there is no full login/auth system yet, the app is protected by **a lightweight shared-access key** (a single app-wide secret required to use the app) rather than being left fully open. This is a stop-gap, not a substitute for Phase 2 login.

### 9.1 Development Principle

No hardcoded/dummy data in any phase. All data (expenses, categories, budgets, reports) must be dynamically created, stored, and fetched from the actual data layer, even in early phases.

Every phase must independently follow the **Run → Test → Deploy** cycle before moving to the next phase.

### 10. Definition of Done (V1)

- User can Add, View, Edit, and Delete expenses
- Categories are dynamic — user can create, edit, and delete (with reassign/cascade warning) their own
- Dashboard shows total spend, a recent-expenses snapshot, at least 2 charts, MoM comparison, top categories, and average spend
- Daily/Weekly/Monthly period toggle works across the whole dashboard
- Expenses section supports search + at least 2 filters + at least 2 sort options, usable together
- User can set a budget goal and see a live remaining balance with status (on track/near limit/over budget)
- Navigation works between Dashboard and Expenses on both mobile and desktop
- Amount and date fields are validated (positive amount, no future dates) on both frontend and backend
- No hardcoded/demo data anywhere in the app — all data is live and dynamic
- Shared-access key protects the publicly deployed app
- Backend has automated tests for all four routers (expenses, categories, budget, dashboard)
- Deployed and tested end-to-end before moving to Phase 2

### 11. Assumptions & Risks

**Assumptions:**

- Single-user app in V1 — no login needed, protected instead by a shared access key
- One fixed currency (e.g. INR) — no multi-currency support in V1
- Budget goal defaults to monthly
- Expense date should be today or earlier (not future-dated)
- V1 is deployed publicly (Vercel + Render + Supabase), gated by a shared key — not left fully open

**Risks:**

- Scope creep if later-phase features get pulled into V1
- Data accuracy risk if hardcoded/test data isn't fully replaced with real data before deployment
- The shared-access key is not real authentication — if leaked, anyone with it can see/edit the data. This risk is accepted for V1 and must be resolved by proper login in Phase 2
- Security risk with financial data once multi-device sync is introduced, if auth isn't properly tested each phase

### 12. Stakeholders

- Product Owner
- Development Team
- QA/Testing Team
- End Users (primary feedback source for each phase)

### 13. Future Scope — Phase-wise Roadmap

| Phase | Theme | Features | Run-Test-Deploy Requirement |
|---|---|---|---|
| Phase 1 (V1 / MVP) | Core Loop | Full expense CRUD, dynamic categories, dashboard with charts + MoM + top categories + avg spend, search/filter/sort, budget goal with live balance, responsive navigation, shared-key access gate | Build with live data layer, unit + integration test, deploy as standalone working app |
| Phase 2 | Login, Sync & Convenience | Real login & multi-device sync (replacing the shared-key gate), income tracking, recurring expenses, receipt photo upload, multiple wallets/accounts, **report export (PDF/Excel/CSV)**, dark mode | Each feature tested against real stored data, deployed as an update to Phase 1 app |
| Phase 3 | Social/Sharing | Split expenses (roommates/friends), shared budgets, multi-user/family accounts | Multi-user data flow tested for accuracy before deployment |
| Phase 4 | Smart & Advanced | Savings goals, multi-currency support, AI-based spend prediction, auto-categorization, bank/UPI/SMS auto-import, budget notifications, calendar heatmap, year-view trends | AI/ML and integration modules tested independently, then deployed with monitoring |
| Phase 5 | Security & Personalization | Biometric lock, cloud backup, custom themes, reminders/notifications | Security features tested for edge cases before deployment |
| Phase 6 | Monetization | Free vs Premium plans, ads (free tier), payment/subscription flow | Payment/subscription flow tested in sandbox before production deployment |

### 14. Dependencies

- Database/backend for persistent storage of expenses, categories, budgets
- Charting library for dashboard visualizations (pie/donut + bar/line)
- Shared-access-key middleware (V1 stop-gap) → replaced by real authentication mechanism (Phase 2 onward)
- Export library for CSV/PDF/Excel — **Phase 2 only, not a V1 dependency**
- Notification system (Phase 5)
- Payment gateway (Phase 6)

### 15. Timeline

| Phase | Estimated Duration |
|---|---|
| Phase 1 (V1 / MVP) | To be defined based on team capacity |
| Phase 2 | To be defined post Phase 1 review |
| Phase 3 | To be defined post Phase 2 review |
| Phase 4 | To be defined post Phase 3 review |
| Phase 5 | To be defined post Phase 4 review |
| Phase 6 | To be defined post Phase 5 review |
