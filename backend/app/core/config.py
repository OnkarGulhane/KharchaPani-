from typing import List, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_ENV: str = "development"
    DEBUG: bool = True

    # Database URLs
    # Defaults to SQLite async for local zero-config dev/testing
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
    ]

    # API
    API_V1_PREFIX: str = "/api/v1"

    # Shared access key (V1 public host protection gate)
    APP_ACCESS_KEY: str = "dev-shared-access-key-kharcha-pani"

    # Server port
    PORT: int = 8000

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def parse_database_url(cls, v: str) -> str:
        import os
        if isinstance(v, str):
            v = v.strip().strip("'").strip('"')
            # Fallback to SQLite if localhost PostgreSQL is specified in a cloud deployment (Render/Docker)
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
