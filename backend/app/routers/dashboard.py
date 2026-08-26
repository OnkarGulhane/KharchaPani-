from typing import List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.dashboard import (
    DashboardSummaryResponse,
    DashboardChartsResponse,
    MonthComparisonResponse,
    TopCategoryResponse,
    AverageSpendResponse,
)
from app.schemas.response import APIResponse
from app.services.dashboard_service import DashboardService

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/summary", response_model=APIResponse[DashboardSummaryResponse])
async def get_dashboard_summary(
    period: str = Query("month", pattern="^(day|week|month)$"),
    db: AsyncSession = Depends(get_db),
):
    """Fetch total spend, recent expenses, and live budget status for selected period toggle."""
    summary = await DashboardService.get_summary(db, period=period)
    return APIResponse(data=summary)


@router.get("/charts", response_model=APIResponse[DashboardChartsResponse])
async def get_dashboard_charts(
    period: str = Query("month", pattern="^(day|week|month)$"),
    db: AsyncSession = Depends(get_db),
):
    """Fetch pie chart (by category) and trend chart (over time) for selected period."""
    charts = await DashboardService.get_charts(db, period=period)
    return APIResponse(data=charts)


@router.get("/comparison", response_model=APIResponse[MonthComparisonResponse])
async def get_month_comparison(db: AsyncSession = Depends(get_db)):
    """Fetch Month-over-Month (MoM) spend comparison with percentage change (FR-23)."""
    comparison = await DashboardService.get_comparison(db)
    return APIResponse(data=comparison)


@router.get("/top-categories", response_model=APIResponse[List[TopCategoryResponse]])
async def get_top_categories(
    period: str = Query("month", pattern="^(day|week|month)$"),
    limit: int = Query(5, ge=1, le=10),
    db: AsyncSession = Depends(get_db),
):
    """Fetch top spending categories ranked (FR-24)."""
    top_cats = await DashboardService.get_top_categories(db, period=period, limit=limit)
    return APIResponse(data=top_cats)


@router.get("/average-spend", response_model=APIResponse[AverageSpendResponse])
async def get_average_spend(
    period: str = Query("month", pattern="^(day|week|month)$"),
    db: AsyncSession = Depends(get_db),
):
    """Fetch normalized average daily and weekly spend for selected period (FR-25)."""
    avg_spend = await DashboardService.get_average_spend(db, period=period)
    return APIResponse(data=avg_spend)
