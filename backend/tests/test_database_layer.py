from datetime import date, timedelta
from decimal import Decimal
import pytest
from pydantic import ValidationError
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker

from app.models import Base, Category, Expense, Budget
from app.schemas.expense import ExpenseCreate
from app.schemas.category import CategoryCreate
from app.schemas.budget import BudgetCreate
from app.seed.seed_categories import seed_starter_categories, DEFAULT_CATEGORIES


# Test 1: Validation Rules (Positive Amount & No Future Date)
def test_expense_validation_positive_amount():
    with pytest.raises(ValidationError) as exc_info:
        ExpenseCreate(
            title="Invalid Expense",
            amount=Decimal("-50.00"),
            date=date.today(),
            category_id=1,
        )
    assert "Amount must be a positive number" in str(exc_info.value)


def test_expense_validation_no_future_date():
    future_date = date.today() + timedelta(days=1)
    with pytest.raises(ValidationError) as exc_info:
        ExpenseCreate(
            title="Future Expense",
            amount=Decimal("100.00"),
            date=future_date,
            category_id=1,
        )
    assert "Expense date cannot be in the future" in str(exc_info.value)


def test_expense_validation_valid():
    valid = ExpenseCreate(
        title="Valid Lunch",
        amount=Decimal("250.50"),
        date=date.today(),
        category_id=1,
    )
    assert valid.title == "Valid Lunch"
    assert valid.amount == Decimal("250.50")


# Test 2: Database Layer Integration Test (In-Memory SQLite Async Engine)
@pytest.mark.asyncio
async def test_database_models_and_seeding():
    engine = create_async_engine("sqlite+aiosqlite:///:memory:", echo=False)
    async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    # 1. Create tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # 2. Seed categories
    async with async_session() as session:
        await seed_starter_categories(session)

    # 3. Verify starter categories
    async with async_session() as session:
        res = await session.execute(select(Category))
        categories = res.scalars().all()
        assert len(categories) == len(DEFAULT_CATEGORIES)
        cat_names = [c.name for c in categories]
        for expected in DEFAULT_CATEGORIES:
            assert expected in cat_names

    # 4. Insert an Expense
    async with async_session() as session:
        food_cat_res = await session.execute(select(Category).where(Category.name == "Food"))
        food_cat = food_cat_res.scalar_one()

        expense = Expense(
            title="Groceries",
            amount=Decimal("1500.00"),
            date=date.today(),
            category_id=food_cat.id,
            user_id=1,
        )
        session.add(expense)
        await session.commit()
        await session.refresh(expense)

        assert expense.id is not None
        assert expense.amount == Decimal("1500.00")
        assert expense.category_id == food_cat.id

    await engine.dispose()
