"""One-off import: pull the product catalog directly from the Pisell admin
API. Kept as a fallback — the primary, ongoing way we sync stock is
scripts/import_from_excel.py, driven by manually re-exported spreadsheets
(Pisell has no self-serve API-key program, so a bearer token from an
interactive login session isn't something we want to depend on long-term).

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

import requests

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import SessionLocal  # noqa: E402
from app.services.catalog_sync import (  # noqa: E402
    ProductInput,
    VariantInput,
    deactivate_missing,
    to_decimal,
    upsert_product,
)

API_BASE = "https://pro.pisellapi.com/shop/product/product"
PAGE_SIZE = 100
EXTERNAL_SOURCE = "pisell"


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


def variant_label(raw_variant: dict) -> str:
    """The API returns each variant's name as {"1": "43g"} (keyed by option
    dimension) rather than a plain string — join whatever's there."""
    name_map = raw_variant.get("name") or raw_variant.get("title") or {}
    if isinstance(name_map, dict):
        parts = [str(v) for v in name_map.values() if v]
        if parts:
            return " · ".join(parts)
    return f"#{raw_variant.get('id')}"


def to_product_input(raw: dict) -> ProductInput:
    price = to_decimal(raw.get("base_price") or raw.get("price"))
    if price is None:
        variant_prices = [to_decimal(v.get("price")) for v in raw.get("variant") or []]
        variant_prices = [p for p in variant_prices if p]
        price = min(variant_prices) if variant_prices else None
    # Genuinely unpriced on Pisell's side — don't publish a $0 item.
    is_unpriced = price is None
    if is_unpriced:
        price = 0

    vendor_list = raw.get("vendor") or []
    category_list = raw.get("category") or []

    # Same unreliable-parent-aggregate issue as price: sum the variants'
    # own stock when there are any, rather than trusting sum_stock/
    # stock_quantity on the parent record.
    raw_variants = raw.get("variant") or []
    if raw_variants:
        stock = sum((v.get("stock_quantity") or 0) for v in raw_variants)
    else:
        stock = raw.get("sum_stock", raw.get("stock_quantity", 0)) or 0

    variants = [
        VariantInput(
            external_id=str(v["id"]),
            name=variant_label(v),
            price=to_decimal(v.get("price")) or price,
            stock_quantity=v.get("stock_quantity") or 0,
            sort=i,
        )
        for i, v in enumerate(raw_variants)
    ]

    return ProductInput(
        external_id=str(raw["id"]),
        external_source=EXTERNAL_SOURCE,
        name=raw["title"],
        price=price,
        original_price=to_decimal(raw.get("original_price")),
        stock_quantity=stock,
        category_names=[c.get("name") for c in category_list if c.get("name")],
        vendor=vendor_list[0]["name"] if vendor_list else None,
        image_url=raw.get("cover") or None,
        description=raw.get("description") or None,
        is_active=raw.get("status") == "published" and not is_unpriced,
        variants=variants,
    )


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
        items = [to_product_input(raw) for raw in raw_products]
        for item in items:
            if upsert_product(db, item):
                created += 1
            else:
                updated += 1
        deactivated = deactivate_missing(
            db, EXTERNAL_SOURCE, {i.external_id for i in items}
        )
        db.commit()
    finally:
        db.close()

    print(f"Done. Created {created}, updated {updated}, deactivated {deactivated}.")


if __name__ == "__main__":
    main()
