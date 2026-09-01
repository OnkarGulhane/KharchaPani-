from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_active_user
from app.models.user import User
from app.schemas.budget import BudgetCreate, BudgetResponse, BudgetStatusResponse
from app.schemas.response import APIResponse
from app.services.budget_service import BudgetService

router = APIRouter(prefix="/budget", tags=["Budget"])


@router.post("", response_model=APIResponse[BudgetResponse], status_code=status.HTTP_201_CREATED)
async def set_budget(
    data: BudgetCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Set or update overall or category budget limit for the authenticated user."""
    budget = await BudgetService.set_budget(db, data, user_id=current_user.id)
    return APIResponse(data=budget, message="Budget goal set successfully")


@router.get("", response_model=APIResponse[List[BudgetResponse]])
async def get_budgets(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Fetch defined budget settings for the authenticated user."""
    budgets = await BudgetService.get_budgets(db, user_id=current_user.id)
    return APIResponse(data=budgets)


@router.get("/status", response_model=APIResponse[BudgetStatusResponse])
async def get_budget_status(
    category_id: Optional[int] = Query(None, description="Optional category ID for per-category budget status"),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Fetch live remaining budget balance and alert status for the authenticated user."""
    status_data = await BudgetService.get_budget_status(db, category_id=category_id, user_id=current_user.id)
    return APIResponse(data=status_data)
