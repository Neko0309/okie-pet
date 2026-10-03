import json
import uuid

import stripe
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.core.config import settings
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.order import Order, OrderItem
from app.models.user import User
from app.schemas.order import CheckoutSessionOut, OrderCreate, OrderOut
from app.services.cart import validate_cart

router = APIRouter(prefix="/orders", tags=["orders"])


@router.post("", response_model=OrderOut, status_code=201)
def create_order(
    payload: OrderCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    lines = validate_cart(db, payload.items)

    order_items: list[OrderItem] = []
    subtotal = 0
    for line in lines:
        subtotal += line.price * line.quantity
        order_items.append(
            OrderItem(
                product_id=line.product.id,
                variant_id=line.variant.id if line.variant else None,
                product_name=line.product.name,
                variant_name=line.variant.name if line.variant else None,
                image_url=line.product.image_url,
                price=line.price,
                quantity=line.quantity,
            )
        )
        stock_row = line.variant or line.product
        stock_row.stock_quantity -= line.quantity

    order = Order(user_id=user.id, subtotal=subtotal, items=order_items)
    db.add(order)
    db.commit()
    db.refresh(order)
    return order


@router.post("/checkout-session", response_model=CheckoutSessionOut)
def create_checkout_session(
    payload: OrderCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    if not settings.stripe_secret_key:
        raise HTTPException(status_code=503, detail="Payments aren't configured yet")

    # Validate now (clear error if something's unavailable) but don't touch
    # stock or create the Order yet — that only happens once Stripe
    # confirms the payment actually went through (see stripe_webhook.py).
    # Abandoned/failed checkouts this way never leave a phantom order or a
    # stock reservation behind.
    lines = validate_cart(db, payload.items)

    stripe.api_key = settings.stripe_secret_key
    cart_payload = [
        {
            "product_id": str(line.product.id),
            "variant_id": str(line.variant.id) if line.variant else None,
            "quantity": line.quantity,
        }
        for line in lines
    ]

    session = stripe.checkout.Session.create(
        mode="payment",
        payment_method_types=["card"],
        line_items=[
            {
                "price_data": {
                    "currency": "aud",
                    "product_data": {
                        "name": line.product.name
                        + (f" ({line.variant.name})" if line.variant else ""),
                        **(
                            {"images": [line.product.image_url]}
                            if line.product.image_url
                            else {}
                        ),
                    },
                    "unit_amount": int(line.price * 100),
                },
                "quantity": line.quantity,
            }
            for line in lines
        ],
        success_url=f"{settings.frontend_url}/orders?checkout=success",
        cancel_url=f"{settings.frontend_url}/cart?checkout=cancelled",
        client_reference_id=str(user.id),
        metadata={"user_id": str(user.id), "cart": json.dumps(cart_payload)},
    )
    return CheckoutSessionOut(url=session.url)


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
