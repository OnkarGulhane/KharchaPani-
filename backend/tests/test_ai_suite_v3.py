import io
from datetime import date, datetime
from decimal import Decimal
import httpx
import pytest

from app.schemas.ai import (
    CashFlowForecastRequest,
    TaxAdvisorRequest,
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
async def test_local_cashflow_forecast():
    provider = LocalNLPAIProvider()
    context = {
        "total_spent": 12000.0,
        "budget_limit": 30000.0,
        "days_elapsed": 12,
        "days_in_month": 30,
        "upcoming_recurring": 1500.0,
        "category_breakdown": [{"name": "Dining Out", "amount": 6000.0, "percentage": 50.0}],
    }
    req = CashFlowForecastRequest(estimated_monthly_income=Decimal("30000.00"), current_liquid_balance=Decimal("18000.00"))
    result = await provider.forecast_cashflow(req, context)

    assert result.current_spend_to_date == Decimal("12000.0")
    assert result.daily_burn_rate_current == Decimal("1000.00")
    assert result.days_remaining == 18
    assert result.risk_level in ["Safe", "Moderate", "Critical Danger", "Thriving"]
    assert len(result.daily_forecast_timeline) == 30
    assert result.engine_used == "local_nlp"


@pytest.mark.asyncio
async def test_local_tax_advisor():
    provider = LocalNLPAIProvider()
    context = {
        "expenses": [
            {"title": "ELSS Tax Saver Mutual Fund", "amount": 50000.0, "category": "Investments", "date": "2026-09-01"},
            {"title": "Star Health Insurance Premium", "amount": 18000.0, "category": "Health", "date": "2026-09-02"},
            {"title": "Apartment Monthly Rent", "amount": 25000.0, "category": "Rent", "date": "2026-09-03"},
        ],
        "category_breakdown": [],
    }
    req = TaxAdvisorRequest(annual_income=Decimal("1200000.00"), tax_year="2024-25")
    result = await provider.advise_tax_regime(req, context)

    assert result.recommended_regime in ["New Tax Regime", "Old Tax Regime"]
    assert len(result.deductions_breakdown) >= 3
    assert result.old_regime.gross_taxable_income == Decimal("1200000.00")
    assert result.new_regime.gross_taxable_income == Decimal("1200000.00")
    assert len(result.ai_tax_saving_tips) > 0


@pytest.mark.asyncio
async def test_local_voice_expense_marathi(mock_categories):
    provider = LocalNLPAIProvider()
    marathi_text = "काल भाजी मंडई मध्ये ५०० रुपये कॅश दिले"
    result = await provider.parse_voice_expense(
        audio_bytes=None,
        mime_type=None,
        transcript=marathi_text,
        categories=mock_categories,
        reference_date=date(2026, 9, 7),
    )

    assert result.amount == Decimal("500")
    assert result.detected_language == "Marathi"
    assert result.category_id in [1, 2, 3, 4]


@pytest.mark.asyncio
async def test_local_money_digest():
    provider = LocalNLPAIProvider()
    context = {
        "total_spent": 15400.0,
        "category_breakdown": [
            {"name": "Dining Out", "amount": 7500.0, "percentage": 48.7},
            {"name": "Groceries", "amount": 4000.0, "percentage": 26.0},
        ],
        "recent_expenses": [],
    }
    result = await provider.generate_money_digest(month=9, year=2026, context=context)

    assert "September" in result.month_name
    assert len(result.slides) == 5
    assert result.total_spent_this_month == Decimal("15400.0")
    assert result.persona_icon != ""


@pytest.mark.asyncio
async def test_api_cashflow_endpoint(
    async_client: httpx.AsyncClient,
    auth_headers_user1: dict,
):
    resp = await async_client.post(
        "/api/v1/ai/cashflow-forecast",
        headers=auth_headers_user1,
        json={"estimated_monthly_income": 45000.0, "current_liquid_balance": 25000.0},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True
    assert "daily_burn_rate_current" in data["data"]
    assert "daily_forecast_timeline" in data["data"]


@pytest.mark.asyncio
async def test_api_tax_advisor_endpoint(
    async_client: httpx.AsyncClient,
    auth_headers_user1: dict,
):
    resp = await async_client.post(
        "/api/v1/ai/tax-advisor",
        headers=auth_headers_user1,
        json={"annual_income": 1000000.0, "tax_year": "2024-25"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True
    assert "recommended_regime" in data["data"]
    assert "deductions_breakdown" in data["data"]


@pytest.mark.asyncio
async def test_api_voice_expense_endpoint(
    async_client: httpx.AsyncClient,
    auth_headers_user1: dict,
):
    resp = await async_client.post(
        "/api/v1/ai/voice-expense?transcript=Dinner%20with%20friends%201200%20UPI",
        headers=auth_headers_user1,
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True
    assert float(data["data"]["amount"]) == 1200.0
    assert data["data"]["category_name"] != ""



@pytest.mark.asyncio
async def test_api_money_digest_endpoint(
    async_client: httpx.AsyncClient,
    auth_headers_user1: dict,
):
    resp = await async_client.get(
        "/api/v1/ai/money-digest?month=9&year=2026",
        headers=auth_headers_user1,
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True
    assert len(data["data"]["slides"]) == 5
