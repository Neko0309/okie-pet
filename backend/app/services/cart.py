"""Shared cart-line validation — checks each requested product/variant is
active and in stock. Used by both the direct /orders endpoint and the
Stripe checkout-session flow so the two definitions of "a valid order"
can't drift apart.
"""

from dataclasses import dataclass
from decimal import Decimal

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.product import Product, ProductVariant
from app.schemas.order import OrderItemCreate


@dataclass
class ValidatedLine:
    product: Product
    variant: ProductVariant | None
    price: Decimal
    quantity: int


def validate_cart(db: Session, items: list[OrderItemCreate]) -> list[ValidatedLine]:
    lines: list[ValidatedLine] = []
    for line in items:
        product = db.get(Product, line.product_id)
        if product is None or not product.is_active:
            raise HTTPException(
                status_code=400, detail=f"Product {line.product_id} is not available"
            )

        variant = None
        if line.variant_id:
            variant = db.get(ProductVariant, line.variant_id)
            if variant is None or variant.product_id != product.id or not variant.is_active:
                raise HTTPException(
                    status_code=400,
                    detail=f"Variant {line.variant_id} is not available for {product.name}",
                )

        stock_row = variant or product
        if stock_row.stock_quantity < line.quantity:
            raise HTTPException(
                status_code=400,
                detail=(
                    f"Only {stock_row.stock_quantity} left of "
                    f"{product.name}{f' ({variant.name})' if variant else ''}"
                ),
            )

        price = variant.price if variant else product.price
        lines.append(
            ValidatedLine(product=product, variant=variant, price=price, quantity=line.quantity)
        )
    return lines
