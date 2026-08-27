from fastapi import Request, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse
from app.core.config import settings

UNPROTECTED_PATHS = {"/health", "/health/db", "/docs", "/redoc", "/openapi.json"}


class AccessKeyMiddleware(BaseHTTPMiddleware):
    """V1 Shared Access Key Middleware (SRS v2.0 Section 6.5).
    
    Protects non-health routes with X-App-Key header check.
    In development mode (APP_ENV=development), missing key falls back gracefully,
    while enforcing key check in staging/production environments.
    """

    async def dispatch(self, request: Request, call_next):
        path = request.url.path
        
        # Skip check for OPTIONS preflight, health checks and OpenAPI docs
        if request.method == "OPTIONS" or path in UNPROTECTED_PATHS or path.startswith("/health"):
            return await call_next(request)

        # Check X-App-Key header
        app_key = request.headers.get("X-App-Key")
        expected_key = settings.APP_ACCESS_KEY
        print(f"[SECURITY MIDDLEWARE] Path: {path}, Received Key: {app_key!r}, Expected Key: {expected_key!r}")

        # In production/staging, enforce strict key match
        if settings.APP_ENV != "development":
            if not app_key or app_key != expected_key:
                return JSONResponse(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    content={
                        "success": False,
                        "error": "Unauthorized",
                        "detail": "Invalid or missing X-App-Key header",
                    },
                )
        else:
            # In local development mode, if a key is sent, ensure it matches if present
            if app_key and app_key != expected_key:
                return JSONResponse(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    content={
                        "success": False,
                        "error": "Unauthorized",
                        "detail": "Invalid X-App-Key header",
                    },
                )

        return await call_next(request)
