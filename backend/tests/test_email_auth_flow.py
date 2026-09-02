import pytest
import httpx
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.email_verification import EmailVerificationToken
from app.models.password_reset import PasswordResetToken
from app.models.user import User


@pytest.mark.asyncio
async def test_registration_and_email_verification_flow(
    async_client: httpx.AsyncClient,
    db_session: AsyncSession,
):
    """Test full registration, verification token generation, and email verification endpoint."""
    # 1. Register new user
    register_payload = {
        "email": "verifyuser@example.com",
        "password": "SecurePass123!",
        "full_name": "Verify User",
    }
    reg_res = await async_client.post("/api/v1/auth/register", json=register_payload)
    assert reg_res.status_code == 201
    user_data = reg_res.json()["data"]
    assert user_data["email"] == "verifyuser@example.com"
    assert user_data["is_verified"] is False
    assert user_data["requires_verification"] is True

    # Attempt login BEFORE verification (must be rejected with 403)
    login_before = await async_client.post(
        "/api/v1/auth/login",
        json={"email": "verifyuser@example.com", "password": "SecurePass123!"},
    )
    assert login_before.status_code == 403
    assert "verify your email" in login_before.json()["detail"].lower()

    # Verify user is in DB as unverified
    stmt = select(User).where(User.email == "verifyuser@example.com")
    res = await db_session.execute(stmt)
    user_in_db = res.scalar_one()
    assert user_in_db.is_verified is False

    # 2. Generate raw token and test verification endpoint
    from app.services.auth_service import AuthService
    raw_token = await AuthService.create_email_verification_token(db_session, user_in_db.id)
    assert raw_token is not None

    # 3. Call POST /api/v1/auth/verify-email
    verify_res = await async_client.post(
        "/api/v1/auth/verify-email",
        json={"token": raw_token},
    )
    assert verify_res.status_code == 200
    assert verify_res.json()["success"] is True
    assert verify_res.json()["data"]["verified"] is True

    # 4. Check user in DB is now verified
    await db_session.refresh(user_in_db)
    assert user_in_db.is_verified is True

    # 5. Attempt login AFTER verification (must succeed with 200)
    login_after = await async_client.post(
        "/api/v1/auth/login",
        json={"email": "verifyuser@example.com", "password": "SecurePass123!"},
    )
    assert login_after.status_code == 200
    assert login_after.json()["success"] is True
    assert "access_token" in login_after.json()["data"]


@pytest.mark.asyncio
async def test_email_verification_get_endpoint(
    async_client: httpx.AsyncClient,
    db_session: AsyncSession,
    test_user: User,
):
    """Test GET /api/v1/auth/verify-email with query parameter token."""
    from app.services.auth_service import AuthService
    raw_token = await AuthService.create_email_verification_token(db_session, test_user.id)

    res = await async_client.get(f"/api/v1/auth/verify-email?token={raw_token}")
    assert res.status_code == 200
    assert res.json()["success"] is True
    assert res.json()["data"]["verified"] is True


@pytest.mark.asyncio
async def test_resend_verification_generic_response(
    async_client: httpx.AsyncClient,
):
    """Test resend-verification returns generic success message for both existing and non-existing emails."""
    # Existing user
    res1 = await async_client.post(
        "/api/v1/auth/resend-verification",
        json={"email": "testuser@example.com"},
    )
    assert res1.status_code == 200
    data1 = res1.json()
    assert data1["success"] is True
    assert "verification link has been sent" in data1["message"]

    # Non-existent user (must return identical generic message)
    res2 = await async_client.post(
        "/api/v1/auth/resend-verification",
        json={"email": "nonexistent999@example.com"},
    )
    assert res2.status_code == 200
    data2 = res2.json()
    assert data2["success"] is True
    assert data2["message"] == data1["message"]


@pytest.mark.asyncio
async def test_forgot_password_generic_response_and_reset_flow(
    async_client: httpx.AsyncClient,
    db_session: AsyncSession,
    test_user: User,
):
    """Test forgot-password returns generic message for all emails and reset-password enables new login."""
    # 1. Generic response for existing user
    res_exist = await async_client.post(
        "/api/v1/auth/forgot-password",
        json={"email": test_user.email},
    )
    assert res_exist.status_code == 200
    data_exist = res_exist.json()
    assert data_exist["success"] is True
    assert "password reset link has been sent" in data_exist["message"]

    # 2. Generic response for non-existent email (prevents enumeration)
    res_non_exist = await async_client.post(
        "/api/v1/auth/forgot-password",
        json={"email": "nobody_exists_here_123@example.com"},
    )
    assert res_non_exist.status_code == 200
    data_non_exist = res_non_exist.json()
    assert data_non_exist["success"] is True
    assert data_non_exist["message"] == data_exist["message"]

    # 3. Create reset token and perform reset
    from app.services.auth_service import AuthService
    raw_token = await AuthService.create_password_reset_token(db_session, test_user.email)
    assert raw_token is not None

    reset_res = await async_client.post(
        "/api/v1/auth/reset-password",
        json={"token": raw_token, "new_password": "NewBrandSecure123!"},
    )
    assert reset_res.status_code == 200
    assert reset_res.json()["data"]["reset"] is True

    # 4. Old password should fail, new password should succeed
    fail_login = await async_client.post(
        "/api/v1/auth/login",
        json={"email": test_user.email, "password": "Password123!"},
    )
    assert fail_login.status_code == 401

    success_login = await async_client.post(
        "/api/v1/auth/login",
        json={"email": test_user.email, "password": "NewBrandSecure123!"},
    )
    assert success_login.status_code == 200
    assert success_login.json()["success"] is True
