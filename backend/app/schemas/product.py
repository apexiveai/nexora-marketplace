
from uuid import UUID
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class ProductCreate(BaseModel):
    seller_id: UUID

    name: str = Field(min_length=2, max_length=255)
    slug: str = Field(min_length=2, max_length=280)
    sku: str = Field(min_length=2, max_length=100)
    description: str | None = None
    category: str
    price: Decimal = Field(gt=0)
    currency: str = Field(default="USD", pattern=r"^[A-Z]{3}$")
    stock_quantity: int = Field(default=0, ge=0)


class ProductResponse(BaseModel):
    id: UUID
    seller_id: UUID
    name: str
    slug: str
    sku: str
    description: str | None
    category: str
    price: Decimal
    currency: str
    stock_quantity: int
    is_active: bool

    model_config = ConfigDict(from_attributes=True)
