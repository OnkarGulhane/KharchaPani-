# 🚀 Kharcha Pani - Complete Postman API Testing Guide

This guide provides step-by-step instructions to test all REST APIs of **Kharcha Pani (Personal Expense Tracker)** using **Postman**, **Thunder Client**, **Insomnia**, or **cURL**.

---

## 📁 Artifacts Provided

1. **[`collection.json`](file:///e:/kharchaPani/collection.json)**: Fully configured Postman Collection (v2.1.0 schema) with 20+ ready-to-test endpoints, pre-configured variables, sample JSON payloads, and automated test assertions.
2. **[`POSTMAN_GUIDE.md`](file:///e:/kharchaPani/POSTMAN_GUIDE.md)**: This comprehensive manual and automated testing guide.
3. **[`postman_steps.md`](file:///e:/kharchaPani/postman_steps.md)**: Quick reference cheatsheet.

---

## ⚙️ Step 1: Start the Backend Server

Before testing, ensure your FastAPI backend server is running locally:

### Option A: Running with Python / Uvicorn (PowerShell)
```powershell
# Navigate to backend directory
cd e:\kharchaPani\backend

# Activate virtual environment (if using .venv)
.\.venv\Scripts\Activate.ps1

# Start FastAPI with live reload
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

### Option B: Running with Docker Compose
```powershell
cd e:\kharchaPani
docker-compose up -d backend
```

> 🔍 **Quick Checks**:
> - Swagger UI Documentation: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
> - ReDoc Documentation: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)
> - Health Check: [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)

---

## 📥 Step 2: Import `collection.json` into Postman

1. Open **Postman Desktop App** (or visit [web.postman.co](https://web.postman.co)).
2. Click the **"Import"** button in the top-left corner of the sidebar.
3. Drag and drop **`e:\kharchaPani\collection.json`** or browse to select the file.
4. Click **"Import"**. You will now see **`Kharcha Pani - Expense Tracker API Collection`** in your collections list.

---

## 🔑 Step 3: Collection Variables Configuration

The collection comes with pre-configured variables. Click on the collection name and open the **"Variables"** tab to view or customize them:

| Variable Name | Default Value | Description |
| :--- | :--- | :--- |
| `baseUrl` | `http://127.0.0.1:8000` | Backend Base URL (change to cloud URL when testing production) |
| `apiKey` | `dev-shared-access-key-kharcha-pani` | Shared secret key sent in `X-App-Key` header |
| `categoryId` | `1` | Fallback Category ID |
| `createdCategoryId` | `1` | Auto-saved by `Create Category` test script |
| `expenseId` | `1` | Fallback Expense ID |
| `createdExpenseId` | `1` | Auto-saved by `Create Expense` test script |

> 💡 **Auto-Extraction Feature**: When you run `Create Category` or `Create Expense`, the built-in test scripts automatically capture the newly created ID and store it in `createdCategoryId` / `createdExpenseId`. You do not need to copy and paste IDs manually!

---

## 🧪 Step 4: Step-by-Step API Execution Workflow

Follow this logical sequence to test the entire lifecycle:

```
┌─────────────────────────────────────────────────────────────┐
│ 0. Health & DB Check  ──>  1. Categories CRUD               │
│                                  │                          │
│                                  ▼                          │
│ 3. Budget Limits      <──  2. Expenses CRUD & Multi-Filters │
│        │                                                    │
│        ▼                                                    │
│ 4. Dashboard Analytics──>  5. Error & Edge Cases (401/422)  │
└─────────────────────────────────────────────────────────────┘
```

---

### Module 0: Health & System Diagnostics

| # | Request Name | Method | URL / Endpoint | Expected Response | Description |
| :--- | :--- | :---: | :--- | :---: | :--- |
| **0.1** | **Root API Info** | `GET` | `{{baseUrl}}/` | `200 OK` | Returns service name, version, and documentation links. |
| **0.2** | **Liveness Health** | `GET` | `{{baseUrl}}/health` | `200 OK` | Verifies FastAPI process status (`status: ok`). |
| **0.3** | **DB Readiness** | `GET` | `{{baseUrl}}/health/db` | `200 OK` | Runs test SQL query (`SELECT 1`) to verify database connectivity. |

---

### Module 1: Categories API

| # | Request Name | Method | Endpoint & Parameters | Headers & Sample Body | Expected Status |
| :--- | :--- | :---: | :--- | :--- | :---: |
| **1.1** | **Get All Categories** | `GET` | `{{baseUrl}}/api/v1/categories` | `X-App-Key: {{apiKey}}` | `200 OK` |
| **1.2** | **Create Category** | `POST` | `{{baseUrl}}/api/v1/categories` | **Headers**: `X-App-Key`, `Content-Type: application/json`<br>**Body**: <br>```json
{
  "name": "Entertainment & Movies"
}
``` | `201 Created` |
| **1.3** | **Update Category** | `PUT` | `{{baseUrl}}/api/v1/categories/{{createdCategoryId}}` | **Body**: <br>```json
{
  "name": "Entertainment & Weekend Trips"
}
``` | `200 OK` |
| **1.4** | **Delete (Safe Check)** | `DELETE` | `{{baseUrl}}/api/v1/categories/{{createdCategoryId}}?cascade=false` | If category has linked expenses, prevents deletion safely with `409 Conflict`. | `200 OK` / `409 Conflict` |
| **1.5** | **Delete with Reassign** | `DELETE` | `{{baseUrl}}/api/v1/categories/{{createdCategoryId}}?reassign_to={{categoryId}}` | Reassigns linked expenses to target category before deletion. | `200 OK` |
| **1.6** | **Force Delete (Cascade)** | `DELETE` | `{{baseUrl}}/api/v1/categories/{{createdCategoryId}}?cascade=true` | Force deletes category and all associated expenses permanently. | `200 OK` |

---

### Module 2: Expenses API

| # | Request Name | Method | Endpoint & Query Parameters | Headers & Sample Body | Expected Status |
| :--- | :--- | :---: | :--- | :--- | :---: |
| **2.1** | **Get All Expenses** | `GET` | `{{baseUrl}}/api/v1/expenses?page=1&page_size=20&sort_by=date&order=desc` | `X-App-Key: {{apiKey}}`<br>Returns paginated items and total count. | `200 OK` |
| **2.2** | **Search & Multi-Filter** | `GET` | `{{baseUrl}}/api/v1/expenses?search=Coffee&category_id=1&start_date=2026-08-01&end_date=2026-08-31&min_amount=10&max_amount=5000&payment_mode=UPI&sort_by=amount&order=desc` | Composable multi-filtering by keyword, date range, category, payment mode, and min/max amount. | `200 OK` |
| **2.3** | **Create Expense** | `POST` | `{{baseUrl}}/api/v1/expenses` | **Body**: <br>```json
{
  "title": "CCD Cold Coffee & Sandwich",
  "amount": 260.50,
  "date": "2026-08-27",
  "category_id": 1,
  "payment_mode": "UPI",
  "notes": "Evening snack with colleagues, paid via GPay"
}
``` | `201 Created` |
| **2.4** | **Update Expense** | `PUT` | `{{baseUrl}}/api/v1/expenses/{{createdExpenseId}}` | **Body**: <br>```json
{
  "title": "CCD Cold Coffee (Large) & Sandwich",
  "amount": 310.00,
  "date": "2026-08-27",
  "category_id": 1,
  "payment_mode": "UPI",
  "notes": "Updated final bill amount with taxes"
}
``` | `200 OK` |
| **2.5** | **Delete Expense** | `DELETE` | `{{baseUrl}}/api/v1/expenses/{{createdExpenseId}}` | Permanently removes expense entry. | `200 OK` |

---

### Module 3: Budgeting API

| # | Request Name | Method | Endpoint & Parameters | Headers & Sample Body | Expected Status |
| :--- | :--- | :---: | :--- | :--- | :---: |
| **3.1** | **Set Overall Budget** | `POST` | `{{baseUrl}}/api/v1/budget` | **Body**: <br>```json
{
  "period": "monthly",
  "amount_limit": 25000.00,
  "category_id": null
}
``` | `201 Created` |
| **3.2** | **Set Category Budget** | `POST` | `{{baseUrl}}/api/v1/budget` | **Body**: <br>```json
{
  "period": "monthly",
  "amount_limit": 6000.00,
  "category_id": 1
}
``` | `201 Created` |
| **3.3** | **Get All Budgets** | `GET` | `{{baseUrl}}/api/v1/budget` | Fetches all overall and category-specific budget limits. | `200 OK` |
| **3.4** | **Overall Budget Status** | `GET` | `{{baseUrl}}/api/v1/budget/status` | Calculates live spent vs limit and returns alert threshold status (`on_track` < 80%, `near_limit` >= 80%, `over_budget` >= 100%). | `200 OK` |
| **3.5** | **Category Budget Status**| `GET` | `{{baseUrl}}/api/v1/budget/status?category_id=1` | Calculates live utilization and status for a specific category. | `200 OK` |

---

### Module 4: Dashboard & Analytics API

| # | Request Name | Method | Endpoint & Parameters | Description & Details |
| :--- | :--- | :---: | :--- | :--- |
| **4.1** | **Summary (Month)** | `GET` | `{{baseUrl}}/api/v1/dashboard/summary?period=month` | Total spend for the month, recent 5 transactions, and budget progress. |
| **4.2** | **Summary (Week / Day)** | `GET` | `{{baseUrl}}/api/v1/dashboard/summary?period=week` | Weekly / Daily aggregated summary toggle. |
| **4.3** | **Charts Breakdown** | `GET` | `{{baseUrl}}/api/v1/dashboard/charts?period=month` | Pie chart category breakdown & timeline spend series for charts. |
| **4.4** | **MoM Comparison** | `GET` | `{{baseUrl}}/api/v1/dashboard/comparison` | Month-over-Month spend comparison with percentage increase/decrease (`percentage_change`). |
| **4.5** | **Top Categories** | `GET` | `{{baseUrl}}/api/v1/dashboard/top-categories?period=month&limit=5` | Top ranked spending categories (Rank 1 to 5). |
| **4.6** | **Average Spend** | `GET` | `{{baseUrl}}/api/v1/dashboard/average-spend?period=month` | Normalized daily and weekly burn rate calculations. |

---

### Module 5: Error Handling & Edge Cases (Validation Tests)

| # | Test Scenario | Method | Endpoint / Condition | What it tests | Expected Status |
| :--- | :--- | :---: | :--- | :--- | :---: |
| **5.1** | **Unauthorized Access** | `GET` | `/api/v1/categories` with wrong `X-App-Key` | Verifies security middleware blocks requests with invalid access keys. | `401 Unauthorized` |
| **5.2** | **Negative Amount** | `POST` | `/api/v1/expenses` with `"amount": -500` | Verifies Pydantic validator rejects negative/zero amounts. | `422 Unprocessable Entity` |
| **5.3** | **Future Date** | `POST` | `/api/v1/expenses` with `"date": "2030-01-01"` | Verifies validator rejects future dates. | `422 Unprocessable Entity` |
| **5.4** | **Non-existent Resource** | `DELETE`| `/api/v1/expenses/999999` | Verifies 404 response for non-existent IDs. | `404 Not Found` |

---

## ⚡ 1-Click Automated Testing (Postman Collection Runner)

You can run automated test assertions across all 20+ endpoints in a single click:

1. In Postman, click on the **three dots (`...`)** next to `Kharcha Pani - Expense Tracker API Collection`.
2. Select **"Run collection"**.
3. Ensure all requests are checked.
4. Click **"Run Kharcha Pani - Expense Tracker API Collection"**.
5. All test assertions will execute sequentially and show green **`PASS`** badges! ✅

---

## 💻 Testing in VS Code (Thunder Client Extension)

If you prefer using VS Code without opening the standalone Postman application:

1. Open the **Thunder Client** extension tab in VS Code.
2. Go to **Collections** -> Click **Import** in the top menu.
3. Select **`e:\kharchaPani\collection.json`**.
4. All organized folders, requests, headers, and bodies will be ready to execute immediately inside VS Code.

---

## 🛠️ Troubleshooting & FAQ

### 1. `Could not get any response` / `Connection Refused`
- **Cause**: Backend server is not running or listening on a different port.
- **Fix**: Open terminal, run `cd backend` followed by `uvicorn app.main:app --reload --port 8000`.

### 2. `401 Unauthorized` (`Invalid or missing X-App-Key header`)
- **Cause**: The `X-App-Key` header was omitted or contains an incorrect secret value.
- **Fix**: In the request header, ensure `X-App-Key` is set to `dev-shared-access-key-kharcha-pani` (or verify that the collection variable `{{apiKey}}` matches your `.env` value).

### 3. `422 Unprocessable Entity`
- **Cause**: JSON payload has validation errors (e.g., missing required fields, date format is not `YYYY-MM-DD`, negative amount).
- **Fix**: Check the `detail` object in the JSON error response to identify the exact field that failed validation.

---

🎉 **You are now ready to test and validate the Kharcha Pani APIs!**
