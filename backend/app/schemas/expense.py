from datetime import date as date_type
from decimal import Decimal
from typing import Optional
from pydantic import BaseModel, Field, field_validator, ConfigDict


class ExpenseBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=150, description="Expense title")
    amount: Decimal = Field(..., description="Expense amount (must be positive)")
    date: date_type = Field(..., description="Expense date (cannot be in future)")
    notes: Optional[str] = Field(None, max_length=500)
    payment_mode: Optional[str] = Field(None, max_length=50)
    category_id: int = Field(..., description="Target category ID")

    @field_validator("amount")
    @classmethod
    def validate_positive_amount(cls, v: Decimal) -> Decimal:
        if v <= 0:
            raise ValueError("Amount must be a positive number")
        return v

    @field_validator("date")
    @classmethod
    def validate_no_future_date(cls, v: date_type) -> date_type:
        if v > date_type.today():
            raise ValueError("Expense date cannot be in the future")
        return v


class ExpenseCreate(ExpenseBase):
    pass


class ExpenseUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=150)
    amount: Optional[Decimal] = None
    date: Optional[date_type] = None
    notes: Optional[str] = None
    payment_mode: Optional[str] = None
    category_id: Optional[int] = None

    @field_validator("amount")
    @classmethod
    def validate_positive_amount(cls, v: Optional[Decimal]) -> Optional[Decimal]:
        if v is not None and v <= 0:
            raise ValueError("Amount must be a positive number")
        return v

    @field_validator("date")
    @classmethod
    def validate_no_future_date(cls, v: Optional[date_type]) -> Optional[date_type]:
        if v is not None and v > date_type.today():
            raise ValueError("Expense date cannot be in the future")
        return v


class ExpenseResponse(BaseModel):
    id: int
    title: str
    amount: Decimal
    date: date_type
    notes: Optional[str] = None
    payment_mode: Optional[str] = None
    category_id: int
    category_name: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
