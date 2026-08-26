from fastapi import Request, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse
from app.core.config import settings

UNPROTECTED_PATHS = {"/health", "/health/db", "/docs", "/redoc", "/openapi.json"}


class AccessKeyMiddleware(BaseHTTPMiddleware):
    """V1 Shared Access Key Middleware (SRS v2.0 Section 6.5).
    
    Protects all non-health routes with X-App-Key header check.
    In development mode (APP_ENV=development), missing key falls back gracefully if bypass allowed,
    but enforces key check when header is present or in staging/production.
    """

    async def dispatch(self, request: Request, call_next):
        path = request.url.path
        
        # Skip check for health checks and OpenAPI docs
        if path in UNPROTECTED_PATHS or path.startswith("/health"):
            return await call_next(request)

        # Check X-App-Key header
        app_key = request.headers.get("X-App-Key")
        expected_key = settings.APP_ACCESS_KEY

        # In production/staging or when key is configured, enforce strict match
        if settings.APP_ENV != "development" or app_key is not None:
            if not app_key or app_key != expected_key:
                return JSONResponse(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    content={
                        "success": False,
                        "error": "Unauthorized",
                        "detail": "Invalid or missing X-App-Key header",
                    },
                )

        return await call_next(request)
