"""Import products from a Pisell "All records" stock export (.xlsx).

This is the ongoing way we keep our catalog in sync: Pisell doesn't offer a
self-serve API-key program, so instead of automated polling, the export is
re-run by hand whenever stock changes and dropped in here.

Usage:
    python scripts/import_from_excel.py "/path/to/All records-....xlsx"

Drop new export files in backend/imports/ (gitignored — this is real,
constantly-changing inventory data, not something to version control).

Expected columns (as exported by Pisell): product_id, variant_id, title,
image, vendor, category, status, stock_quantity, price, original_price.
Each product has one "parent" row (variant_id is 0/blank) carrying the
title/image/vendor/category; a multi-variant product (87% of this catalog)
also has one row per variant below it, e.g. a size or flavor, each with its
own price/stock. Every variant row is imported into product_variants, so
customers pick a specific option before adding to cart. The parent Product
row keeps an aggregate price (its own, or the cheapest variant's when the
parent's own price is 0 — about 70% of variant products only price the
variants) and aggregate stock (summed across variants), used for card/list
display before a variant is chosen.

Products from a previous import that are no longer present in this file
are marked inactive rather than deleted, so order history stays intact.
"""

import sys
from collections import defaultdict
from pathlib import Path

import openpyxl

sys.path.append(str(Path(__file__).resolve().parent.parent))

from app.core.database import SessionLocal  # noqa: E402
from app.services.catalog_sync import (  # noqa: E402
    ProductInput,
    VariantInput,
    deactivate_missing,
    to_decimal,
    upsert_product,
)

EXTERNAL_SOURCE = "pisell"


def load_rows(path: str) -> list[dict]:
    wb = openpyxl.load_workbook(path, data_only=True)
    ws = wb["Sheet1"] if "Sheet1" in wb.sheetnames else wb.worksheets[0]
    cols = [c.value for c in ws[1]]
    return [dict(zip(cols, r)) for r in ws.iter_rows(min_row=2, values_only=True)]


def first_image(raw: str | None) -> str | None:
    if not raw:
        return None
    return raw.split(";")[0].strip() or None


def variant_name(row: dict) -> str:
    """Combines the option-dimension columns into one label, e.g. a size
    and a flavor become "单个 · 柿柿如意". Falls back to the variant id if
    somehow neither dimension is set."""
    parts = []
    for item_col in ("variant_item1", "variant_item2", "variant_item3"):
        value = row.get(item_col)
        if value:
            parts.append(str(value))
    return " · ".join(parts) if parts else f"#{row.get('variant_id')}"


def build_products(rows: list[dict]) -> list[ProductInput]:
    by_product: dict[int, list[dict]] = defaultdict(list)
    for row in rows:
        pid = row.get("product_id")
        if pid is not None:
            by_product[pid].append(row)

    items: list[ProductInput] = []
    for product_id, product_rows in by_product.items():
        parent = next(
            (r for r in product_rows if not r.get("variant_id")), product_rows[0]
        )
        if not parent.get("title"):
            # Shouldn't happen, but skip rather than import a nameless product.
            continue

        price = to_decimal(parent.get("price"))
        if price is None:
            variant_prices = [
                to_decimal(r.get("price")) for r in product_rows if r is not parent
            ]
            variant_prices = [p for p in variant_prices if p]
            price = min(variant_prices) if variant_prices else None
        # Genuinely unpriced on Pisell's side (happens — a product created
        # without ever setting a price). Don't publish a $0 item; keep the
        # row (so stock/description still sync) but hide it from the store.
        is_unpriced = price is None
        if is_unpriced:
            price = to_decimal(0) or 0

        variant_rows = [r for r in product_rows if r is not parent]
        if variant_rows:
            # The parent row's own stock_quantity is unreliable — same issue
            # as price, it's sometimes 0 while the real stock sits on each
            # variant. Summing the variants is correct either way: when the
            # parent value *is* accurate, it already equals this sum.
            stock = sum((r.get("stock_quantity") or 0) for r in variant_rows)
        else:
            stock = parent.get("stock_quantity") or 0
        category = parent.get("category")

        variants = [
            VariantInput(
                external_id=str(r.get("variant_id")),
                name=variant_name(r),
                price=to_decimal(r.get("price")) or price,
                stock_quantity=int(r.get("stock_quantity") or 0),
                sort=i,
            )
            for i, r in enumerate(variant_rows)
        ]

        items.append(
            ProductInput(
                external_id=str(product_id),
                external_source=EXTERNAL_SOURCE,
                name=parent["title"],
                price=price,
                original_price=to_decimal(parent.get("original_price")),
                stock_quantity=int(stock),
                category_names=[category] if category else [],
                vendor=parent.get("vendor"),
                image_url=first_image(parent.get("image")),
                description=parent.get("description") or None,
                is_active=parent.get("status") == "published" and not is_unpriced,
                variants=variants,
            )
        )
    return items


def main():
    if len(sys.argv) < 2:
        print("Usage: python scripts/import_from_excel.py <path to .xlsx>", file=sys.stderr)
        sys.exit(1)

    path = sys.argv[1]
    print(f"Reading {path} ...")
    rows = load_rows(path)
    items = build_products(rows)
    print(f"Parsed {len(items)} products from {len(rows)} rows.")

    created = updated = 0
    db = SessionLocal()
    try:
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
