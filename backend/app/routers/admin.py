import uuid

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.core.database import get_db
from app.core.deps import get_current_admin
from app.models.order import Order
from app.models.product import Product, ProductVariant
from app.schemas.admin import (
    AdminOrderOut,
    AdminProductListOut,
    AdminProductOut,
    AdminProductUpdate,
    AdminVariantUpdate,
)

router = APIRouter(prefix="/admin", tags=["admin"], dependencies=[Depends(get_current_admin)])


@router.get("/products", response_model=AdminProductListOut)
def list_products(
    search: str | None = Query(default=None),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=50, ge=1, le=200),
    db: Session = Depends(get_db),
):
    # Admin sees everything, including inactive/unpriced rows — that's the
    # whole point (spot-fixing what the Pisell import got wrong or what's
    # gone stale since).
    stmt = select(Product).options(selectinload(Product.variants))
    if search:
        stmt = stmt.where(Product.name.ilike(f"%{search}%"))
    stmt = stmt.order_by(Product.updated_at.desc())

    # Small catalog (~150 rows) — simplest correct thing is to fetch the
    # filtered set once and paginate in Python rather than a second COUNT
    # query with a duplicated WHERE clause.
    all_matching = db.scalars(stmt).all()
    total = len(all_matching)
    items = all_matching[skip : skip + limit]

    return AdminProductListOut(items=items, total=total, skip=skip, limit=limit)


@router.patch("/products/{product_id}", response_model=AdminProductOut)
def update_product(
    product_id: uuid.UUID,
    payload: AdminProductUpdate,
    db: Session = Depends(get_db),
):
    product = db.get(Product, product_id)
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(product, field, value)

    db.commit()
    db.refresh(product)
    return product


@router.patch("/products/{product_id}/variants/{variant_id}", response_model=AdminProductOut)
def update_variant(
    product_id: uuid.UUID,
    variant_id: uuid.UUID,
    payload: AdminVariantUpdate,
    db: Session = Depends(get_db),
):
    variant = db.get(ProductVariant, variant_id)
    if variant is None or variant.product_id != product_id:
        raise HTTPException(status_code=404, detail="Variant not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(variant, field, value)

    db.commit()
    product = db.get(Product, product_id)
    db.refresh(product)
    return product


@router.get("/orders", response_model=list[AdminOrderOut])
def list_orders(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=50, ge=1, le=200),
    db: Session = Depends(get_db),
):
    stmt = (
        select(Order)
        .options(selectinload(Order.items), selectinload(Order.user))
        .order_by(Order.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    orders = db.scalars(stmt).all()
    return [
        AdminOrderOut(
            id=o.id,
            order_number=o.order_number,
            status=o.status,
            subtotal=o.subtotal,
            created_at=o.created_at,
            customer_email=o.user.email,
            customer_name=o.user.full_name,
            items=o.items,
        )
        for o in orders
    ]
