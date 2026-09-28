"""Shared logic for loading product/stock data into our `products` table
from an external source (Pisell export file, Pisell API, or anything else
later). Keeping this in one place means every import path agrees on the
same category mapping and upsert behaviour instead of drifting apart.
"""

from dataclasses import dataclass, field
from decimal import Decimal, InvalidOperation

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.product import Product

# Pisell's free-text Chinese category names -> our storefront's CategoryId.
# "deals" isn't a real Pisell category; discounted items are detected from
# original_price/price instead, matching how the frontend already treats it.
CATEGORY_MAP = {
    "猫抓板": "supplies",
    "猫抓柱": "supplies",
    "宠物冰垫": "supplies",
    "宠物玩具": "supplies",
    "猫玩具": "supplies",
    "狗玩具": "supplies",
    "清洁用品": "supplies",
    "保健品": "supplies",
    "猫砂": "supplies",
    "主粮伴侣": "staple",
    "狗粮": "staple",
    "主粮": "staple",
    "宠物食品": "staple",
    "狗零食": "snacks",
    "小包·果蔬干": "snacks",
    "小包·纯肉干": "snacks",
    "大包·果蔬干": "snacks",
    "零食": "snacks",
    "狗罐头": "canned",
    "狗罐": "canned",
    "汤罐": "canned",
    "汤包": "canned",
    "餐包": "canned",
    "餐盒": "canned",
    "罐头": "canned",
    "冻干": "freeze-dried",
    "冻干零食": "freeze-dried",
}
DEFAULT_CATEGORY = "supplies"


def map_category(names: list[str]) -> str:
    for name in names:
        mapped = CATEGORY_MAP.get(name)
        if mapped:
            return mapped
    return DEFAULT_CATEGORY


def to_decimal(value) -> Decimal | None:
    """Returns None for empty/zero/unparseable values, never a Decimal("0")."""
    try:
        d = Decimal(str(value))
        return d if d > 0 else None
    except (InvalidOperation, TypeError):
        return None


@dataclass
class ProductInput:
    external_id: str
    name: str
    price: Decimal
    stock_quantity: int
    category_names: list[str] = field(default_factory=list)
    vendor: str | None = None
    image_url: str | None = None
    original_price: Decimal | None = None
    is_active: bool = True
    external_source: str = "pisell"


def upsert_product(db: Session, item: ProductInput) -> bool:
    """Returns True if a new row was created, False if an existing one was updated."""
    old_price = (
        item.original_price
        if item.original_price and item.original_price > item.price
        else None
    )

    fields = dict(
        name=item.name,
        price=item.price,
        old_price=old_price,
        stock_quantity=item.stock_quantity,
        category=map_category(item.category_names),
        vendor=item.vendor,
        image_url=item.image_url,
        is_active=item.is_active,
    )

    existing = db.scalar(
        select(Product).where(
            Product.external_source == item.external_source,
            Product.external_id == item.external_id,
        )
    )
    if existing:
        for key, value in fields.items():
            setattr(existing, key, value)
        return False

    db.add(
        Product(
            external_source=item.external_source,
            external_id=item.external_id,
            **fields,
        )
    )
    return True


def deactivate_missing(db: Session, external_source: str, seen_external_ids: set[str]) -> int:
    """Marks products from this source as inactive if they weren't in the
    latest import batch (e.g. unpublished/deleted on Pisell's side).
    Returns the number of rows deactivated."""
    stmt = select(Product).where(
        Product.external_source == external_source,
        Product.is_active.is_(True),
        Product.external_id.notin_(seen_external_ids) if seen_external_ids else True,
    )
    missing = db.scalars(stmt).all()
    for product in missing:
        product.is_active = False
    return len(missing)
