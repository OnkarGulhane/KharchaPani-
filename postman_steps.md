# 🚀 Kharcha Pani - Postman Testing Steps (Quick Reference)

This cheatsheet outlines the essential steps to manually and automatically test the **Kharcha Pani (Expense Tracker)** backend REST APIs.

> 📖 For the full, detailed guide with schemas and examples, see **[POSTMAN_GUIDE.md](file:///e:/kharchaPani/POSTMAN_GUIDE.md)**.  
> 📦 Ready-to-import Postman Collection file: **[collection.json](file:///e:/kharchaPani/collection.json)**

---

## ⚡ Quick Start Steps

### Step 1: Start Backend Server
```powershell
cd e:\kharchaPani\backend
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

### Step 2: Import Collection in Postman
1. Open the Postman Desktop App (or VS Code Thunder Client).
2. Click **Import**.
3. Choose the file **`e:\kharchaPani\collection.json`**.

### Step 3: Recommended Testing Order
1. **0. Health & System**: Run `GET /health` and `GET /health/db` to verify service & DB status.
2. **1. Categories**: 
   - `GET /api/v1/categories` (Fetch default & custom categories)
   - `POST /api/v1/categories` (Create category)
   - `PUT /api/v1/categories/:id` (Update category)
   - `DELETE /api/v1/categories/:id` (Test guarded delete / cascade / reassign)
3. **2. Expenses**: 
   - `POST /api/v1/expenses` (Log an expense)
   - `GET /api/v1/expenses` (Test pagination, sorting & multi-filter by date/payment mode/category)
   - `PUT /api/v1/expenses/:id` (Update expense)
   - `DELETE /api/v1/expenses/:id` (Delete expense)
4. **3. Budgeting**: 
   - `POST /api/v1/budget` (Set overall and category limits)
   - `GET /api/v1/budget/status` (Check live balance & alert status: `on_track`, `near_limit`, `over_budget`)
5. **4. Dashboard & Analytics**: 
   - `GET /api/v1/dashboard/summary` (Month / Week / Day summary)
   - `GET /api/v1/dashboard/charts` (Pie chart category breakdown & trend graph data)
   - `GET /api/v1/dashboard/comparison` (Month-over-Month comparison)
   - `GET /api/v1/dashboard/top-categories` (Top 5 spending categories)
   - `GET /api/v1/dashboard/average-spend` (Daily & Weekly average burn rates)
6. **5. Error & Edge Cases**: 
   - 401 Unauthorized check (Missing/Invalid `X-App-Key`)
   - 422 Validation error (Negative amount or future date)
   - 404 Resource not found check

---

### 🔑 Required Request Headers:
- `X-App-Key`: `dev-shared-access-key-kharcha-pani` (or `{{apiKey}}`)
- `Content-Type`: `application/json`

---
> 💡 **Tip:** Use Postman's **"Run Collection"** button to execute all automated test assertions across all 20+ endpoints in a single click! ✅
