import io
from datetime import date, datetime
from decimal import Decimal
import httpx
import pytest

from app.schemas.ai import (
    AIChatMessage,
    AIChatRequest,
    SavingsGoalRequest,
)
from app.schemas.category import CategoryResponse
from app.services.ai.local_provider import LocalNLPAIProvider


@pytest.fixture
def mock_categories():
    now = datetime.now()
    return [
        CategoryResponse(id=1, name="Groceries", is_default=True, created_at=now, updated_at=now),
        CategoryResponse(id=2, name="Dining Out", is_default=True, created_at=now, updated_at=now),
        CategoryResponse(id=3, name="Entertainment", is_default=True, created_at=now, updated_at=now),
        CategoryResponse(id=4, name="Transport", is_default=True, created_at=now, updated_at=now),
    ]


@pytest.mark.asyncio
async def test_local_receipt_scan(mock_categories):
    provider = LocalNLPAIProvider()
    fake_img = b"fake-receipt-binary-image-content"
    result = await provider.scan_receipt(
        file_bytes=fake_img,
        mime_type="image/png",
        categories=mock_categories,
        reference_date=date(2026, 9, 7),
    )
    assert result.merchant_name is not None
    assert result.amount > 0
    assert result.category_id in [1, 2, 3, 4]
    assert len(result.line_items) > 0


@pytest.mark.asyncio
async def test_local_chat_query():
    provider = LocalNLPAIProvider()
    context = {
        "total_spent": 8450.0,
        "budget_limit": 15000.0,
        "category_breakdown": [
            {"name": "Dining Out", "amount": 4200.0, "percentage": 49.7},
            {"name": "Groceries", "amount": 3000.0, "percentage": 35.5},
        ],
        "recent_expenses": [],
    }
    # Test total spend query
    resp1 = await provider.chat_query(
        message="How much did I spend this month?",
        history=[],
        context=context,
    )
    assert "8,450" in resp1.reply
    assert len(resp1.suggested_questions) > 0

    # Test savings query
    resp2 = await provider.chat_query(
        message="How can I save money?",
        history=[],
        context=context,
    )
    assert "50/30/20" in resp2.reply


@pytest.mark.asyncio
async def test_local_subscriptions_detection():
    provider = LocalNLPAIProvider()
    expenses = [
        {"title": "Netflix Premium", "amount": 649.0, "date": "2026-09-01", "category": "Entertainment"},
        {"title": "Spotify Family", "amount": 179.0, "date": "2026-09-02", "category": "Entertainment"},
        {"title": "Gold's Gym Monthly", "amount": 1500.0, "date": "2026-09-03", "category": "Health"},
        {"title": "Chai & Samosa", "amount": 40.0, "date": "2026-09-04", "category": "Food"},
    ]
    result = await provider.detect_subscriptions(expenses)
    assert result.active_subscriptions_count >= 3
    assert result.total_monthly_recurring > Decimal("2000.00")
    assert any(s.merchant_name == "Netflix Premium" for s in result.subscriptions)


@pytest.mark.asyncio
async def test_local_savings_goal_simulation():
    provider = LocalNLPAIProvider()
    context = {
        "category_breakdown": [
            {"name": "Dining Out", "amount": 6000.0, "percentage": 50.0},
            {"name": "Shopping", "amount": 4000.0, "percentage": 33.3},
        ]
    }
    request = SavingsGoalRequest(
        goal_name="MacBook Air",
        target_amount=Decimal("60000.00"),
        target_months=6,
    )
    result = await provider.simulate_savings_goal(request, context)
    assert result.goal_name == "MacBook Air"
    assert result.required_monthly_savings == Decimal("10000.00")
    assert len(result.category_cut_plans) > 0
    assert result.feasibility_score > 0


@pytest.mark.asyncio
async def test_api_receipt_scan_endpoint(
    async_client: httpx.AsyncClient,
    auth_headers_user1: dict,
):
    fake_file = io.BytesIO(b"dummy image bytes")
    files = {"file": ("receipt.png", fake_file, "image/png")}

    response = await async_client.post(
        "/api/v1/ai/receipt-scan",
        headers=auth_headers_user1,
        files=files,
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "amount" in data["data"]
    assert "merchant_name" in data["data"]


@pytest.mark.asyncio
async def test_api_chat_endpoint(
    async_client: httpx.AsyncClient,
    auth_headers_user1: dict,
):
    payload = {
        "message": "What is my total spend?",
        "history": [],
    }
    response = await async_client.post(
        "/api/v1/ai/chat",
        headers=auth_headers_user1,
        json=payload,
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "reply" in data["data"]


@pytest.mark.asyncio
async def test_api_subscriptions_endpoint(
    async_client: httpx.AsyncClient,
    auth_headers_user1: dict,
):
    response = await async_client.get(
        "/api/v1/ai/subscriptions",
        headers=auth_headers_user1,
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "total_monthly_recurring" in data["data"]


@pytest.mark.asyncio
async def test_api_savings_goal_endpoint(
    async_client: httpx.AsyncClient,
    auth_headers_user1: dict,
):
    payload = {
        "goal_name": "Goa Vacation",
        "target_amount": 25000.0,
        "target_months": 5,
    }
    response = await async_client.post(
        "/api/v1/ai/savings-goal",
        headers=auth_headers_user1,
        json=payload,
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["data"]["goal_name"] == "Goa Vacation"
    assert float(data["data"]["required_monthly_savings"]) == 5000.0


@pytest.mark.asyncio
async def test_ai_suite_v2_unauthorized(async_client: httpx.AsyncClient):
    resp1 = await async_client.get("/api/v1/ai/subscriptions")
    assert resp1.status_code == 401

    resp2 = await async_client.post("/api/v1/ai/chat", json={"message": "hello", "history": []})
    assert resp2.status_code == 401


@pytest.mark.asyncio
async def test_local_financial_health():
    from app.schemas.ai import FinancialHealthRequest
    provider = LocalNLPAIProvider()
    context = {
        "total_spent": 18500.0,
        "budget_limit": 30000.0,
        "upcoming_recurring": 3200.0,
        "category_breakdown": [
            {"id": 1, "name": "Groceries", "amount": 6500.0, "percentage": 35.1},
            {"id": 2, "name": "Dining Out", "amount": 4200.0, "percentage": 22.7},
            {"id": 3, "name": "Rent", "amount": 7800.0, "percentage": 42.2},
        ],
    }
    req = FinancialHealthRequest(monthly_income=Decimal("50000.00"), liquid_emergency_fund=Decimal("150000.00"))
    result = await provider.calculate_financial_health(req, context)
    assert 0 <= result.overall_score <= 100
    assert len(result.pillars) == 5
    assert result.fifty_thirty_twenty.needs_percentage > 0
    assert len(result.action_plan) > 0


@pytest.mark.asyncio
async def test_local_budget_burn_forecast():
    from app.schemas.ai import BudgetForecastRequest
    provider = LocalNLPAIProvider()
    context = {
        "total_spent": 12000.0,
        "budget_limit": 25000.0,
        "days_elapsed": 12,
        "days_in_month": 30,
        "category_breakdown": [
            {"id": 1, "name": "Food", "amount": 6000.0, "percentage": 50.0},
            {"id": 2, "name": "Transport", "amount": 3000.0, "percentage": 25.0},
        ],
    }
    req = BudgetForecastRequest(total_custom_budget=Decimal("25000.00"))
    result = await provider.forecast_budget_burn(req, context)
    assert result.total_budget_allocated == Decimal("25000.00")
    assert result.overall_burn_rate_current == Decimal("1000.00")
    assert len(result.category_forecasts) == 2
    assert len(result.ai_optimization_guardrails) > 0


@pytest.mark.asyncio
async def test_local_expense_sentiment():
    from app.schemas.ai import ExpenseSentimentRequest
    provider = LocalNLPAIProvider()
    context = {
        "recent_expenses": [
            {"title": "Late night pizza on Swiggy", "amount": 550.0, "category": "Food", "date": "2026-09-05"},
            {"title": "Python Programming Course Udemy", "amount": 499.0, "category": "Education", "date": "2026-09-04"},
            {"title": "Drinks with team at pub", "amount": 2200.0, "category": "Entertainment", "date": "2026-09-02"},
            {"title": "Organic Vegetables & Groceries", "amount": 1200.0, "category": "Groceries", "date": "2026-09-01"},
        ]
    }
    req = ExpenseSentimentRequest(days_to_analyze=30)
    result = await provider.analyze_expense_sentiment(req, context)
    assert -1.0 <= result.net_sentiment_score <= 1.0
    assert result.impulse_buy_index >= 0.0
    assert len(result.behavioral_nudges) > 0


@pytest.mark.asyncio
async def test_api_financial_health_endpoint(
    async_client: httpx.AsyncClient,
    auth_headers_user1: dict,
):
    response = await async_client.get(
        "/api/v1/ai/financial-health",
        headers=auth_headers_user1,
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "overall_score" in data["data"]
    assert "pillars" in data["data"]


@pytest.mark.asyncio
async def test_api_budget_forecast_endpoint(
    async_client: httpx.AsyncClient,
    auth_headers_user1: dict,
):
    response = await async_client.post(
        "/api/v1/ai/budget-forecast",
        headers=auth_headers_user1,
        json={"total_custom_budget": 35000.0},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "overall_burn_rate_current" in data["data"]
    assert "category_forecasts" in data["data"]


@pytest.mark.asyncio
async def test_api_expense_sentiment_endpoint(
    async_client: httpx.AsyncClient,
    auth_headers_user1: dict,
):
    response = await async_client.get(
        "/api/v1/ai/expense-sentiment",
        headers=auth_headers_user1,
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "net_sentiment_score" in data["data"]
    assert "emotion_distribution" in data["data"]

