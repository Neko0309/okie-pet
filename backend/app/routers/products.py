import uuid
from decimal import Decimal
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import case, func, select
from sqlalchemy.orm import Session, selectinload

from app.core.database import get_db
from app.models.product import Product
from app.schemas.product import ProductListOut, ProductOut

router = APIRouter(prefix="/products", tags=["products"])

SortMode = Literal["recommended", "price-asc", "price-desc"]


@router.get("", response_model=ProductListOut)
def list_products(
    category: str | None = Query(default=None),
    vendor: str | None = Query(default=None),
    min_price: Decimal | None = Query(default=None, ge=0),
    max_price: Decimal | None = Query(default=None, ge=0),
    sort: SortMode = Query(default="recommended"),
    skip: int = Query(default=0, ge=0),
    # No pagination UI on the frontend yet — it fetches once and renders
    # the whole list, so the cap just needs to comfortably clear the
    # catalog size (155 active products as of 2026-10-05) rather than
    # match a page size.
    limit: int = Query(default=24, ge=1, le=300),
    db: Session = Depends(get_db),
):
    stmt = select(Product).where(Product.is_active.is_(True)).options(
        selectinload(Product.variants)
    )

    if category == "deals":
        stmt = stmt.where(Product.old_price.is_not(None))
    elif category:
        stmt = stmt.where(Product.category == category)

    if vendor:
        stmt = stmt.where(Product.vendor.ilike(f"%{vendor}%"))
    if min_price is not None:
        stmt = stmt.where(Product.price >= min_price)
    if max_price is not None:
        stmt = stmt.where(Product.price <= max_price)

    # Sold-out items sort after in-stock ones regardless of sort mode —
    # applies within whatever `category` filter is active, not instead of
    # it, so "all sold out" categories still show their items.
    sold_out_last = case((Product.stock_quantity <= 0, 1), else_=0)

    if sort == "price-asc":
        stmt = stmt.order_by(sold_out_last, Product.price.asc())
    elif sort == "price-desc":
        stmt = stmt.order_by(sold_out_last, Product.price.desc())
    else:
        stmt = stmt.order_by(sold_out_last, Product.created_at.desc())

    total = db.scalar(select(func.count()).select_from(stmt.subquery()))
    items = db.scalars(stmt.offset(skip).limit(limit)).all()

    return ProductListOut(items=items, total=total or 0, skip=skip, limit=limit)


@router.get("/vendors", response_model=list[str])
def list_vendors(db: Session = Depends(get_db)):
    stmt = (
        select(Product.vendor)
        .where(Product.is_active.is_(True), Product.vendor.is_not(None), Product.vendor != "")
        .distinct()
        .order_by(Product.vendor)
    )
    return list(db.scalars(stmt).all())


@router.get("/{product_id}", response_model=ProductOut)
def get_product(product_id: uuid.UUID, db: Session = Depends(get_db)):
    stmt = (
        select(Product)
        .where(Product.id == product_id)
        .options(selectinload(Product.variants))
    )
    product = db.scalar(stmt)
    if product is None or not product.is_active:
        raise HTTPException(status_code=404, detail="Product not found")
    return product
