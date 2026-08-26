from datetime import date
from decimal import Decimal
from typing import Optional, List, Tuple
from sqlalchemy import select, func, or_, and_, desc, asc
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from app.models import Expense, Category
from app.schemas.expense import ExpenseCreate, ExpenseUpdate, ExpenseResponse
from app.schemas.response import PaginatedData


class ExpenseService:
    @staticmethod
    async def get_expenses(
        db: AsyncSession,
        page: int = 1,
        page_size: int = 20,
        category_id: Optional[int] = None,
        search: Optional[str] = None,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        min_amount: Optional[Decimal] = None,
        max_amount: Optional[Decimal] = None,
        payment_mode: Optional[str] = None,
        sort_by: str = "date",  # date, amount, category, title
        order: str = "desc",
        user_id: int = 1,
    ) -> PaginatedData[ExpenseResponse]:
        """Fetch paginated expenses with filters and sorting."""
        query = select(Expense, Category.name.label("category_name")).join(
            Category, Expense.category_id == Category.id
        ).where(Expense.user_id == user_id)

        # Filters
        if category_id:
            query = query.where(Expense.category_id == category_id)
        if search:
            search_pattern = f"%{search.strip()}%"
            query = query.where(
                or_(
                    Expense.title.ilike(search_pattern),
                    Expense.notes.ilike(search_pattern),
                )
            )
        if start_date:
            query = query.where(Expense.date >= start_date)
        if end_date:
            query = query.where(Expense.date <= end_date)
        if min_amount is not None:
            query = query.where(Expense.amount >= min_amount)
        if max_amount is not None:
            query = query.where(Expense.amount <= max_amount)
        if payment_mode:
            query = query.where(Expense.payment_mode.ilike(payment_mode.strip()))

        # Total count query
        count_query = select(func.count()).select_from(query.subquery())
        count_res = await db.execute(count_query)
        total = count_res.scalar_one()

        # Sorting
        sort_column = Expense.date
        if sort_by == "amount":
            sort_column = Expense.amount
        elif sort_by == "title":
            sort_column = Expense.title
        elif sort_by == "category":
            sort_column = Category.name

        if order.lower() == "asc":
            query = query.order_by(asc(sort_column), asc(Expense.id))
        else:
            query = query.order_by(desc(sort_column), desc(Expense.id))

        # Pagination
        offset = (page - 1) * page_size
        query = query.offset(offset).limit(page_size)

        result = await db.execute(query)
        rows = result.all()

        items = [
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
            for exp, cat_name in rows
        ]

        has_next = (page * page_size) < total

        return PaginatedData[ExpenseResponse](
            items=items,
            total=total,
            page=page,
            page_size=page_size,
            has_next=has_next,
        )

    @staticmethod
    async def create_expense(db: AsyncSession, data: ExpenseCreate, user_id: int = 1) -> ExpenseResponse:
        """Create a new expense entry."""
        category = await db.get(Category, data.category_id)
        if not category or category.user_id != user_id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Target category does not exist")

        expense = Expense(
            title=data.title.strip(),
            amount=data.amount,
            date=data.date,
            notes=data.notes.strip() if data.notes else None,
            payment_mode=data.payment_mode.strip() if data.payment_mode else None,
            category_id=data.category_id,
            user_id=user_id,
        )
        db.add(expense)
        await db.commit()
        await db.refresh(expense)

        return ExpenseResponse(
            id=expense.id,
            title=expense.title,
            amount=expense.amount,
            date=expense.date,
            notes=expense.notes,
            payment_mode=expense.payment_mode,
            category_id=expense.category_id,
            category_name=category.name,
        )

    @staticmethod
    async def update_expense(
        db: AsyncSession, expense_id: int, data: ExpenseUpdate, user_id: int = 1
    ) -> ExpenseResponse:
        """Update an existing expense entry."""
        expense = await db.get(Expense, expense_id)
        if not expense or expense.user_id != user_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Expense not found")

        if data.category_id is not None:
            category = await db.get(Category, data.category_id)
            if not category or category.user_id != user_id:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Target category does not exist")
            expense.category_id = data.category_id

        if data.title is not None:
            expense.title = data.title.strip()
        if data.amount is not None:
            expense.amount = data.amount
        if data.date is not None:
            expense.date = data.date
        if data.notes is not None:
            expense.notes = data.notes.strip() if data.notes else None
        if data.payment_mode is not None:
            expense.payment_mode = data.payment_mode.strip() if data.payment_mode else None

        await db.commit()
        await db.refresh(expense)

        # Get category name
        cat = await db.get(Category, expense.category_id)
        cat_name = cat.name if cat else None

        return ExpenseResponse(
            id=expense.id,
            title=expense.title,
            amount=expense.amount,
            date=expense.date,
            notes=expense.notes,
            payment_mode=expense.payment_mode,
            category_id=expense.category_id,
            category_name=cat_name,
        )

    @staticmethod
    async def delete_expense(db: AsyncSession, expense_id: int, user_id: int = 1) -> dict:
        """Delete an expense entry."""
        expense = await db.get(Expense, expense_id)
        if not expense or expense.user_id != user_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Expense not found")

        await db.delete(expense)
        await db.commit()
        return {"message": "Expense deleted successfully"}
