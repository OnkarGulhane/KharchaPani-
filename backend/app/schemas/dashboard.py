from decimal import Decimal
from typing import List, Optional
from pydantic import BaseModel
from app.schemas.expense import ExpenseResponse
from app.schemas.budget import BudgetStatusResponse


class CategoryChartData(BaseModel):
    category_id: int
    category_name: str
    amount: Decimal
    percentage: float


class TrendChartData(BaseModel):
    label: str  # e.g. "2026-08-25" or "Mon"
    amount: Decimal


class DashboardChartsResponse(BaseModel):
    pie_chart: List[CategoryChartData]
    trend_chart: List[TrendChartData]


class DashboardSummaryResponse(BaseModel):
    period: str  # "day", "week", "month"
    total_spent: Decimal
    recent_expenses: List[ExpenseResponse]
    budget_status: Optional[BudgetStatusResponse] = None


class MonthComparisonResponse(BaseModel):
    period: str = "month"
    current_period_total: Decimal
    previous_period_total: Decimal
    percentage_change: float
    is_increase: bool


class TopCategoryResponse(BaseModel):
    rank: int
    category_id: int
    category_name: str
    total_amount: Decimal


class AverageSpendResponse(BaseModel):
    period: str
    average_daily_spend: Decimal
    average_weekly_spend: Optional[Decimal] = None
