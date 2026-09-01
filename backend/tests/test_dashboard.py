import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.security import create_access_token


@pytest.fixture
def auth_headers():
    token = create_access_token(data={"sub": "1", "email": "testuser@example.com"})
    return {"Authorization": f"Bearer {token}"}


@pytest.mark.asyncio
async def test_dashboard_endpoints(auth_headers: dict):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # 1. Summary
        summary_res = await ac.get("/api/v1/dashboard/summary?period=month", headers=auth_headers)
        assert summary_res.status_code == 200
        assert "total_spent" in summary_res.json()["data"]

        # 2. Charts
        charts_res = await ac.get("/api/v1/dashboard/charts?period=month", headers=auth_headers)
        assert charts_res.status_code == 200
        assert "pie_chart" in charts_res.json()["data"]
        assert "trend_chart" in charts_res.json()["data"]

        # 3. MoM Comparison
        comp_res = await ac.get("/api/v1/dashboard/comparison", headers=auth_headers)
        assert comp_res.status_code == 200
        assert "percentage_change" in comp_res.json()["data"]

        # 4. Top Categories
        top_res = await ac.get("/api/v1/dashboard/top-categories?period=month", headers=auth_headers)
        assert top_res.status_code == 200
        assert isinstance(top_res.json()["data"], list)

        # 5. Average Spend
        avg_res = await ac.get("/api/v1/dashboard/average-spend?period=month", headers=auth_headers)
        assert avg_res.status_code == 200
        assert "average_daily_spend" in avg_res.json()["data"]
