"""Receives Stripe's payment confirmation and turns it into a real Order.

Deliberately separate from routers/orders.py: this endpoint has no JWT
auth (Stripe can't present one) and needs the raw request body for
signature verification, so it can't share the normal `Depends(get_db)` /
Pydantic-body shape the rest of the API uses.
"""

import json
import uuid

import stripe
from fastapi import APIRouter, HTTPException, Request

from app.core.config import settings
from app.core.database import SessionLocal
from app.models.order import Order, OrderItem
from app.models.product import Product, ProductVariant

router = APIRouter(prefix="/stripe", tags=["stripe"])


@router.post("/webhook")
async def stripe_webhook(request: Request):
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature", "")

    try:
        event = stripe.Webhook.construct_event(payload, sig_header, settings.stripe_webhook_secret)
    except (ValueError, stripe.SignatureVerificationError) as e:
        raise HTTPException(status_code=400, detail=f"Invalid webhook payload: {e}")

    if event["type"] == "checkout.session.completed":
        db = SessionLocal()
        try:
            _fulfill_checkout_session(db, event["data"]["object"])
        finally:
            db.close()

    return {"received": True}


def _fulfill_checkout_session(db, session: dict) -> None:
    session_id = session["id"]

    # Idempotency: Stripe retries webhook delivery on timeout/non-2xx, and
    # a retried delivery must not create a second order for one payment.
    existing = (
        db.query(Order).filter(Order.stripe_checkout_session_id == session_id).first()
    )
    if existing is not None:
        return

    metadata = session.get("metadata") or {}
    user_id = metadata.get("user_id")
    cart = json.loads(metadata.get("cart") or "[]")
    if not user_id or not cart:
        return

    order_items: list[OrderItem] = []
    subtotal = 0
    for line in cart:
        product = db.get(Product, uuid.UUID(line["product_id"]))
        if product is None:
            continue
        variant = (
            db.get(ProductVariant, uuid.UUID(line["variant_id"]))
            if line.get("variant_id")
            else None
        )
        quantity = line["quantity"]
        price = variant.price if variant else product.price
        subtotal += price * quantity

        order_items.append(
            OrderItem(
                product_id=product.id,
                variant_id=variant.id if variant else None,
                product_name=product.name,
                variant_name=variant.name if variant else None,
                image_url=product.image_url,
                price=price,
                quantity=quantity,
            )
        )
        # Payment already succeeded by this point — don't block fulfillment
        # on a stock race (stock changed since checkout started), just
        # don't let the count go negative.
        stock_row = variant or product
        stock_row.stock_quantity = max(0, stock_row.stock_quantity - quantity)

    if not order_items:
        return

    order = Order(
        user_id=uuid.UUID(user_id),
        subtotal=subtotal,
        status="paid",
        stripe_checkout_session_id=session_id,
        items=order_items,
    )
    db.add(order)
    db.commit()
