from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.category import Category

DEFAULT_CATEGORIES = [
    "Food",
    "Transport",
    "Rent",
    "Utilities",
    "Entertainment",
    "Other",
]


async def seed_user_starter_categories(db: AsyncSession, user_id: int) -> None:
    """Seed approved default starter categories for a specific user.
    
    Rule 8 & 19 of Agents.md: Never seed demo expenses or demo budgets.
    Only approved default starter categories may be seeded per user.
    """
    for category_name in DEFAULT_CATEGORIES:
        stmt = select(Category).where(
            Category.name == category_name,
            Category.user_id == user_id,
        )
        result = await db.execute(stmt)
        existing = result.scalar_one_or_none()

        if not existing:
            new_cat = Category(
                name=category_name,
                is_default=True,
                user_id=user_id,
            )
            db.add(new_cat)

    await db.commit()


async def seed_starter_categories(db: AsyncSession) -> None:
    """Legacy helper for seeding user 1 if present."""
    await seed_user_starter_categories(db, user_id=1)
