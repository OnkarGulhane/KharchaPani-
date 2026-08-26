from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db

router = APIRouter(tags=["Health"])


@router.get("/health")
async def health_check():
    """Liveness check — returns 200 OK if process is running (not gated by access key)."""
    return {"status": "ok", "message": "Kharcha Pani Backend is healthy"}


@router.get("/health/db")
async def health_db_check(db: AsyncSession = Depends(get_db)):
    """Readiness check — verifies database connection (not gated by access key)."""
    try:
        await db.execute(text("SELECT 1"))
        return {"status": "ok", "database": "connected"}
    except Exception as e:
        return {"status": "error", "database": str(e)}
