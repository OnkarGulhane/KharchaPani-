from typing import List, Optional
from sqlalchemy import select, func, update, delete
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from app.models import Category, Expense, Budget
from app.schemas.category import CategoryCreate, CategoryUpdate, CategoryResponse, CategoryDeleteConflict


class CategoryService:
    @staticmethod
    async def get_categories(db: AsyncSession, user_id: int = 1) -> List[CategoryResponse]:
        """Fetch all categories with their associated expense count."""
        expense_count_subq = (
            select(func.count(Expense.id))
            .where(Expense.category_id == Category.id)
            .scalar_subquery()
            .label("expense_count")
        )
        stmt = (
            select(Category, expense_count_subq)
            .where(Category.user_id == user_id)
            .order_by(Category.is_default.desc(), Category.name.asc())
        )
        result = await db.execute(stmt)
        rows = result.all()

        return [
            CategoryResponse(
                id=cat.id,
                name=cat.name,
                is_default=cat.is_default,
                expense_count=count or 0,
                created_at=cat.created_at,
                updated_at=cat.updated_at,
            )
            for cat, count in rows
        ]

    @staticmethod
    async def create_category(db: AsyncSession, data: CategoryCreate, user_id: int = 1) -> CategoryResponse:
        """Create a new user category."""
        existing_stmt = select(Category).where(Category.name.ilike(data.name.strip()), Category.user_id == user_id)
        existing_res = await db.execute(existing_stmt)
        if existing_res.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Category '{data.name}' already exists.",
            )

        category = Category(
            name=data.name.strip(),
            is_default=False,
            user_id=user_id,
        )
        db.add(category)
        await db.commit()
        await db.refresh(category)

        return CategoryResponse(
            id=category.id,
            name=category.name,
            is_default=category.is_default,
            expense_count=0,
            created_at=category.created_at,
            updated_at=category.updated_at,
        )

    @staticmethod
    async def update_category(
        db: AsyncSession, category_id: int, data: CategoryUpdate, user_id: int = 1
    ) -> CategoryResponse:
        """Rename an existing category."""
        category = await db.get(Category, category_id)
        if not category or category.user_id != user_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")

        new_name = data.name.strip()
        if category.name.lower() != new_name.lower():
            dup_stmt = select(Category).where(Category.name.ilike(new_name), Category.user_id == user_id)
            dup_res = await db.execute(dup_stmt)
            if dup_res.scalar_one_or_none():
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Category '{new_name}' already exists.",
                )

        category.name = new_name
        await db.commit()
        await db.refresh(category)

        count_stmt = select(func.count(Expense.id)).where(Expense.category_id == category.id)
        count_res = await db.execute(count_stmt)
        expense_count = count_res.scalar_one()

        return CategoryResponse(
            id=category.id,
            name=category.name,
            is_default=category.is_default,
            expense_count=expense_count,
            created_at=category.created_at,
            updated_at=category.updated_at,
        )

    @staticmethod
    async def delete_category(
        db: AsyncSession,
        category_id: int,
        reassign_to: Optional[int] = None,
        cascade: bool = False,
        user_id: int = 1,
    ) -> dict:
        """Safe Category Deletion Flow (SRS v2.0 Section 7.5 & Agents.md Rule 16)."""
        category = await db.get(Category, category_id)
        if not category or category.user_id != user_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")

        count_stmt = select(func.count(Expense.id)).where(Expense.category_id == category_id)
        count_res = await db.execute(count_stmt)
        linked_count = count_res.scalar_one()

        if linked_count == 0:
            await db.delete(category)
            await db.commit()
            return {"message": "Category deleted successfully"}

        if not reassign_to and not cascade:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail={
                    "linked_expense_count": linked_count,
                    "message": f"Category is linked to {linked_count} expenses. Provide reassign_to or cascade=true.",
                },
            )

        if reassign_to:
            target_category = await db.get(Category, reassign_to)
            if not target_category or target_category.user_id != user_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Target category for reassignment not found",
                )
            if reassign_to == category_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Cannot reassign expenses to the category being deleted",
                )

            reassign_stmt = update(Expense).where(Expense.category_id == category_id).values(category_id=reassign_to)
            await db.execute(reassign_stmt)
            await db.delete(category)
            await db.commit()
            return {"message": f"Reassigned {linked_count} expenses and deleted category successfully"}

        if cascade:
            del_exp_stmt = delete(Expense).where(Expense.category_id == category_id)
            await db.execute(del_exp_stmt)
            await db.delete(category)
            await db.commit()
            return {"message": f"Deleted category and {linked_count} linked expenses successfully"}

        return {"message": "Category deleted"}
