from datetime import date
from decimal import Decimal
from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.expense import ExpenseCreate, ExpenseUpdate, ExpenseResponse
from app.schemas.response import APIResponse, PaginatedData
from app.services.expense_service import ExpenseService

router = APIRouter(prefix="/expenses", tags=["Expenses"])


@router.get("", response_model=APIResponse[PaginatedData[ExpenseResponse]])
async def get_expenses(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    category_id: Optional[int] = Query(None),
    search: Optional[str] = Query(None),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    min_amount: Optional[Decimal] = Query(None),
    max_amount: Optional[Decimal] = Query(None),
    payment_mode: Optional[str] = Query(None),
    sort_by: str = Query("date", pattern="^(date|amount|category|title)$"),
    order: str = Query("desc", pattern="^(asc|desc)$"),
    db: AsyncSession = Depends(get_db),
):
    """Fetch paginated expenses with search, multi-filter, and sorting capabilities (usable together)."""
    paginated = await ExpenseService.get_expenses(
        db,
        page=page,
        page_size=page_size,
        category_id=category_id,
        search=search,
        start_date=start_date,
        end_date=end_date,
        min_amount=min_amount,
        max_amount=max_amount,
        payment_mode=payment_mode,
        sort_by=sort_by,
        order=order,
    )
    return APIResponse(data=paginated)


@router.post("", response_model=APIResponse[ExpenseResponse], status_code=status.HTTP_201_CREATED)
async def create_expense(data: ExpenseCreate, db: AsyncSession = Depends(get_db)):
    """Log a new expense entry."""
    expense = await ExpenseService.create_expense(db, data)
    return APIResponse(data=expense, message="Expense logged successfully")


@router.put("/{expense_id}", response_model=APIResponse[ExpenseResponse])
async def update_expense(expense_id: int, data: ExpenseUpdate, db: AsyncSession = Depends(get_db)):
    """Update an existing expense entry."""
    expense = await ExpenseService.update_expense(db, expense_id, data)
    return APIResponse(data=expense, message="Expense updated successfully")


@router.delete("/{expense_id}", response_model=APIResponse[dict])
async def delete_expense(expense_id: int, db: AsyncSession = Depends(get_db)):
    """Delete an expense entry."""
    result = await ExpenseService.delete_expense(db, expense_id)
    return APIResponse(data=result, message="Expense deleted successfully")
