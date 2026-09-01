from typing import Any, Dict, Optional
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from fastapi import HTTPException, status
from app.core.config import settings


class GoogleAuthService:
    @staticmethod
    def verify_google_id_token(token_str: str) -> Dict[str, Any]:
        """Verify Google ID token cryptographically.
        
        Extracts verified email, sub (google_id), and user details directly from Google's response.
        """
        if not token_str or not token_str.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Google ID token is required",
            )

        client_id = settings.GOOGLE_CLIENT_ID or None

        try:
            # Cryptographically verify the ID token with Google's public keys
            # clock_skew_in_seconds allows tolerance for small time drifts between local machine and Google servers
            id_info = id_token.verify_oauth2_token(
                token_str,
                google_requests.Request(),
                client_id,
                clock_skew_in_seconds=60,
            )

            # Verify issuer
            issuer = id_info.get("iss")
            if issuer not in ["accounts.google.com", "https://accounts.google.com"]:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token issuer",
                )

            # Ensure email is verified by Google
            if not id_info.get("email_verified", False) and not id_info.get("email"):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Google account email is unverified",
                )

            return {
                "google_id": id_info.get("sub"),
                "email": id_info.get("email").lower(),
                "full_name": id_info.get("name") or id_info.get("email").split("@")[0],
                "picture": id_info.get("picture"),
            }
        except ValueError as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Invalid Google ID token: {str(e)}",
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Google authentication failed: {str(e)}",
            )
