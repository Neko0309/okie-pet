"""Import products from a Pisell "All records" stock export (.xlsx).

This is the ongoing way we keep our catalog in sync: Pisell doesn't offer a
self-serve API-key program, so instead of automated polling, the export is
re-run by hand whenever stock changes and dropped in here.

Usage:
    python scripts/import_from_excel.py "/path/to/All records-....xlsx"

Drop new export files in backend/imports/ (gitignored — this is real,
constantly-changing inventory data, not something to version control).

Row-parsing details (expected columns, price/stock fallback quirks, etc)
live in app/services/excel_io.py, shared with the admin panel's
export/import endpoints so the two paths can't drift apart.

Products from a previous import that are no longer present in this file
are marked inactive rather than deleted, so order history stays intact.
"""

import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parent.parent))

from app.core.database import SessionLocal  # noqa: E402
from app.services.catalog_sync import deactivate_missing, upsert_product  # noqa: E402
from app.services.excel_io import EXTERNAL_SOURCE, build_products, load_rows  # noqa: E402


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
