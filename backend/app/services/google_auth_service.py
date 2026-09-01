from typing import Any, Dict, Optional
import httpx
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from fastapi import HTTPException, status
from app.core.config import settings


class GoogleAuthService:
    @staticmethod
    def verify_google_id_token(token_str: str) -> Dict[str, Any]:
        """Verify Google ID token or Google OAuth2 Access Token.
        
        Supports both OpenID Connect ID token (JWT) and OAuth2 Access Token (via Google UserInfo API).
        """
        if not token_str or not token_str.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Google token is required",
            )

        client_id = settings.GOOGLE_CLIENT_ID or None

        # 1. Try cryptographically verifying as JWT ID token
        try:
            id_info = id_token.verify_oauth2_token(
                token_str,
                google_requests.Request(),
                client_id,
                clock_skew_in_seconds=60,
            )

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
            # Fall through to check if token is an OAuth2 Access Token
            pass

        # 2. Check as OAuth2 Access Token with Google's UserInfo API
        try:
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

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Google credentials or token expired",
        )

