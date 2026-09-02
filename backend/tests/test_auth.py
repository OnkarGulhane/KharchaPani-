import pytest
import httpx


@pytest.mark.asyncio
async def test_register_user_success(async_client: httpx.AsyncClient):
    """Test user registration creates unverified account and requires email verification."""
    payload = {
        "email": "newuser@example.com",
        "password": "SecurePassword123!",
        "full_name": "New User",
    }
    response = await async_client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["success"] is True
    assert data["data"]["email"] == "newuser@example.com"
    assert data["data"]["is_verified"] is False
    assert data["data"]["requires_verification"] is True
    assert "verify" in data["message"].lower()


@pytest.mark.asyncio
async def test_register_duplicate_email(async_client: httpx.AsyncClient):
    """Test duplicate registration returns 400."""
    payload = {
        "email": "testuser@example.com",  # Already exists from fixture
        "password": "SecurePassword123!",
        "full_name": "Duplicate User",
    }
    response = await async_client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 400


@pytest.mark.asyncio
async def test_login_success(async_client: httpx.AsyncClient):
    """Test login returns JWT access token and HttpOnly refresh cookie."""
    payload = {
        "email": "testuser@example.com",
        "password": "Password123!",
    }
    response = await async_client.post("/api/v1/auth/login", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "access_token" in data["data"]
    assert "kharcha_refresh_token" in response.cookies


@pytest.mark.asyncio
async def test_login_invalid_password(async_client: httpx.AsyncClient):
    """Test login with wrong password returns 401."""
    payload = {
        "email": "testuser@example.com",
        "password": "WrongPassword!",
    }
    response = await async_client.post("/api/v1/auth/login", json=payload)
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_refresh_token_rotation(async_client: httpx.AsyncClient):
    """Test refresh token rotation issues new access token and new cookie."""
    # 1. Login
    login_res = await async_client.post(
        "/api/v1/auth/login",
        json={"email": "testuser@example.com", "password": "Password123!"},
    )
    refresh_cookie = login_res.cookies.get("kharcha_refresh_token")
    assert refresh_cookie is not None

    # 2. Call refresh
    refresh_res = await async_client.post(
        "/api/v1/auth/refresh",
        cookies={"kharcha_refresh_token": refresh_cookie},
    )
    assert refresh_res.status_code == 200
    data = refresh_res.json()
    assert "access_token" in data["data"]

    new_refresh_cookie = refresh_res.cookies.get("kharcha_refresh_token")
    assert new_refresh_cookie is not None
    # Verify token rotated
    assert new_refresh_cookie != refresh_cookie

    # 3. Trying to reuse old refresh token must fail (Rotation Security)
    reuse_res = await async_client.post(
        "/api/v1/auth/refresh",
        cookies={"kharcha_refresh_token": refresh_cookie},
    )
    assert reuse_res.status_code == 401


@pytest.mark.asyncio
async def test_logout_revokes_token(async_client: httpx.AsyncClient):
    """Test logout revokes the current refresh token."""
    login_res = await async_client.post(
        "/api/v1/auth/login",
        json={"email": "testuser@example.com", "password": "Password123!"},
    )
    refresh_cookie = login_res.cookies.get("kharcha_refresh_token")

    # Logout
    logout_res = await async_client.post(
        "/api/v1/auth/logout",
        cookies={"kharcha_refresh_token": refresh_cookie},
    )
    assert logout_res.status_code == 200

    # Refresh must now fail
    refresh_res = await async_client.post(
        "/api/v1/auth/refresh",
        cookies={"kharcha_refresh_token": refresh_cookie},
    )
    assert refresh_res.status_code == 401


@pytest.mark.asyncio
async def test_get_current_user_profile(async_client: httpx.AsyncClient, auth_headers_user1: dict):
    """Test /auth/me returns authenticated user info."""
    response = await async_client.get("/api/v1/auth/me", headers=auth_headers_user1)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["data"]["email"] == "testuser@example.com"


@pytest.mark.asyncio
async def test_google_auth_new_user(async_client: httpx.AsyncClient, monkeypatch):
    """Test Google authentication with a new user creates account, seeds starter categories, and logs in."""
    from app.services.google_auth_service import GoogleAuthService

    mock_google_profile = {
        "google_id": "google-oauth2-id-12345",
        "email": "googleuser@gmail.com",
        "full_name": "Google User",
        "picture": "https://example.com/avatar.jpg",
    }

    async def mock_verify(token_str: str):
        return mock_google_profile

    monkeypatch.setattr(GoogleAuthService, "verify_google_token_async", mock_verify)

    response = await async_client.post(
        "/api/v1/auth/google",
        json={"id_token": "valid-mock-google-token"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "access_token" in data["data"]
    assert data["data"]["user"]["email"] == "googleuser@gmail.com"
    assert data["data"]["user"]["full_name"] == "Google User"
    assert "kharcha_refresh_token" in response.cookies


@pytest.mark.asyncio
async def test_google_auth_existing_user_linking(async_client: httpx.AsyncClient, monkeypatch):
    """Test Google authentication links existing user account with same email."""
    from app.services.google_auth_service import GoogleAuthService

    # testuser@example.com is already created in the test fixture
    mock_google_profile = {
        "google_id": "google-linked-id-999",
        "email": "testuser@example.com",
        "full_name": "Test User",
        "picture": None,
    }

    async def mock_verify(token_str: str):
        return mock_google_profile

    monkeypatch.setattr(GoogleAuthService, "verify_google_token_async", mock_verify)

    response = await async_client.post(
        "/api/v1/auth/google",
        json={"id_token": "valid-mock-google-token-2"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["data"]["user"]["email"] == "testuser@example.com"
    assert "access_token" in data["data"]


@pytest.mark.asyncio
async def test_google_auth_invalid_token(async_client: httpx.AsyncClient):
    """Test Google authentication with invalid or empty token returns error."""
    response = await async_client.post(
        "/api/v1/auth/google",
        json={"id_token": ""},
    )
    assert response.status_code in [400, 422]

