import pytest
from datetime import datetime, date, timedelta
from decimal import Decimal
import httpx

from app.schemas.category import CategoryResponse
from app.services.nlp_parser import LocalNLPParser


def get_mock_categories():
    now = datetime.utcnow()
    return [
        CategoryResponse(id=1, name="Food", is_default=True, expense_count=0, created_at=now, updated_at=now),
        CategoryResponse(id=2, name="Transport", is_default=True, expense_count=0, created_at=now, updated_at=now),
        CategoryResponse(id=3, name="Utilities", is_default=True, expense_count=0, created_at=now, updated_at=now),
        CategoryResponse(id=4, name="Entertainment", is_default=True, expense_count=0, created_at=now, updated_at=now),
        CategoryResponse(id=5, name="Shopping", is_default=True, expense_count=0, created_at=now, updated_at=now),
        CategoryResponse(id=6, name="Other", is_default=True, expense_count=0, created_at=now, updated_at=now),
    ]


def test_local_nlp_parser_english_transport():
    categories = get_mock_categories()
    today = date(2026, 9, 7)
    res = LocalNLPParser.parse("Uber 240 cash yesterday", categories, reference_date=today)

    assert "Uber" in res.title
    assert res.amount == Decimal("240")
    assert res.date == today - timedelta(days=1)
    assert res.payment_mode == "Cash"
    assert res.category_name == "Transport"
    assert res.category_id == 2


def test_local_nlp_parser_grocery_upi():
    categories = get_mock_categories()
    today = date(2026, 9, 7)
    res = LocalNLPParser.parse("Dmart groceries 1450 via UPI", categories, reference_date=today)

    assert "Dmart" in res.title
    assert res.amount == Decimal("1450")
    assert res.date == today
    assert res.payment_mode == "UPI"
    assert res.category_name == "Food"


def test_local_nlp_parser_hinglish_marathi():
    categories = get_mock_categories()
    today = date(2026, 9, 7)
    res = LocalNLPParser.parse("Kal petrol 500 cash", categories, reference_date=today)

    assert "Petrol" in res.title
    assert res.amount == Decimal("500")
    assert res.date == today - timedelta(days=1)
    assert res.payment_mode == "Cash"
    assert res.category_name == "Transport"


def test_local_nlp_parser_marathi_chai():
    categories = get_mock_categories()
    today = date(2026, 9, 7)
    res = LocalNLPParser.parse("Chai nashta 60 upi aaj", categories, reference_date=today)

    assert "Chai" in res.title or "Nashta" in res.title
    assert res.amount == Decimal("60")
    assert res.date == today
    assert res.payment_mode == "UPI"
    assert res.category_name == "Food"


def test_local_nlp_parser_entertainment_card():
    categories = get_mock_categories()
    today = date(2026, 9, 7)
    res = LocalNLPParser.parse("Netflix 499 card parso", categories, reference_date=today)

    assert "Netflix" in res.title
    assert res.amount == Decimal("499")
    assert res.date == today - timedelta(days=2)
    assert res.payment_mode == "Card"
    assert res.category_name == "Entertainment"


@pytest.mark.asyncio
async def test_ai_quick_parse_api_endpoint(async_client: httpx.AsyncClient, auth_headers_user1: dict):
    payload = {
        "text": "Uber 250 cash yesterday",
        "reference_date": "2026-09-07",
    }
    response = await async_client.post(
        "/api/v1/ai/quick-parse",
        json=payload,
        headers=auth_headers_user1,
    )
    assert response.status_code == 200
    json_data = response.json()
    assert json_data["success"] is True
    data = json_data["data"]
    assert "Uber" in data["title"]
    assert float(data["amount"]) == 250.0
    assert data["date"] == "2026-09-06"
    assert data["payment_mode"] == "Cash"
    assert data["category_name"] == "Transport"
    assert data["engine_used"] in ["local_nlp", "gemini"]


@pytest.mark.asyncio
async def test_ai_quick_parse_unauthorized(async_client: httpx.AsyncClient):
    payload = {"text": "Chai 20"}
    response = await async_client.post(
        "/api/v1/ai/quick-parse",
        json=payload,
    )
    assert response.status_code == 401
