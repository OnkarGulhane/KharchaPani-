from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.budget import BudgetCreate, BudgetResponse, BudgetStatusResponse
from app.schemas.response import APIResponse
from app.services.budget_service import BudgetService

router = APIRouter(prefix="/budget", tags=["Budget"])


@router.post("", response_model=APIResponse[BudgetResponse], status_code=status.HTTP_201_CREATED)
async def set_budget(data: BudgetCreate, db: AsyncSession = Depends(get_db)):
    """Set or update overall or category budget limit."""
    budget = await BudgetService.set_budget(db, data)
    return APIResponse(data=budget, message="Budget goal set successfully")


@router.get("", response_model=APIResponse[List[BudgetResponse]])
async def get_budgets(db: AsyncSession = Depends(get_db)):
    """Fetch defined budget settings."""
    budgets = await BudgetService.get_budgets(db)
    return APIResponse(data=budgets)


@router.get("/status", response_model=APIResponse[BudgetStatusResponse])
async def get_budget_status(
    category_id: Optional[int] = Query(None, description="Optional category ID for per-category budget status"),
    db: AsyncSession = Depends(get_db),
):
    """Fetch live remaining budget balance and alert status (on_track / near_limit / over_budget)."""
    status_data = await BudgetService.get_budget_status(db, category_id=category_id)
    return APIResponse(data=status_data)
