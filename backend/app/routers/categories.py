from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_active_user
from app.models.user import User
from app.schemas.category import CategoryCreate, CategoryResponse, CategoryUpdate
from app.schemas.response import APIResponse
from app.services.category_service import CategoryService

router = APIRouter(prefix="/categories", tags=["Categories"])


@router.get("", response_model=APIResponse[List[CategoryResponse]])
async def get_categories(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Fetch all categories for the authenticated user."""
    categories = await CategoryService.get_categories(db, user_id=current_user.id)
    return APIResponse(data=categories)


@router.post("", response_model=APIResponse[CategoryResponse], status_code=status.HTTP_201_CREATED)
async def create_category(
    data: CategoryCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new category for the authenticated user."""
    category = await CategoryService.create_category(db, data, user_id=current_user.id)
    return APIResponse(data=category, message="Category created successfully")


@router.put("/{category_id}", response_model=APIResponse[CategoryResponse])
async def update_category(
    category_id: int,
    data: CategoryUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Rename an existing category owned by the authenticated user."""
    category = await CategoryService.update_category(db, category_id, data, user_id=current_user.id)
    return APIResponse(data=category, message="Category updated successfully")


@router.delete("/{category_id}", response_model=APIResponse[dict])
async def delete_category(
    category_id: int,
    reassign_to: Optional[int] = Query(None, description="Optional target category ID to reassign expenses to"),
    cascade: bool = Query(False, description="Set to true to force delete category and linked expenses"),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a category with safe reassign or cascade guards for the authenticated user."""
    result = await CategoryService.delete_category(
        db, category_id, reassign_to, cascade, user_id=current_user.id
    )
    return APIResponse(data=result, message=result.get("message"))
