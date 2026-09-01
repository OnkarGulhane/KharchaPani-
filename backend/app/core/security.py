import hashlib
import secrets
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional, Union
import bcrypt
import jwt
from fastapi import Request, status
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse
from app.core.config import settings


def verify_password(plain_password: str, hashed_password: Optional[str]) -> bool:
    """Verify a plain password against its bcrypt hash."""
    if not hashed_password or not plain_password:
        return False
    try:
        # Bcrypt max password length is 72 bytes
        pwd_bytes = plain_password.encode("utf-8")[:72]
        return bcrypt.checkpw(pwd_bytes, hashed_password.encode("utf-8"))
    except Exception:
        return False


def get_password_hash(password: str) -> str:
    """Generate a bcrypt hash with work factor >= 12."""
    pwd_bytes = password.encode("utf-8")[:72]
    salt = bcrypt.gensalt(rounds=12)
    return bcrypt.hashpw(pwd_bytes, salt).decode("utf-8")


def generate_secure_token() -> str:
    """Generate a cryptographically secure random token string."""
    return secrets.token_urlsafe(48)


def hash_token(token: str) -> str:
    """Compute SHA-256 hex digest of a token for secure database storage."""
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Create signed short-lived JWT access token."""
    to_encode = data.copy()
    now = datetime.now(timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode.update({
        "exp": expire,
        "iat": now,
        "type": "access",
    })
    encoded_jwt = jwt.encode(
        to_encode,
        settings.JWT_SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM,
    )
    return encoded_jwt


def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    """Decode and validate a JWT access token."""
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM],
        )
        if payload.get("type") != "access":
            return None
        return payload
    except (jwt.PyJWTError, Exception):
        return None


UNPROTECTED_PATHS = {
    "/health",
    "/health/db",
    "/docs",
    "/redoc",
    "/openapi.json",
}

AUTH_PATH_PREFIXES = (
    "/api/v1/auth",
    "/auth",
)


class AccessKeyMiddleware(BaseHTTPMiddleware):
    """Access Key Middleware.
    
    Provides backward compatibility for V1 while allowing JWT auth and auth routes to pass cleanly.
    """

    async def dispatch(self, request: Request, call_next):
        path = request.url.path

        # Always bypass preflight, health checks, docs, and authentication endpoints
        if (
            request.method == "OPTIONS"
            or path in UNPROTECTED_PATHS
            or path.startswith("/health")
            or any(path.startswith(prefix) for prefix in AUTH_PATH_PREFIXES)
        ):
            return await call_next(request)

        # Allow Bearer token authenticated requests to pass to router dependencies
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            return await call_next(request)

        # Legacy V1 X-App-Key check fallback
        app_key = request.headers.get("X-App-Key")
        expected_key = settings.APP_ACCESS_KEY

        if settings.APP_ENV != "development":
            if not app_key or app_key != expected_key:
                return JSONResponse(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    content={
                        "success": False,
                        "error": "Unauthorized",
                        "detail": "Invalid or missing authorization credentials",
                    },
                )
        else:
            if app_key and app_key != expected_key:
                return JSONResponse(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    content={
                        "success": False,
                        "error": "Unauthorized",
                        "detail": "Invalid authorization key",
                    },
                )

        return await call_next(request)
