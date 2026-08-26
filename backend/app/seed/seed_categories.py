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


async def seed_starter_categories(db: AsyncSession) -> None:
    """Seeds only the default starter categories if they do not exist.
    
    Rule 8 & 19 of Agents.md: Never seed demo expenses or demo budgets.
    Only approved default starter categories may be seeded.
    """
    for category_name in DEFAULT_CATEGORIES:
        stmt = select(Category).where(Category.name == category_name)
        result = await db.execute(stmt)
        existing = result.scalar_one_or_none()
        
        if not existing:
            new_cat = Category(
                name=category_name,
                is_default=True,
                user_id=1,
            )
            db.add(new_cat)
            
    await db.commit()
