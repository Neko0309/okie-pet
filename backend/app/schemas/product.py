import uuid
from decimal import Decimal

from pydantic import BaseModel, ConfigDict


class ProductOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    price: Decimal
    old_price: Decimal | None
    stock_quantity: int
    category: str
    vendor: str | None
    image_url: str | None
    is_active: bool


class ProductListOut(BaseModel):
    items: list[ProductOut]
    total: int
    skip: int
    limit: int
