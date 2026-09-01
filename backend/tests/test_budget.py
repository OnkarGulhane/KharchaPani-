import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.security import create_access_token


@pytest.fixture
def auth_headers():
    token = create_access_token(data={"sub": "1", "email": "testuser@example.com"})
    return {"Authorization": f"Bearer {token}"}


@pytest.mark.asyncio
async def test_budget_goal_and_status(auth_headers: dict):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # 1. Set overall monthly budget goal
        payload = {"period": "monthly", "amount_limit": "25000.00", "category_id": None}
        set_res = await ac.post("/api/v1/budget", json=payload, headers=auth_headers)
        assert set_res.status_code == 201
        assert set_res.json()["data"]["amount_limit"] == "25000.00"

        # 2. Check live budget status
        status_res = await ac.get("/api/v1/budget/status", headers=auth_headers)
        assert status_res.status_code == 200
        status_data = status_res.json()["data"]
        assert status_data["total_budget"] == "25000.00"
        assert status_data["status"] in ["on_track", "near_limit", "over_budget"]
