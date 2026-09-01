import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.security import create_access_token


@pytest.fixture
def auth_headers():
    token = create_access_token(data={"sub": "1", "email": "testuser@example.com"})
    return {"Authorization": f"Bearer {token}"}


@pytest.mark.asyncio
async def test_category_lifecycle(auth_headers: dict):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # 1. Get starter categories
        res = await ac.get("/api/v1/categories", headers=auth_headers)
        assert res.status_code == 200
        data = res.json()["data"]
        assert len(data) >= 6

        # 2. Create custom category
        create_res = await ac.post("/api/v1/categories", json={"name": "Travel Tech"}, headers=auth_headers)
        assert create_res.status_code == 201
        created_cat = create_res.json()["data"]
        assert created_cat["name"] == "Travel Tech"
        cat_id = created_cat["id"]

        # 3. Rename category
        update_res = await ac.put(f"/api/v1/categories/{cat_id}", json={"name": "Gadgets"}, headers=auth_headers)
        assert update_res.status_code == 200
        assert update_res.json()["data"]["name"] == "Gadgets"

        # 4. Delete unused category
        del_res = await ac.delete(f"/api/v1/categories/{cat_id}", headers=auth_headers)
        assert del_res.status_code == 200
