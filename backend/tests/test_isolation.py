from datetime import date
import pytest
import httpx
from app.core.security import create_access_token


@pytest.mark.asyncio
async def test_user_data_isolation_expenses(async_client: httpx.AsyncClient):
    """Test that User A and User B cannot see, modify, or delete each other's expenses."""
    # 1. Register User A and User B
    reg_a = await async_client.post(
        "/api/v1/auth/register",
        json={"email": "usera@example.com", "password": "Password123!", "full_name": "User A"},
    )
    assert reg_a.status_code == 201
    token_a = reg_a.json()["data"]["access_token"]
    headers_a = {"Authorization": f"Bearer {token_a}"}

    reg_b = await async_client.post(
        "/api/v1/auth/register",
        json={"email": "userb@example.com", "password": "Password123!", "full_name": "User B"},
    )
    assert reg_b.status_code == 201
    token_b = reg_b.json()["data"]["access_token"]
    headers_b = {"Authorization": f"Bearer {token_b}"}

    # 2. Get User A's category ID
    cats_a = await async_client.get("/api/v1/categories", headers=headers_a)
    cat_a_id = cats_a.json()["data"][0]["id"]

    # 3. User A creates an expense
    create_exp_res = await async_client.post(
        "/api/v1/expenses",
        headers=headers_a,
        json={
            "title": "User A Private Dinner",
            "amount": 1250.00,
            "date": date.today().isoformat(),
            "category_id": cat_a_id,
        },
    )
    assert create_exp_res.status_code == 201
    exp_a_id = create_exp_res.json()["data"]["id"]

    # 4. User B lists expenses -> User A's expense MUST NOT appear
    list_b_res = await async_client.get("/api/v1/expenses", headers=headers_b)
    assert list_b_res.status_code == 200
    items_b = list_b_res.json()["data"]["items"]
    assert len(items_b) == 0  # User B has no expenses

    # 5. User B tries to directly modify User A's expense by ID -> MUST return 404
    hack_put_res = await async_client.put(
        f"/api/v1/expenses/{exp_a_id}",
        headers=headers_b,
        json={"title": "Hacked Title", "amount": 1.00},
    )
    assert hack_put_res.status_code == 404

    # 6. User B tries to delete User A's expense by ID -> MUST return 404
    hack_del_res = await async_client.delete(
        f"/api/v1/expenses/{exp_a_id}",
        headers=headers_b,
    )
    assert hack_del_res.status_code == 404

    # 7. Verify User A's expense is intact
    list_a_res = await async_client.get("/api/v1/expenses", headers=headers_a)
    assert list_a_res.status_code == 200
    assert list_a_res.json()["data"]["items"][0]["title"] == "User A Private Dinner"


@pytest.mark.asyncio
async def test_category_composite_unique_per_user(async_client: httpx.AsyncClient):
    """Test that User A and User B can both have a category with the same name without conflict."""
    reg_a = await async_client.post(
        "/api/v1/auth/register",
        json={"email": "alice@example.com", "password": "Password123!", "full_name": "Alice"},
    )
    headers_a = {"Authorization": f"Bearer {reg_a.json()['data']['access_token']}"}

    reg_b = await async_client.post(
        "/api/v1/auth/register",
        json={"email": "bob@example.com", "password": "Password123!", "full_name": "Bob"},
    )
    headers_b = {"Authorization": f"Bearer {reg_b.json()['data']['access_token']}"}

    # Alice creates custom category "Crypto Investment"
    res_a = await async_client.post(
        "/api/v1/categories",
        headers=headers_a,
        json={"name": "Crypto Investment"},
    )
    assert res_a.status_code == 201

    # Bob creates custom category with identical name "Crypto Investment" -> MUST succeed
    res_b = await async_client.post(
        "/api/v1/categories",
        headers=headers_b,
        json={"name": "Crypto Investment"},
    )
    assert res_b.status_code == 201
    assert res_b.json()["data"]["name"] == "Crypto Investment"
    assert res_b.json()["data"]["id"] != res_a.json()["data"]["id"]


@pytest.mark.asyncio
async def test_dashboard_isolation(async_client: httpx.AsyncClient):
    """Test that User B's dashboard metrics remain zero even if User A logged expenses."""
    reg_a = await async_client.post(
        "/api/v1/auth/register",
        json={"email": "carol@example.com", "password": "Password123!", "full_name": "Carol"},
    )
    headers_a = {"Authorization": f"Bearer {reg_a.json()['data']['access_token']}"}

    reg_b = await async_client.post(
        "/api/v1/auth/register",
        json={"email": "dave@example.com", "password": "Password123!", "full_name": "Dave"},
    )
    headers_b = {"Authorization": f"Bearer {reg_b.json()['data']['access_token']}"}

    # Carol logs an expense
    cats_a = await async_client.get("/api/v1/categories", headers=headers_a)
    cat_id = cats_a.json()["data"][0]["id"]
    await async_client.post(
        "/api/v1/expenses",
        headers=headers_a,
        json={"title": "Big Spend", "amount": 50000.00, "date": date.today().isoformat(), "category_id": cat_id},
    )

    # Carol's summary reflects 50,000
    summary_a = await async_client.get("/api/v1/dashboard/summary?period=month", headers=headers_a)
    assert float(summary_a.json()["data"]["total_spent"]) == 50000.00

    # Dave's summary MUST be 0.00
    summary_b = await async_client.get("/api/v1/dashboard/summary?period=month", headers=headers_b)
    assert float(summary_b.json()["data"]["total_spent"]) == 0.00
