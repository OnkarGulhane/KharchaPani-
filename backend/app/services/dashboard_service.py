from datetime import date, timedelta
from decimal import Decimal
from typing import List, Tuple
from sqlalchemy import select, func, desc, extract
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Expense, Category
from app.schemas.dashboard import (
    DashboardSummaryResponse,
    DashboardChartsResponse,
    CategoryChartData,
    TrendChartData,
    MonthComparisonResponse,
    TopCategoryResponse,
    AverageSpendResponse,
)
from app.schemas.expense import ExpenseResponse
from app.services.budget_service import BudgetService


class DashboardService:
    @staticmethod
    def _get_date_range(period: str) -> Tuple[date, date]:
        """Utility to calculate start and end dates for a period toggle (day/week/month)."""
        today = date.today()
        period = period.lower()

        if period == "day":
            return today, today
        elif period == "week":
            start = today - timedelta(days=today.weekday())  # Monday of current week
            return start, today
        else:  # "month" (default)
            start = date(today.year, today.month, 1)
            return start, today

    @staticmethod
    async def get_summary(
        db: AsyncSession, period: str = "month", user_id: int = 1
    ) -> DashboardSummaryResponse:
        """Dashboard Summary Card Totals, Recent Expenses, and Live Budget Status."""
        start_date, end_date = DashboardService._get_date_range(period)

        # Total spend query
        spend_stmt = select(func.coalesce(func.sum(Expense.amount), Decimal("0.00"))).where(
            Expense.user_id == user_id,
            Expense.date >= start_date,
            Expense.date <= end_date,
        )
        spend_res = await db.execute(spend_stmt)
        total_spent = spend_res.scalar_one()

        # Recent 5 expenses
        recent_stmt = (
            select(Expense, Category.name.label("category_name"))
            .join(Category, Expense.category_id == Category.id)
            .where(Expense.user_id == user_id)
            .order_by(desc(Expense.date), desc(Expense.id))
            .limit(5)
        )
        recent_res = await db.execute(recent_stmt)
        recent_rows = recent_res.all()

        recent_expenses = [
            ExpenseResponse(
                id=exp.id,
                title=exp.title,
                amount=exp.amount,
                date=exp.date,
                notes=exp.notes,
                payment_mode=exp.payment_mode,
                category_id=exp.category_id,
                category_name=cat_name,
            )
            for exp, cat_name in recent_rows
        ]

        # Budget status
        budget_status = await BudgetService.get_budget_status(db, user_id=user_id)

        return DashboardSummaryResponse(
            period=period,
            total_spent=total_spent,
            recent_expenses=recent_expenses,
            budget_status=budget_status,
        )

    @staticmethod
    async def get_charts(
        db: AsyncSession, period: str = "month", user_id: int = 1
    ) -> DashboardChartsResponse:
        """Category Pie Chart distribution and Spend Trend bar/line chart data."""
        start_date, end_date = DashboardService._get_date_range(period)

        # 1. Category Pie Chart
        pie_stmt = (
            select(
                Category.id.label("category_id"),
                Category.name.label("category_name"),
                func.coalesce(func.sum(Expense.amount), Decimal("0.00")).label("amount"),
            )
            .join(Expense, Category.id == Expense.category_id)
            .where(
                Expense.user_id == user_id,
                Expense.date >= start_date,
                Expense.date <= end_date,
            )
            .group_by(Category.id, Category.name)
            .order_by(desc("amount"))
        )
        pie_res = await db.execute(pie_stmt)
        pie_rows = pie_res.all()

        period_total = sum((r.amount for r in pie_rows), Decimal("0.00"))
        pie_chart = [
            CategoryChartData(
                category_id=r.category_id,
                category_name=r.category_name,
                amount=r.amount,
                percentage=round(float((r.amount / period_total) * 100), 2) if period_total > 0 else 0.0,
            )
            for r in pie_rows
        ]

        # 2. Spend Trend Chart over time
        trend_stmt = (
            select(
                Expense.date,
                func.coalesce(func.sum(Expense.amount), Decimal("0.00")).label("amount"),
            )
            .where(
                Expense.user_id == user_id,
                Expense.date >= start_date,
                Expense.date <= end_date,
            )
            .group_by(Expense.date)
            .order_by(Expense.date.asc())
        )
        trend_res = await db.execute(trend_stmt)
        trend_rows = trend_res.all()

        trend_chart = [
            TrendChartData(
                label=r.date.isoformat(),
                amount=r.amount,
            )
            for r in trend_rows
        ]

        return DashboardChartsResponse(pie_chart=pie_chart, trend_chart=trend_chart)

    @staticmethod
    async def get_comparison(db: AsyncSession, user_id: int = 1) -> MonthComparisonResponse:
        """Month-over-month (MoM) spend comparison (FR-23)."""
        today = date.today()
        # Current month range
        curr_start = date(today.year, today.month, 1)
        curr_end = today

        # Previous month range
        if today.month == 1:
            prev_year = today.year - 1
            prev_month = 12
        else:
            prev_year = today.year
            prev_month = today.month - 1

        prev_start = date(prev_year, prev_month, 1)
        # Handle end of previous month
        if prev_month == 12:
            prev_end = date(prev_year, 12, 31)
        else:
            prev_end = date(prev_year, prev_month + 1, 1) - timedelta(days=1)

        # Current total
        curr_stmt = select(func.coalesce(func.sum(Expense.amount), Decimal("0.00"))).where(
            Expense.user_id == user_id,
            Expense.date >= curr_start,
            Expense.date <= curr_end,
        )
        curr_res = await db.execute(curr_stmt)
        curr_total = curr_res.scalar_one()

        # Previous total
        prev_stmt = select(func.coalesce(func.sum(Expense.amount), Decimal("0.00"))).where(
            Expense.user_id == user_id,
            Expense.date >= prev_start,
            Expense.date <= prev_end,
        )
        prev_res = await db.execute(prev_stmt)
        prev_total = prev_res.scalar_one()

        if prev_total > 0:
            pct_change = float(((curr_total - prev_total) / prev_total) * 100)
        else:
            pct_change = 100.0 if curr_total > 0 else 0.0

        return MonthComparisonResponse(
            period="month",
            current_period_total=curr_total,
            previous_period_total=prev_total,
            percentage_change=round(pct_change, 2),
            is_increase=curr_total >= prev_total,
        )

    @staticmethod
    async def get_top_categories(
        db: AsyncSession, period: str = "month", limit: int = 5, user_id: int = 1
    ) -> List[TopCategoryResponse]:
        """Ranked top categories by spend (FR-24)."""
        start_date, end_date = DashboardService._get_date_range(period)

        stmt = (
            select(
                Category.id.label("category_id"),
                Category.name.label("category_name"),
                func.coalesce(func.sum(Expense.amount), Decimal("0.00")).label("total_amount"),
            )
            .join(Expense, Category.id == Expense.category_id)
            .where(
                Expense.user_id == user_id,
                Expense.date >= start_date,
                Expense.date <= end_date,
            )
            .group_by(Category.id, Category.name)
            .order_by(desc("total_amount"))
            .limit(limit)
        )
        res = await db.execute(stmt)
        rows = res.all()

        return [
            TopCategoryResponse(
                rank=idx + 1,
                category_id=r.category_id,
                category_name=r.category_name,
                total_amount=r.total_amount,
            )
            for idx, r in enumerate(rows)
        ]

    @staticmethod
    async def get_average_spend(
        db: AsyncSession, period: str = "month", user_id: int = 1
    ) -> AverageSpendResponse:
        """Normalized average daily and weekly spend (FR-25)."""
        start_date, end_date = DashboardService._get_date_range(period)

        stmt = select(func.coalesce(func.sum(Expense.amount), Decimal("0.00"))).where(
            Expense.user_id == user_id,
            Expense.date >= start_date,
            Expense.date <= end_date,
        )
        res = await db.execute(stmt)
        total_spend = res.scalar_one()

        days_count = max((end_date - start_date).days + 1, 1)
        avg_daily = total_spend / Decimal(days_count)
        avg_weekly = avg_daily * Decimal("7.0")

        return AverageSpendResponse(
            period=period,
            average_daily_spend=round(avg_daily, 2),
            average_weekly_spend=round(avg_weekly, 2),
        )
