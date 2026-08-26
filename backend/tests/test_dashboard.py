import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.config import settings

HEADERS = {"X-App-Key": settings.APP_ACCESS_KEY}


@pytest.mark.asyncio
async def test_dashboard_endpoints():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # 1. Summary
        summary_res = await ac.get("/api/v1/dashboard/summary?period=month", headers=HEADERS)
        assert summary_res.status_code == 200
        assert "total_spent" in summary_res.json()["data"]

        # 2. Charts
        charts_res = await ac.get("/api/v1/dashboard/charts?period=month", headers=HEADERS)
        assert charts_res.status_code == 200
        assert "pie_chart" in charts_res.json()["data"]
        assert "trend_chart" in charts_res.json()["data"]

        # 3. MoM Comparison
        comp_res = await ac.get("/api/v1/dashboard/comparison", headers=HEADERS)
        assert comp_res.status_code == 200
        assert "percentage_change" in comp_res.json()["data"]

        # 4. Top Categories
        top_res = await ac.get("/api/v1/dashboard/top-categories?period=month", headers=HEADERS)
        assert top_res.status_code == 200
        assert isinstance(top_res.json()["data"], list)

        # 5. Average Spend
        avg_res = await ac.get("/api/v1/dashboard/average-spend?period=month", headers=HEADERS)
        assert avg_res.status_code == 200
        assert "average_daily_spend" in avg_res.json()["data"]
