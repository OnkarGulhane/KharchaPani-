import pytest
from decimal import Decimal
import httpx

from app.services.ai.local_provider import LocalNLPAIProvider
from app.services.ai_service import AIService


@pytest.mark.asyncio
async def test_local_provider_under_budget():
    provider = LocalNLPAIProvider()
    context = {
        "total_spent": 8000.0,
        "budget_limit": 25000.0,
        "days_elapsed": 15,
        "days_in_month": 30,
        "category_breakdown": [
            {"name": "Food", "amount": 3000.0, "percentage": 37.5},
            {"name": "Transport", "amount": 2000.0, "percentage": 25.0},
        ],
        "mom_growth": -5.0,
    }

    res = await provider.generate_recommendations(context)
    assert res.financial_health_score >= 80
    assert res.budget_status_warning == "On Track"
    assert res.projected_month_end_spend == Decimal("16000.00")
    assert len(res.recommendations) >= 2
    assert res.engine_used == "local_nlp"


@pytest.mark.asyncio
async def test_local_provider_over_budget():
    provider = LocalNLPAIProvider()
    context = {
        "total_spent": 28000.0,
        "budget_limit": 20000.0,
        "days_elapsed": 15,
        "days_in_month": 30,
        "category_breakdown": [
            {"name": "Shopping", "amount": 18000.0, "percentage": 64.3},
        ],
        "mom_growth": 45.0,
    }

    res = await provider.generate_recommendations(context)
    assert res.financial_health_score <= 65
    assert res.budget_status_warning in ["Near Limit", "Exceeded Budget"]
    assert res.projected_month_end_spend == Decimal("56000.00")
    assert res.top_overspending_category == "Shopping"


@pytest.mark.asyncio
async def test_local_provider_no_budget():
    provider = LocalNLPAIProvider()
    context = {
        "total_spent": 5000.0,
        "budget_limit": None,
        "days_elapsed": 10,
        "days_in_month": 30,
        "category_breakdown": [],
        "mom_growth": 0.0,
    }

    res = await provider.generate_recommendations(context)
    assert res.budget_status_warning == "No Budget Set"
    assert res.projected_month_end_spend == Decimal("15000.00")


@pytest.mark.asyncio
async def test_ai_recommendations_api_endpoint(
    async_client: httpx.AsyncClient,
    auth_headers_user1: dict,
):
    response = await async_client.get(
        "/api/v1/ai/recommendations",
        headers=auth_headers_user1,
    )
    assert response.status_code == 200
    json_data = response.json()
    assert json_data["success"] is True
    data = json_data["data"]
    assert "financial_health_score" in data
    assert "projected_month_end_spend" in data
    assert "recommendations" in data
    assert isinstance(data["recommendations"], list)
    assert data["engine_used"] in ["gemini", "local_nlp"]


@pytest.mark.asyncio
async def test_ai_recommendations_unauthorized(async_client: httpx.AsyncClient):
    response = await async_client.get("/api/v1/ai/recommendations")
    assert response.status_code == 401
