from typing import List, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_ENV: str = "development"
    DEBUG: bool = True

    # Database URLs
    DATABASE_URL: str = "sqlite+aiosqlite:///./kharchapani.db"
    DATABASE_URL_POOLED: Union[str, None] = None

    # CORS
    ALLOWED_ORIGINS: Union[List[str], str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "https://kharcha-pani.vercel.app",
        "https://kharcha-pani-kappa.vercel.app",
    ]

    # API
    API_V1_PREFIX: str = "/api/v1"

    # Shared access key (V1 public host protection gate)
    APP_ACCESS_KEY: str = "dev-shared-access-key-kharcha-pani"

    # JWT & Authentication (Phase 2)
    JWT_SECRET_KEY: str = "kharcha-pani-super-secure-jwt-secret-key-for-signing-access-tokens-2026"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30
    PASSWORD_RESET_TOKEN_EXPIRE_HOURS: int = 24

    # Google OAuth 2.0 (Phase 2)
    GOOGLE_CLIENT_ID: str = "604011563193-ft5ril7p9cv01jtaldutqn5gplvpadn2.apps.googleusercontent.com"
    GOOGLE_CLIENT_SECRET: str = ""

    # Email Service Configuration
    EMAIL_PROVIDER: str = "gmail"  # "gmail" or "resend"
    FRONTEND_URL: str = "http://localhost:3000"

    # Gmail SMTP Configuration
    GMAIL_SMTP_HOST: str = "smtp.gmail.com"
    GMAIL_SMTP_PORT: int = 587
    GMAIL_SMTP_USERNAME: str = ""
    GMAIL_SMTP_PASSWORD: str = ""
    GMAIL_FROM_EMAIL: str = ""
    GMAIL_FROM_NAME: str = "KharchaPani"

    # Resend API Configuration
    RESEND_API_KEY: str = ""
    RESEND_FROM_EMAIL: str = ""
    RESEND_FROM_NAME: str = "KharchaPani"

    # Token Expiry Configuration (Minutes)
    EMAIL_VERIFICATION_EXPIRE_MINUTES: int = 30
    PASSWORD_RESET_EXPIRE_MINUTES: int = 30

    # Server port
    PORT: int = 8000

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def parse_database_url(cls, v: str) -> str:
        import os
        if isinstance(v, str):
            v = v.strip().strip("'").strip('"')
            if ("localhost:5432" in v or "127.0.0.1:5432" in v) and os.getenv("RENDER"):
                return "sqlite+aiosqlite:///./kharchapani.db"
            if v.startswith("postgres://"):
                v = v.replace("postgres://", "postgresql+asyncpg://", 1)
            elif v.startswith("postgresql://") and not v.startswith("postgresql+asyncpg://"):
                v = v.replace("postgresql://", "postgresql+asyncpg://", 1)
        return v

    @field_validator("ALLOWED_ORIGINS", mode="before")
    @classmethod
    def parse_allowed_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        return v

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
