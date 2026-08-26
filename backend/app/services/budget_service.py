from datetime import date
from decimal import Decimal
from typing import Optional, List
from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from app.models import Budget, Expense, Category
from app.schemas.budget import BudgetCreate, BudgetUpdate, BudgetResponse, BudgetStatusResponse


class BudgetService:
    @staticmethod
    async def set_budget(db: AsyncSession, data: BudgetCreate, user_id: int = 1) -> BudgetResponse:
        """Create or update a budget goal limit."""
        if data.category_id is not None:
            category = await db.get(Category, data.category_id)
            if not category or category.user_id != user_id:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Category not found")

        # Check existing budget for period and category
        stmt = select(Budget).where(
            Budget.period == data.period.lower(),
            Budget.user_id == user_id,
        )
        if data.category_id is None:
            stmt = stmt.where(Budget.category_id.is_(None))
        else:
            stmt = stmt.where(Budget.category_id == data.category_id)

        res = await db.execute(stmt)
        existing = res.scalar_one_or_none()

        if existing:
            existing.amount_limit = data.amount_limit
            budget = existing
        else:
            budget = Budget(
                period=data.period.lower(),
                amount_limit=data.amount_limit,
                category_id=data.category_id,
                user_id=user_id,
            )
            db.add(budget)

        await db.commit()
        await db.refresh(budget)

        cat_name = None
        if budget.category_id:
            cat = await db.get(Category, budget.category_id)
            cat_name = cat.name if cat else None

        return BudgetResponse(
            id=budget.id,
            period=budget.period,
            amount_limit=budget.amount_limit,
            category_id=budget.category_id,
            category_name=cat_name,
        )

    @staticmethod
    async def get_budgets(db: AsyncSession, user_id: int = 1) -> List[BudgetResponse]:
        """Fetch all defined budget goals."""
        stmt = (
            select(Budget, Category.name.label("category_name"))
            .outerjoin(Category, Budget.category_id == Category.id)
            .where(Budget.user_id == user_id)
        )
        res = await db.execute(stmt)
        rows = res.all()

        return [
            BudgetResponse(
                id=b.id,
                period=b.period,
                amount_limit=b.amount_limit,
                category_id=b.category_id,
                category_name=cat_name,
            )
            for b, cat_name in rows
        ]

    @staticmethod
    async def get_budget_status(
        db: AsyncSession, category_id: Optional[int] = None, user_id: int = 1
    ) -> BudgetStatusResponse:
        """Calculate live budget status, remaining balance, and alert level.
        
        Status levels:
        - "on_track": < 80%
        - "near_limit": >= 80% and < 100%
        - "over_budget": >= 100%
        """

        # Fetch relevant budget goal
        stmt = select(Budget).where(Budget.period == "monthly", Budget.user_id == user_id)
        if category_id is None:
            stmt = stmt.where(Budget.category_id.is_(None))
        else:
            stmt = stmt.where(Budget.category_id == category_id)

        res = await db.execute(stmt)
        budget = res.scalar_one_or_none()

        total_budget = budget.amount_limit if budget else Decimal("0.00")

        # Calculate current month's total spend
        today = date.today()
        first_day_of_month = date(today.year, today.month, 1)
        if today.month == 12:
            last_day_of_month = date(today.year, 12, 31)
        else:
            last_day_of_month = date(today.year, today.month + 1, 1) - func.cast("1 day", type_=None)

        exp_stmt = select(func.coalesce(func.sum(Expense.amount), Decimal("0.00"))).where(
            Expense.user_id == user_id,
            Expense.date >= first_day_of_month,
        )
        if category_id:
            exp_stmt = exp_stmt.where(Expense.category_id == category_id)

        exp_res = await db.execute(exp_stmt)
        total_spent = exp_res.scalar_one()

        remaining_balance = total_budget - total_spent
        percentage_used = float((total_spent / total_budget) * 100) if total_budget > 0 else 0.0

        if percentage_used >= 100.0:
            status_str = "over_budget"
        elif percentage_used >= 80.0:
            status_str = "near_limit"
        else:
            status_str = "on_track"

        return BudgetStatusResponse(
            total_budget=total_budget,
            total_spent=total_spent,
            remaining_balance=remaining_balance,
            percentage_used=round(percentage_used, 2),
            status=status_str,
        )
