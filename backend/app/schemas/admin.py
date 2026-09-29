import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict

from app.schemas.product import VariantOut


class AdminProductOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    category: str
    vendor: str | None
    image_url: str | None
    price: Decimal
    old_price: Decimal | None
    stock_quantity: int
    is_active: bool
    external_source: str
    updated_at: datetime
    variants: list[VariantOut] = []


class AdminProductListOut(BaseModel):
    items: list[AdminProductOut]
    total: int
    skip: int
    limit: int


class AdminProductUpdate(BaseModel):
    name: str | None = None
    category: str | None = None
    price: Decimal | None = None
    old_price: Decimal | None = None
    stock_quantity: int | None = None
    is_active: bool | None = None


class AdminVariantUpdate(BaseModel):
    price: Decimal | None = None
    stock_quantity: int | None = None
    is_active: bool | None = None


class AdminOrderItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    product_name: str
    variant_name: str | None
    image_url: str | None
    price: Decimal
    quantity: int


class AdminOrderOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    order_number: str
    status: str
    subtotal: Decimal
    created_at: datetime
    customer_email: str
    customer_name: str
    items: list[AdminOrderItemOut]


class AdminImportResult(BaseModel):
    created: int
    updated: int
    deactivated: int
    total_rows: int
