from decimal import Decimal
from typing import Optional
from pydantic import BaseModel, Field, field_validator, ConfigDict


class BudgetCreate(BaseModel):
    period: str = Field("monthly", description="Budget period (e.g. monthly)")
    amount_limit: Decimal = Field(..., gt=0, description="Budget amount limit")
    category_id: Optional[int] = Field(None, description="Category ID (null for overall budget)")

    @field_validator("amount_limit")
    @classmethod
    def validate_positive_limit(cls, v: Decimal) -> Decimal:
        if v <= 0:
            raise ValueError("Budget limit must be a positive number")
        return v


class BudgetUpdate(BaseModel):
    period: Optional[str] = None
    amount_limit: Optional[Decimal] = Field(None, gt=0)
    category_id: Optional[int] = None

    @field_validator("amount_limit")
    @classmethod
    def validate_positive_limit(cls, v: Optional[Decimal]) -> Optional[Decimal]:
        if v is not None and v <= 0:
            raise ValueError("Budget limit must be a positive number")
        return v


class BudgetResponse(BaseModel):
    id: int
    period: str
    amount_limit: Decimal
    category_id: Optional[int] = None
    category_name: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class BudgetStatusResponse(BaseModel):
    total_budget: Decimal
    total_spent: Decimal
    remaining_balance: Decimal
    percentage_used: float
    status: str  # "on_track", "near_limit" (>=80%), "over_budget" (>=100%)
