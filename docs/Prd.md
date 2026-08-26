# Product Requirements Document (PRD)

## Kharcha Pani — Personal Expense Tracker

**Version:** 2.0 (Corrected — 100% aligned with SRS v2.0)

---

### 1. Overview / Introduction

**Product Name:** Kharcha Pani

**Summary:** Kharcha Pani is a personal finance web app that lets a user log daily expenses, organize them into self-created categories, and instantly see the impact on totals, charts, and a live budget — turning scattered notes/spreadsheet habits into one simple, searchable place to track spending.

### 2. Problem Statement

Most people don't track their expenses properly. They either forget to log them, or rely on tools like notes apps and spreadsheets that are hard to search, filter, or understand at a glance.

Because of this, they can't easily answer three simple questions:

- "How much have I spent?"
- "Where is my money going?"
- "Am I within my budget, or over it?"

Kharcha Pani solves this by giving the user one simple place to log expenses and instantly see the impact on their total spending and budget.

### 3. Why Keep V1 (MVP) Small?

V1 focuses only on the core loop:

**Log an expense → See it reflected in totals & charts → Track budget left**

Everything else (login, recurring expenses, notifications, multi-user support, bank sync, multi-currency, **data export**) is left for later phases. This keeps V1 simple to build, easy to test, and easy to actually use.

### 4. Goals

| Goal | Why It Matters |
|---|---|
| Add an expense in under 30 seconds | Easy logging = user actually keeps using it |
| Show spending visually | Helps the user understand "where money is going" without extra effort |
| Show a live remaining budget | Turns tracking into real budgeting, not just note-taking |
| Make old expenses easy to find | A log is useless if you can't search or filter it later |
| Build a scalable foundation | Later phases should not require rebuilding the core |

**Success Metrics:**

- Number of expenses logged per active user per week
- % of users who set a budget goal
- Time taken to add a single expense (target: under 30 seconds)
- Search/filter usage frequency
- User retention after 30 days

### 5. Target Audience

**Who this is for:**

- One person who wants to manually track their own personal spending
- Budget-conscious users trying to control overspending
- Users who want visual/report-based insight into where their money goes

**Not for (V1):**

- Teams or families sharing one account
- Businesses
- Advanced investment/finance tracking

### 6. Scope (V1 / MVP)

**In-Scope (V1):**

- Full CRUD on expenses (Add / View / Edit / Delete)
- Categories the user creates and manages themselves (not a fixed list), including delete-with-reassignment
- Dashboard with total spend + charts (pie/donut + bar/line)
- Daily / Weekly / Monthly report period toggle
- Month-over-month spend comparison with % change
- Top categories by spend, ranked
- Average daily/weekly spend
- Search, filter, and sort on expenses (usable together)
- Budget goal setting with live remaining-balance tracking + near-limit/over-budget alert indicator
- Simple navigation (hamburger menu on mobile / sidebar on desktop: Dashboard, Expenses)
- Field validation (positive amount, no future-dated expenses)
- **A lightweight, temporary access gate** (single shared app key) since V1 is publicly hosted but has no full login system yet (see Section 9)

**Out-of-Scope (V1) — fully deferred to later phases:**

- Login / multiple user accounts (Phase 2)
- Recurring or auto-scheduled expenses (Phase 2)
- Multiple currencies (Phase 4)
- Bank / UPI / SMS auto-import (Phase 4)
- Income tracking (Phase 2)
- Notifications / reminders (Phase 5)
- **Report export (PDF/Excel/CSV) — moved fully to Phase 2. Not part of V1 under any condition**, to avoid scope ambiguity.

### 7. Functional Requirements & User Stories

#### 7.1 Navigation

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
