from datetime import datetime, timedelta, timezone
from typing import Optional, Tuple
from fastapi import HTTPException, Request, status
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.security import (
    create_access_token,
    generate_secure_token,
    get_password_hash,
    hash_token,
    verify_password,
)
from app.models.email_verification import EmailVerificationToken
from app.models.password_reset import PasswordResetToken
from app.models.refresh_token import RefreshToken
from app.models.user import User
from app.schemas.auth import RegisterRequest
from app.seed.seed_categories import seed_user_starter_categories
from app.services.google_auth_service import GoogleAuthService


class AuthService:
    @staticmethod
    async def create_user_session(
        db: AsyncSession,
        user: User,
        request: Optional[Request] = None,
    ) -> Tuple[str, str]:
        """Create an access token (JWT) and a new refresh token (SHA-256 hashed in DB).
        
        Returns: (access_token, raw_refresh_token)
        """
        # Create Access Token
        access_token = create_access_token(data={"sub": str(user.id), "email": user.email})

        # Generate Refresh Token
        raw_refresh_token = generate_secure_token()
        token_hash = hash_token(raw_refresh_token)

        device_info = None
        ip_address = None
        if request:
            device_info = request.headers.get("User-Agent", "")[:250]
            ip_address = request.client.host if request.client else None

        expires_at = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)

        refresh_token_record = RefreshToken(
            user_id=user.id,
            token_hash=token_hash,
            device_info=device_info,
            ip_address=ip_address,
            expires_at=expires_at,
            is_revoked=False,
        )
        db.add(refresh_token_record)
        await db.commit()

        return access_token, raw_refresh_token

    @staticmethod
    async def register_user(
        db: AsyncSession,
        data: RegisterRequest,
    ) -> User:
        """Register a new user with is_verified=False and seed starter categories."""
        email_clean = data.email.strip().lower()

        # Check existing email
        stmt = select(User).where(User.email == email_clean)
        result = await db.execute(stmt)
        existing = result.scalar_one_or_none()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="An account with this email address already exists",
            )

        # Hash password and create user
        hashed_password = get_password_hash(data.password)
        new_user = User(
            email=email_clean,
            hashed_password=hashed_password,
            full_name=data.full_name.strip(),
            is_active=True,
            is_verified=False,
        )
        db.add(new_user)
        await db.commit()
        await db.refresh(new_user)

        # Automatically seed starter categories for the new user
        await seed_user_starter_categories(db, user_id=new_user.id)

        return new_user

    @staticmethod
    async def login_user(
        db: AsyncSession,
        email: str,
        password: str,
        request: Optional[Request] = None,
    ) -> Tuple[User, str, str]:
        """Validate email/password, verify email activation, and issue session tokens."""
        email_clean = email.strip().lower()

        stmt = select(User).where(User.email == email_clean)
        result = await db.execute(stmt)
        user = result.scalar_one_or_none()

        if not user or not user.hashed_password:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
            )

        if not verify_password(password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
            )

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account is deactivated. Please contact support.",
            )

        if not user.is_verified:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Please verify your email address before logging in. Check your inbox for the verification link.",
            )

        access_token, refresh_token = await AuthService.create_user_session(db, user, request)
        return user, access_token, refresh_token

    @staticmethod
    async def google_login(
        db: AsyncSession,
        id_token_str: str,
        request: Optional[Request] = None,
    ) -> Tuple[User, str, str]:
        """Authenticate or register user via verified Google ID token or OAuth access token."""
        google_data = await GoogleAuthService.verify_google_token_async(id_token_str)
        email = google_data["email"]
        google_id = google_data["google_id"]
        full_name = google_data["full_name"]

        # Check if user exists by email or google_id
        stmt = select(User).where((User.email == email) | (User.google_id == google_id))
        result = await db.execute(stmt)
        user = result.scalar_one_or_none()

        if user:
            # Link Google ID if not present
            if not user.google_id:
                user.google_id = google_id
                user.is_verified = True
                await db.commit()
                await db.refresh(user)
        else:
            # Create new user
            user = User(
                email=email,
                full_name=full_name,
                google_id=google_id,
                is_active=True,
                is_verified=True,
                hashed_password=None,
            )
            db.add(user)
            await db.commit()
            await db.refresh(user)

            # Seed default starter categories for new user
            await seed_user_starter_categories(db, user_id=user.id)

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account is deactivated.",
            )

        access_token, refresh_token = await AuthService.create_user_session(db, user, request)
        return user, access_token, refresh_token

    @staticmethod
    async def rotate_refresh_token(
        db: AsyncSession,
        raw_refresh_token: str,
        request: Optional[Request] = None,
    ) -> Tuple[str, str]:
        """Rotate a refresh token: revokes used token and issues a fresh access + refresh token pair."""
        if not raw_refresh_token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Refresh token is missing",
            )

        token_hash = hash_token(raw_refresh_token)

        stmt = select(RefreshToken).where(RefreshToken.token_hash == token_hash)
        result = await db.execute(stmt)
        record = result.scalar_one_or_none()

        now = datetime.now(timezone.utc)

        if not record:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token",
            )

        if record.is_revoked:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Refresh token has been revoked",
            )

        expires_at = record.expires_at
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)

        if expires_at < now:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Refresh token has expired",
            )

        # Revoke the used refresh token (Rotation)
        record.is_revoked = True
        record.revoked_at = now
        await db.commit()

        # Fetch user
        stmt_user = select(User).where(User.id == record.user_id)
        res_user = await db.execute(stmt_user)
        user = res_user.scalar_one_or_none()

        if not user or not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User account inactive or deleted",
            )

        # Create new token pair
        new_access_token, new_refresh_token = await AuthService.create_user_session(db, user, request)
        return new_access_token, new_refresh_token

    @staticmethod
    async def revoke_refresh_token(db: AsyncSession, raw_refresh_token: str) -> None:
        """Revoke a single refresh token (Logout)."""
        if not raw_refresh_token:
            return

        token_hash = hash_token(raw_refresh_token)
        now = datetime.now(timezone.utc)

        stmt = (
            update(RefreshToken)
            .where(RefreshToken.token_hash == token_hash)
            .values(is_revoked=True, revoked_at=now)
        )
        await db.execute(stmt)
        await db.commit()

    @staticmethod
    async def revoke_all_user_sessions(db: AsyncSession, user_id: int) -> None:
        """Revoke all active refresh tokens for a user (Logout All)."""
        now = datetime.now(timezone.utc)
        stmt = (
            update(RefreshToken)
            .where(RefreshToken.user_id == user_id, RefreshToken.is_revoked == False)
            .values(is_revoked=True, revoked_at=now)
        )
        await db.execute(stmt)
        await db.commit()

    @staticmethod
    async def create_email_verification_token(db: AsyncSession, user_id: int) -> Optional[str]:
        """Generate a one-time email verification token (SHA-256 stored)."""
        try:
            raw_token = generate_secure_token()
            token_hash = hash_token(raw_token)
            expires_at = datetime.now(timezone.utc) + timedelta(minutes=settings.EMAIL_VERIFICATION_EXPIRE_MINUTES)

            verification_record = EmailVerificationToken(
                user_id=user_id,
                token_hash=token_hash,
                expires_at=expires_at,
                is_used=False,
            )
            db.add(verification_record)
            await db.commit()
            return raw_token
        except Exception as e:
            await db.rollback()
            print(f"Warning: Failed to create email verification token: {e}")
            return None

    @staticmethod
    async def verify_email(db: AsyncSession, raw_token: str) -> User:
        """Verify user's email using a single-use token."""
        token_hash = hash_token(raw_token)
        now = datetime.now(timezone.utc)

        stmt = select(EmailVerificationToken).where(EmailVerificationToken.token_hash == token_hash)
        result = await db.execute(stmt)
        record = result.scalar_one_or_none()

        if not record or record.is_used:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or already used verification token",
            )

        expires_at = record.expires_at
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)

        if expires_at < now:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email verification link has expired",
            )

        # Mark token as used
        record.is_used = True

        # Update user is_verified
        stmt_user = select(User).where(User.id == record.user_id)
        res_user = await db.execute(stmt_user)
        user = res_user.scalar_one_or_none()

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User account not found",
            )

        user.is_verified = True
        await db.commit()
        await db.refresh(user)

        return user

    @staticmethod
    async def create_password_reset_token(db: AsyncSession, email: str) -> Optional[str]:
        """Generate a one-time password reset token (SHA-256 stored)."""
        email_clean = email.strip().lower()
        stmt = select(User).where(User.email == email_clean)
        result = await db.execute(stmt)
        user = result.scalar_one_or_none()

        if not user:
            # Return silently to prevent user enumeration
            return None

        raw_token = generate_secure_token()
        token_hash = hash_token(raw_token)
        expires_at = datetime.now(timezone.utc) + timedelta(minutes=settings.PASSWORD_RESET_EXPIRE_MINUTES)

        reset_record = PasswordResetToken(
            user_id=user.id,
            token_hash=token_hash,
            expires_at=expires_at,
            is_used=False,
        )
        db.add(reset_record)
        await db.commit()

        return raw_token

    @staticmethod
    async def reset_password(
        db: AsyncSession,
        raw_token: str,
        new_password: str,
    ) -> None:
        """Reset password using verified token and revoke all active sessions."""
        token_hash = hash_token(raw_token)
        now = datetime.now(timezone.utc)

        stmt = select(PasswordResetToken).where(PasswordResetToken.token_hash == token_hash)
        result = await db.execute(stmt)
        record = result.scalar_one_or_none()

        if not record or record.is_used:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or already used password reset link",
            )

        expires_at = record.expires_at
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)

        if expires_at < now:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password reset link has expired",
            )

        # Mark token as used
        record.is_used = True

        # Update user password
        stmt_user = select(User).where(User.id == record.user_id)
        res_user = await db.execute(stmt_user)
        user = res_user.scalar_one_or_none()

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User account not found",
            )

        user.hashed_password = get_password_hash(new_password)
        await db.commit()

        # Revoke all active sessions for security
        await AuthService.revoke_all_user_sessions(db, user.id)

    @staticmethod
    async def change_password(
        db: AsyncSession,
        user: User,
        current_password: str,
        new_password: str,
    ) -> None:
        """Change password for an authenticated user."""
        if not user.hashed_password or not verify_password(current_password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current password is incorrect",
            )

        user.hashed_password = get_password_hash(new_password)
        await db.commit()

        # Revoke all other sessions
        await AuthService.revoke_all_user_sessions(db, user.id)
