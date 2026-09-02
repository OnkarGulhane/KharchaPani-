from typing import Optional
from pydantic import BaseModel, EmailStr, Field
from app.schemas.user import UserResponse


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=100, description="Password must be at least 8 characters")
    full_name: str = Field(..., min_length=2, max_length=150)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=1)


class GoogleAuthRequest(BaseModel):
    id_token: str = Field(..., description="Google OAuth 2.0 / OpenID Connect ID Token")


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int = 900  # 15 minutes in seconds
    user: UserResponse
    refresh_token: Optional[str] = None


class RefreshTokenRequest(BaseModel):
    refresh_token: Optional[str] = None


class RefreshTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int = 900
    refresh_token: Optional[str] = None


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str = Field(..., min_length=10)
    new_password: str = Field(..., min_length=8, max_length=100)


class ChangePasswordRequest(BaseModel):
    current_password: str = Field(..., min_length=1)
    new_password: str = Field(..., min_length=8, max_length=100)
