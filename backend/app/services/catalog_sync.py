"""Shared logic for loading product/stock data into our `products` table
from an external source (Pisell export file, Pisell API, or anything else
later). Keeping this in one place means every import path agrees on the
same category mapping and upsert behaviour instead of drifting apart.
"""

from dataclasses import dataclass, field
from decimal import Decimal, InvalidOperation

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.product import Product, ProductVariant
from app.services.translate import translate_html, translate_text

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
class VariantInput:
    external_id: str
    name: str
    price: Decimal
    stock_quantity: int
    sort: int = 0
    is_active: bool = True


@dataclass
class ProductInput:
    external_id: str
    name: str
    price: Decimal
    stock_quantity: int
    category_names: list[str] = field(default_factory=list)
    vendor: str | None = None
    image_url: str | None = None
    description: str | None = None
    original_price: Decimal | None = None
    is_active: bool = True
    external_source: str = "pisell"
    variants: list[VariantInput] = field(default_factory=list)


def _capitalize_first(text: str | None) -> str | None:
    """MyMemory passes already-Latin brand names (zeze, honi, petshy...)
    through mostly unchanged. Harmless on its own, but ~70% of products
    have the brand name prefixed onto the Chinese name (e.g. "zeze 彩豆豆
    方形冰垫"), which carries the same lowercase start into the product's
    own translated name_en — looks casual next to the rest of the
    translated catalog, which (being real translations, not a pass-
    through) already comes back capitalized."""
    if not text:
        return text
    return text[0].upper() + text[1:]


def _resolve_translation(
    new_text: str | None,
    old_source_text: str | None,
    old_translation: str | None,
    translator,
) -> str | None:
    """Re-translates only when the source text changed, or the previous
    attempt never produced anything (e.g. it hit a rate limit last time) —
    keeps re-imports cheap on the free translation tier."""
    if not new_text:
        return None
    if new_text == old_source_text and old_translation:
        return old_translation
    return translator(new_text)


def _sync_variants(product: Product, variants: list[VariantInput], external_source: str) -> None:
    existing_by_external_id = {v.external_id: v for v in product.variants if v.external_id}
    seen_external_ids: set[str] = set()

    for v in variants:
        seen_external_ids.add(v.external_id)
        existing = existing_by_external_id.get(v.external_id)
        if existing:
            name_en = _capitalize_first(
                _resolve_translation(v.name, existing.name, existing.name_en, translate_text)
            )
            existing.name = v.name
            existing.name_en = name_en
            existing.price = v.price
            existing.stock_quantity = v.stock_quantity
            existing.sort = v.sort
            existing.is_active = v.is_active
        else:
            product.variants.append(
                ProductVariant(
                    external_source=external_source,
                    external_id=v.external_id,
                    name=v.name,
                    name_en=_capitalize_first(translate_text(v.name)),
                    price=v.price,
                    stock_quantity=v.stock_quantity,
                    sort=v.sort,
                    is_active=v.is_active,
                )
            )

    # Remove variants that disappeared from this product's latest data
    # (cascade="all, delete-orphan" on the relationship deletes the row).
    for external_id, existing in existing_by_external_id.items():
        if external_id not in seen_external_ids:
            product.variants.remove(existing)


def upsert_product(db: Session, item: ProductInput) -> bool:
    """Returns True if a new row was created, False if an existing one was updated."""
    old_price = (
        item.original_price
        if item.original_price and item.original_price > item.price
        else None
    )

    existing = db.scalar(
        select(Product).where(
            Product.external_source == item.external_source,
            Product.external_id == item.external_id,
        )
    )

    name_en = _capitalize_first(
        _resolve_translation(
            item.name,
            existing.name if existing else None,
            existing.name_en if existing else None,
            translate_text,
        )
    )
    description_en = _resolve_translation(
        item.description,
        existing.description if existing else None,
        existing.description_en if existing else None,
        translate_html,
    )
    vendor_en = _capitalize_first(
        _resolve_translation(
            item.vendor,
            existing.vendor if existing else None,
            existing.vendor_en if existing else None,
            translate_text,
        )
    )

    fields = dict(
        name=item.name,
        name_en=name_en,
        price=item.price,
        old_price=old_price,
        stock_quantity=item.stock_quantity,
        category=map_category(item.category_names),
        vendor=item.vendor,
        vendor_en=vendor_en,
        image_url=item.image_url,
        description=item.description,
        description_en=description_en,
        is_active=item.is_active,
    )

    if existing:
        for key, value in fields.items():
            setattr(existing, key, value)
        _sync_variants(existing, item.variants, item.external_source)
        return False

    product = Product(
        external_source=item.external_source,
        external_id=item.external_id,
        **fields,
    )
    _sync_variants(product, item.variants, item.external_source)
    db.add(product)
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
