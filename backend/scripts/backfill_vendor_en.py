"""One-off backfill for Product.vendor_en.

catalog_sync.upsert_product only translates vendor on import (and only
when the Chinese text changed since the last import), so the 155
products that existed before the vendor_en column was added never got
one. Translates each *distinct* vendor name once rather than once per
product — there are ~46 distinct vendors across 155 products, no point
hitting the free translation tier's rate limit 150+ times for ~3x
redundant work.

Usage: python scripts/backfill_vendor_en.py
"""

import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parent.parent))

from sqlalchemy import select  # noqa: E402

from app.core.database import SessionLocal  # noqa: E402
from app.models.product import Product  # noqa: E402
from app.services.translate import translate_text  # noqa: E402


def main():
    db = SessionLocal()
    try:
        vendors = db.scalars(
            select(Product.vendor)
            .where(Product.vendor.is_not(None), Product.vendor != "")
            .distinct()
        ).all()
        print(f"Translating {len(vendors)} distinct vendor names...")

        translated: dict[str, str | None] = {}
        for v in vendors:
            translated[v] = translate_text(v)
            print(f"  {v!r} -> {translated[v]!r}")

        updated = 0
        for vendor, vendor_en in translated.items():
            if vendor_en is None:
                continue
            result = db.execute(
                select(Product).where(Product.vendor == vendor, Product.vendor_en.is_(None))
            )
            for product in result.scalars():
                product.vendor_en = vendor_en
                updated += 1
        db.commit()
        print(f"Done. Updated {updated} products.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
