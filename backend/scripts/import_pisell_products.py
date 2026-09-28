"""One-off import: pull the real product catalog out of the Pisell admin API
and load it into our own `products` table.

This is NOT a live sync. Pisell doesn't expose a self-serve API-key /
developer program (as far as we've found) — the only access we have is a
bearer token tied to an interactive merchant login session, which expires
and isn't something that belongs hardcoded into the app. So this script is
meant to be run by hand, once (or occasionally, by hand), with a fresh token
supplied via environment variables at run time. Nothing here should ever be
committed with real credentials in it.

Usage:
    PISELL_TOKEN="<bearer token from a logged-in browser session>" \
    PISELL_MERCHANT_DOMAIN="okiepet.mypisell.com" \
    python scripts/import_pisell_products.py

How to get PISELL_TOKEN: log into https://accounts.pisell.com, open the
store, open browser devtools -> Network, reload the Products page, and copy
the `authorization` request header (without the "bearer " prefix) from any
call to pro.pisellapi.com.
"""

import os
import sys
from decimal import Decimal, InvalidOperation

import requests
from sqlalchemy import select

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import SessionLocal  # noqa: E402
from app.models.product import Product  # noqa: E402

API_BASE = "https://pro.pisellapi.com/shop/product/product"
PAGE_SIZE = 100

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


def map_category(pisell_categories: list[dict]) -> str:
    for cat in pisell_categories:
        mapped = CATEGORY_MAP.get(cat.get("name", ""))
        if mapped:
            return mapped
    return DEFAULT_CATEGORY


def to_decimal(value) -> Decimal | None:
    try:
        d = Decimal(str(value))
        return d if d > 0 else None
    except (InvalidOperation, TypeError):
        return None


def fetch_all_products(token: str, merchant_domain: str) -> list[dict]:
    headers = {
        "authorization": f"bearer {token}",
        "merchant-domain": merchant_domain,
        "locale": "en",
    }
    products: list[dict] = []
    skip = 1
    while True:
        resp = requests.get(
            API_BASE,
            params={"skip": skip, "num": PAGE_SIZE},
            headers=headers,
            timeout=30,
        )
        resp.raise_for_status()
        payload = resp.json()["data"]
        products.extend(payload["list"])
        fetched = skip * PAGE_SIZE
        if fetched >= payload["count"] or not payload["list"]:
            break
        skip += 1
    return products


def cheapest_variant_price(raw: dict) -> Decimal | None:
    prices = [to_decimal(v.get("price")) for v in raw.get("variant") or []]
    prices = [p for p in prices if p]
    return min(prices) if prices else None


def upsert_product(db, raw: dict) -> bool:
    """Returns True if a new row was created, False if an existing one was updated."""
    external_id = str(raw["id"])

    # Multi-variant products often leave the parent's base_price/price at 0
    # and only set real prices on each variant — fall back to the cheapest
    # variant so we don't import a $0 product.
    price = to_decimal(raw.get("base_price") or raw.get("price"))
    if price is None:
        price = cheapest_variant_price(raw) or Decimal("0.00")

    original_price = to_decimal(raw.get("original_price"))
    old_price = original_price if original_price and original_price > price else None
    stock = raw.get("sum_stock", raw.get("stock_quantity", 0)) or 0
    vendor_list = raw.get("vendor") or []
    vendor = vendor_list[0]["name"] if vendor_list else None

    existing = db.scalar(
        select(Product).where(
            Product.external_source == "pisell", Product.external_id == external_id
        )
    )

    fields = dict(
        name=raw["title"],
        price=price,
        old_price=old_price,
        stock_quantity=stock,
        category=map_category(raw.get("category") or []),
        vendor=vendor,
        image_url=raw.get("cover") or None,
        is_active=raw.get("status") == "published",
    )

    if existing:
        for key, value in fields.items():
            setattr(existing, key, value)
        return False

    db.add(Product(external_source="pisell", external_id=external_id, **fields))
    return True


def main():
    token = os.environ.get("PISELL_TOKEN")
    merchant_domain = os.environ.get("PISELL_MERCHANT_DOMAIN", "okiepet.mypisell.com")
    if not token:
        print("Set PISELL_TOKEN (see the docstring at the top of this file).", file=sys.stderr)
        sys.exit(1)

    print(f"Fetching products from Pisell ({merchant_domain})...")
    raw_products = fetch_all_products(token, merchant_domain)
    print(f"Fetched {len(raw_products)} products.")

    created = updated = 0
    db = SessionLocal()
    try:
        for raw in raw_products:
            if upsert_product(db, raw):
                created += 1
            else:
                updated += 1
        db.commit()
    finally:
        db.close()

    print(f"Done. Created {created}, updated {updated}.")


if __name__ == "__main__":
    main()
