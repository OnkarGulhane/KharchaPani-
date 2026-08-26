from datetime import date
from decimal import Decimal
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.config import settings

HEADERS = {"X-App-Key": settings.APP_ACCESS_KEY}


@pytest.mark.asyncio
async def test_expense_crud_and_filters():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Get category ID
        cats_res = await ac.get("/api/v1/categories", headers=HEADERS)
        food_cat_id = cats_res.json()["data"][0]["id"]

        # 1. Create expense
        payload = {
            "title": "Starbucks Coffee",
            "amount": "350.00",
            "date": date.today().isoformat(),
            "notes": "Team meet",
            "payment_mode": "UPI",
            "category_id": food_cat_id,
        }
        create_res = await ac.post("/api/v1/expenses", json=payload, headers=HEADERS)
        assert create_res.status_code == 201
        exp_data = create_res.json()["data"]
        exp_id = exp_data["id"]
        assert exp_data["title"] == "Starbucks Coffee"
        assert exp_data["amount"] == "350.00"

        # 2. Get paginated expenses with filters
        get_res = await ac.get(f"/api/v1/expenses?category_id={food_cat_id}&search=Starbucks", headers=HEADERS)
        assert get_res.status_code == 200
        items = get_res.json()["data"]["items"]
        assert len(items) >= 1

        # 3. Update expense
        update_res = await ac.put(f"/api/v1/expenses/{exp_id}", json={"amount": "400.00"}, headers=HEADERS)
        assert update_res.status_code == 200
        assert update_res.json()["data"]["amount"] == "400.00"

        # 4. Delete expense
        del_res = await ac.delete(f"/api/v1/expenses/{exp_id}", headers=HEADERS)
        assert del_res.status_code == 200
