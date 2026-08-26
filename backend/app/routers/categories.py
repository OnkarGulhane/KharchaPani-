from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.category import CategoryCreate, CategoryUpdate, CategoryResponse
from app.schemas.response import APIResponse
from app.services.category_service import CategoryService

router = APIRouter(prefix="/categories", tags=["Categories"])


@router.get("", response_model=APIResponse[List[CategoryResponse]])
async def get_categories(db: AsyncSession = Depends(get_db)):
    """Fetch all categories with expense counts."""
    categories = await CategoryService.get_categories(db)
    return APIResponse(data=categories)


@router.post("", response_model=APIResponse[CategoryResponse], status_code=status.HTTP_201_CREATED)
async def create_category(data: CategoryCreate, db: AsyncSession = Depends(get_db)):
    """Create a new category."""
    category = await CategoryService.create_category(db, data)
    return APIResponse(data=category, message="Category created successfully")


@router.put("/{category_id}", response_model=APIResponse[CategoryResponse])
async def update_category(category_id: int, data: CategoryUpdate, db: AsyncSession = Depends(get_db)):
    """Rename an existing category."""
    category = await CategoryService.update_category(db, category_id, data)
    return APIResponse(data=category, message="Category updated successfully")


@router.delete("/{category_id}", response_model=APIResponse[dict])
async def delete_category(
    category_id: int,
    reassign_to: Optional[int] = Query(None, description="Optional target category ID to reassign expenses to"),
    cascade: bool = Query(False, description="Set to true to force delete category and linked expenses"),
    db: AsyncSession = Depends(get_db),
):
    """Delete a category with safe reassign or cascade guards (SRS v2.0 Section 7.5)."""
    result = await CategoryService.delete_category(db, category_id, reassign_to, cascade)
    return APIResponse(data=result, message=result.get("message"))
