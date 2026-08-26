import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.config import settings


@pytest.mark.asyncio
async def test_health_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


@pytest.mark.asyncio
async def test_root_endpoint_access_key():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Request with valid key
        headers = {"X-App-Key": settings.APP_ACCESS_KEY}
        response = await ac.get("/", headers=headers)
        assert response.status_code == 200
        assert response.json()["app"] == "Kharcha Pani API"

        # Request with invalid key
        bad_headers = {"X-App-Key": "wrong-key"}
        bad_response = await ac.get("/", headers=bad_headers)
        assert bad_response.status_code == 401
        assert bad_response.json()["success"] is False
