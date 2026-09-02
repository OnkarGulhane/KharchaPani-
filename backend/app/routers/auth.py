from typing import Optional
from fastapi import APIRouter, Cookie, Depends, HTTPException, Request, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db
from app.core.dependencies import get_current_active_user
from app.models.user import User
from app.schemas.auth import (
    ChangePasswordRequest,
    ForgotPasswordRequest,
    GoogleAuthRequest,
    LoginRequest,
    RefreshTokenRequest,
    RefreshTokenResponse,
    RegisterRequest,
    ResetPasswordRequest,
    TokenResponse,
)
from app.schemas.response import APIResponse
from app.schemas.user import UserResponse
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Authentication"])

REFRESH_COOKIE_NAME = "kharcha_refresh_token"
REFRESH_COOKIE_MAX_AGE = settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60


def set_refresh_cookie(response: Response, refresh_token: str) -> None:
    """Set HttpOnly cookie for refresh token.
    
    Uses SameSite='none' with Secure=True so cross-origin requests from Vercel to Render work on Chrome.
    """
    response.set_cookie(
        key=REFRESH_COOKIE_NAME,
        value=refresh_token,
        max_age=REFRESH_COOKIE_MAX_AGE,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
    )


def clear_refresh_cookie(response: Response) -> None:
    """Clear refresh token cookie."""
    response.delete_cookie(
        key=REFRESH_COOKIE_NAME,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
    )


@router.post("/register", response_model=APIResponse[TokenResponse], status_code=status.HTTP_201_CREATED)
async def register(
    data: RegisterRequest,
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    """Register a new user, automatically seed default starter categories, and issue JWT session."""
    user, access_token, refresh_token = await AuthService.register_user(db, data, request)
    set_refresh_cookie(response, refresh_token)

    return APIResponse(
        data=TokenResponse(
            access_token=access_token,
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            user=UserResponse.model_validate(user),
            refresh_token=refresh_token,
        ),
        message="Account registered successfully",
    )


@router.post("/login", response_model=APIResponse[TokenResponse])
async def login(
    data: LoginRequest,
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    """Authenticate user with email and password, returning short-lived JWT and setting HttpOnly refresh cookie."""
    user, access_token, refresh_token = await AuthService.login_user(db, data.email, data.password, request)
    set_refresh_cookie(response, refresh_token)

    return APIResponse(
        data=TokenResponse(
            access_token=access_token,
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            user=UserResponse.model_validate(user),
            refresh_token=refresh_token,
        ),
        message="Logged in successfully",
    )


@router.post("/google", response_model=APIResponse[TokenResponse])
async def google_auth(
    data: GoogleAuthRequest,
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    """Authenticate or register user using verified Google OAuth 2.0 / OpenID Connect ID token."""
    user, access_token, refresh_token = await AuthService.google_login(db, data.id_token, request)
    set_refresh_cookie(response, refresh_token)

    return APIResponse(
        data=TokenResponse(
            access_token=access_token,
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            user=UserResponse.model_validate(user),
            refresh_token=refresh_token,
        ),
        message="Google authentication successful",
    )


@router.post("/refresh", response_model=APIResponse[RefreshTokenResponse])
async def refresh_token(
    request: Request,
    response: Response,
    body_data: Optional[RefreshTokenRequest] = None,
    kharcha_refresh_token: Optional[str] = Cookie(None, alias=REFRESH_COOKIE_NAME),
    db: AsyncSession = Depends(get_db),
):
    """Rotate refresh token: validates cookie or body token, issues new access token & refresh cookie."""
    token_str = (
        (body_data.refresh_token if body_data and body_data.refresh_token else None)
        or kharcha_refresh_token
        or request.cookies.get(REFRESH_COOKIE_NAME)
    )
    if not token_str:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token cookie missing",
        )

    new_access_token, new_refresh_token = await AuthService.rotate_refresh_token(db, token_str, request)
    set_refresh_cookie(response, new_refresh_token)

    return APIResponse(
        data=RefreshTokenResponse(
            access_token=new_access_token,
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            refresh_token=new_refresh_token,
        ),
        message="Token refreshed successfully",
    )


@router.post("/logout", response_model=APIResponse[dict])
async def logout(
    request: Request,
    response: Response,
    body_data: Optional[RefreshTokenRequest] = None,
    kharcha_refresh_token: Optional[str] = Cookie(None, alias=REFRESH_COOKIE_NAME),
    db: AsyncSession = Depends(get_db),
):
    """Logout from current device: revokes refresh token in database and clears cookie."""
    token_str = (
        (body_data.refresh_token if body_data and body_data.refresh_token else None)
        or kharcha_refresh_token
        or request.cookies.get(REFRESH_COOKIE_NAME)
    )
    if token_str:
        await AuthService.revoke_refresh_token(db, token_str)

    clear_refresh_cookie(response)
    return APIResponse(data={"logged_out": True}, message="Logged out successfully")


@router.post("/logout-all", response_model=APIResponse[dict])
async def logout_all(
    response: Response,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Logout from all devices: revokes all active refresh tokens for the authenticated user."""
    await AuthService.revoke_all_user_sessions(db, current_user.id)
    clear_refresh_cookie(response)
    return APIResponse(data={"logged_out_all": True}, message="Logged out from all devices")


@router.post("/forgot-password", response_model=APIResponse[dict])
async def forgot_password(
    data: ForgotPasswordRequest,
    db: AsyncSession = Depends(get_db),
):
    """Request password reset link."""
    reset_token = await AuthService.create_password_reset_token(db, data.email)
    # In production, email sending service delivers reset_token link.
    # In development/testing, we return success response.
    return APIResponse(
        data={"sent": True, "reset_token": reset_token if settings.DEBUG else None},
        message="If this email is registered, a password reset link has been generated.",
    )


@router.post("/reset-password", response_model=APIResponse[dict])
async def reset_password(
    data: ResetPasswordRequest,
    db: AsyncSession = Depends(get_db),
):
    """Reset password using verified reset token."""
    await AuthService.reset_password(db, data.token, data.new_password)
    return APIResponse(data={"reset": True}, message="Password has been reset successfully. Please log in.")


@router.post("/change-password", response_model=APIResponse[dict])
async def change_password(
    data: ChangePasswordRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Change password for the currently logged-in user."""
    await AuthService.change_password(db, current_user, data.current_password, data.new_password)
    return APIResponse(data={"changed": True}, message="Password changed successfully")


@router.get("/me", response_model=APIResponse[UserResponse])
async def get_current_user_profile(
    current_user: User = Depends(get_current_active_user),
):
    """Retrieve profile of the currently authenticated user."""
    return APIResponse(data=UserResponse.model_validate(current_user))
