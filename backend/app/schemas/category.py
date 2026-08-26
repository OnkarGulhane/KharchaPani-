from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class CategoryCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, description="Category name")


class CategoryUpdate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, description="Updated category name")


class CategoryResponse(BaseModel):
    id: int
    name: str
    is_default: bool
    expense_count: int = 0
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CategoryDeleteConflict(BaseModel):
    linked_expense_count: int
    message: str = "Category is linked to existing expenses. Reassignment or confirmation required."
