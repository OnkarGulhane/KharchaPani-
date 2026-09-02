import asyncio
from typing import Any, Dict, Optional
import httpx
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from fastapi import HTTPException, status
from app.core.config import settings

# Global reusable async client for Google UserInfo API (with keep-alive and connection pooling)
_google_http_client: Optional[httpx.AsyncClient] = None


def get_google_http_client() -> httpx.AsyncClient:
    global _google_http_client
    if _google_http_client is None or _google_http_client.is_closed:
        _google_http_client = httpx.AsyncClient(timeout=10.0)
    return _google_http_client


class GoogleAuthService:
    @staticmethod
    async def verify_google_token_async(token_str: str) -> Dict[str, Any]:
        """Verify Google ID token or Google OAuth2 Access Token asynchronously and fast."""
        if not token_str or not token_str.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Google token is required",
            )

        token_str = token_str.strip()
        client_id = settings.GOOGLE_CLIENT_ID or None

        # Fast token classification:
        # JWT ID tokens start with 'ey' and have exactly 2 dots (header.payload.signature)
        is_jwt_id_token = token_str.startswith("ey") and token_str.count(".") == 2

        if is_jwt_id_token:
            # 1. First attempt: Direct HTTP tokeninfo endpoint (fastest async path, 50ms)
            try:
                client = get_google_http_client()
                res = await client.get(
                    "https://oauth2.googleapis.com/tokeninfo",
                    params={"id_token": token_str},
                )
                if res.status_code == 200:
                    token_info = res.json()
                    email = token_info.get("email")
                    if email:
                        return {
                            "google_id": token_info.get("sub"),
                            "email": email.lower(),
                            "full_name": token_info.get("name") or email.split("@")[0],
                            "picture": token_info.get("picture"),
                        }
            except Exception:
                pass

            # 2. Cryptographically verify ID token in worker thread
            try:
                def _verify():
                    return id_token.verify_oauth2_token(
                        token_str,
                        google_requests.Request(),
                        client_id,
                        clock_skew_in_seconds=60,
                    )
                id_info = await asyncio.to_thread(_verify)
                issuer = id_info.get("iss")
                if issuer in ["accounts.google.com", "https://accounts.google.com"]:
                    email = id_info.get("email")
                    if email:
                        return {
                            "google_id": id_info.get("sub"),
                            "email": email.lower(),
                            "full_name": id_info.get("name") or email.split("@")[0],
                            "picture": id_info.get("picture"),
                        }
            except Exception:
                pass

        # 3. Fast Path for OAuth2 Access Tokens: Verify with Google UserInfo API using persistent async client
        try:
            client = get_google_http_client()
            res = await client.get(
                "https://www.googleapis.com/oauth2/v3/userinfo",
                headers={"Authorization": f"Bearer {token_str}"},
            )
            if res.status_code == 200:
                userinfo = res.json()
                email = userinfo.get("email")
                if email:
                    return {
                        "google_id": userinfo.get("sub"),
                        "email": email.lower(),
                        "full_name": userinfo.get("name") or email.split("@")[0],
                        "picture": userinfo.get("picture"),
                    }
        except Exception:
            pass

        # 4. Fallback for non-standard JWT tokens
        if not is_jwt_id_token and token_str.count(".") == 2:
            try:
                def _verify_fallback():
                    return id_token.verify_oauth2_token(
                        token_str,
                        google_requests.Request(),
                        client_id,
                        clock_skew_in_seconds=60,
                    )
                id_info = await asyncio.to_thread(_verify_fallback)
                email = id_info.get("email")
                if email:
                    return {
                        "google_id": id_info.get("sub"),
                        "email": email.lower(),
                        "full_name": id_info.get("name") or email.split("@")[0],
                        "picture": id_info.get("picture"),
                    }
            except Exception:
                pass

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Google credentials or token expired",
        )

    @staticmethod
    def verify_google_id_token(token_str: str) -> Dict[str, Any]:
        """Synchronous wrapper for backwards compatibility."""
        try:
            loop = asyncio.get_event_loop()
            if loop.is_running():
                # In running loop, use sync httpx fallback
                with httpx.Client(timeout=10.0) as client:
                    res = client.get(
                        "https://www.googleapis.com/oauth2/v3/userinfo",
                        headers={"Authorization": f"Bearer {token_str}"},
                    )
                    if res.status_code == 200:
                        userinfo = res.json()
                        email = userinfo.get("email")
                        if email:
                            return {
                                "google_id": userinfo.get("sub"),
                                "email": email.lower(),
                                "full_name": userinfo.get("name") or email.split("@")[0],
                                "picture": userinfo.get("picture"),
                            }
        except Exception:
            pass
        return asyncio.run(GoogleAuthService.verify_google_token_async(token_str))


