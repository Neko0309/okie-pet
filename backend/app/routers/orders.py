import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.order import Order, OrderItem
from app.models.product import Product, ProductVariant
from app.models.user import User
from app.schemas.order import OrderCreate, OrderOut

router = APIRouter(prefix="/orders", tags=["orders"])


@router.post("", response_model=OrderOut, status_code=201)
def create_order(
    payload: OrderCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    order_items: list[OrderItem] = []
    subtotal = 0

    for line in payload.items:
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
        subtotal += price * line.quantity

        order_items.append(
            OrderItem(
                product_id=product.id,
                variant_id=variant.id if variant else None,
                product_name=product.name,
                variant_name=variant.name if variant else None,
                image_url=product.image_url,
                price=price,
                quantity=line.quantity,
            )
        )
        stock_row.stock_quantity -= line.quantity

    order = Order(user_id=user.id, subtotal=subtotal, items=order_items)
    db.add(order)
    db.commit()
    db.refresh(order)
    return order


@router.get("", response_model=list[OrderOut])
def list_orders(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    stmt = (
        select(Order)
        .where(Order.user_id == user.id)
        .options(selectinload(Order.items))
        .order_by(Order.created_at.desc())
    )
    return db.scalars(stmt).all()


@router.get("/{order_id}", response_model=OrderOut)
def get_order(
    order_id: uuid.UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    stmt = (
        select(Order)
        .where(Order.id == order_id, Order.user_id == user.id)
        .options(selectinload(Order.items))
    )
    order = db.scalar(stmt)
    if order is None:
        raise HTTPException(status_code=404, detail="Order not found")
    return order
