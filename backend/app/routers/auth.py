from typing import Optional
from fastapi import APIRouter, BackgroundTasks, Cookie, Depends, HTTPException, Query, Request, Response, status
from sqlalchemy import select
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
    ResendVerificationRequest,
    ResetPasswordRequest,
    TokenResponse,
    VerifyEmailRequest,
)
from app.schemas.response import APIResponse
from app.schemas.user import UserResponse
from app.services.auth_service import AuthService
from app.services.email_service import EmailService

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
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    """Register a new user, seed starter categories, send verification email, and issue JWT session."""
    user, access_token, refresh_token = await AuthService.register_user(db, data, request)
    set_refresh_cookie(response, refresh_token)

    # Generate email verification token and dispatch email in background
    try:
        verify_token = await AuthService.create_email_verification_token(db, user.id)
        if verify_token:
            background_tasks.add_task(
                EmailService.send_verification_email,
                to_email=user.email,
                verification_token=verify_token,
                user_name=user.full_name,
            )
    except Exception as exc:
        print(f"[Register] Background email verification notice: {exc}")

    return APIResponse(
        data=TokenResponse(
            access_token=access_token,
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            user=UserResponse.model_validate(user),
            refresh_token=refresh_token,
        ),
        message="Account registered successfully. Please check your email to verify your account.",
    )


@router.post("/verify-email", response_model=APIResponse[dict])
async def verify_email_post(
    data: VerifyEmailRequest,
    db: AsyncSession = Depends(get_db),
):
    """Verify user's email address using token submitted in request body."""
    user = await AuthService.verify_email(db, data.token)
    return APIResponse(
        data={"verified": True, "email": user.email},
        message="Email verified successfully. Your account is now active.",
    )


@router.get("/verify-email", response_model=APIResponse[dict])
async def verify_email_get(
    token: str = Query(..., min_length=10, description="Verification token from link"),
    db: AsyncSession = Depends(get_db),
):
    """Verify user's email address via link query parameter."""
    user = await AuthService.verify_email(db, token)
    return APIResponse(
        data={"verified": True, "email": user.email},
        message="Email verified successfully. Your account is now active.",
    )


@router.post("/resend-verification", response_model=APIResponse[dict])
async def resend_verification(
    data: ResendVerificationRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    """Resend email verification link without revealing user existence."""
    email_clean = data.email.strip().lower()
    stmt = select(User).where(User.email == email_clean)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    if user and not user.is_verified:
        verify_token = await AuthService.create_email_verification_token(db, user.id)
        background_tasks.add_task(
            EmailService.send_verification_email,
            to_email=user.email,
            verification_token=verify_token,
            user_name=user.full_name,
        )

    return APIResponse(
        data={"sent": True},
        message="If this email is registered and unverified, a verification link has been sent to your inbox.",
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
    cookie_token: Optional[str] = Cookie(default=None, alias=REFRESH_COOKIE_NAME),
    db: AsyncSession = Depends(get_db),
):
    """Rotate refresh token: invalidates old refresh token, issues a new access token and fresh refresh token."""
    token_candidate = cookie_token or (body_data.refresh_token if body_data else None)

    if not token_candidate:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token missing. Please log in again.",
        )

    access_token, new_refresh_token = await AuthService.rotate_refresh_token(db, token_candidate, request)
    set_refresh_cookie(response, new_refresh_token)

    return APIResponse(
        data=RefreshTokenResponse(
            access_token=access_token,
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            refresh_token=new_refresh_token,
        ),
        message="Session refreshed successfully",
    )


@router.post("/logout", response_model=APIResponse[dict])
async def logout(
    response: Response,
    body_data: Optional[RefreshTokenRequest] = None,
    cookie_token: Optional[str] = Cookie(default=None, alias=REFRESH_COOKIE_NAME),
    db: AsyncSession = Depends(get_db),
):
    """Logout from current device: revokes provided refresh token and clears cookie."""
    token_candidate = cookie_token or (body_data.refresh_token if body_data else None)
    if token_candidate:
        await AuthService.revoke_refresh_token(db, token_candidate)

    clear_refresh_cookie(response)
    return APIResponse(data={"logged_out": True}, message="Logged out successfully")


@router.post("/logout-all", response_model=APIResponse[dict])
async def logout_all_devices(
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
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    """Request password reset link without revealing user existence."""
    reset_token = await AuthService.create_password_reset_token(db, data.email)
    
    if reset_token:
        # Schedule email sending via BackgroundTasks
        background_tasks.add_task(
            EmailService.send_password_reset_email,
            to_email=data.email,
            reset_token=reset_token,
        )

    return APIResponse(
        data={"sent": True, "reset_token": reset_token if settings.DEBUG else None},
        message="If this email is registered, a password reset link has been sent to your inbox.",
    )


@router.post("/reset-password", response_model=APIResponse[dict])
async def reset_password(
    data: ResetPasswordRequest,
    db: AsyncSession = Depends(get_db),
):
    """Reset password using verified single-use reset token."""
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
