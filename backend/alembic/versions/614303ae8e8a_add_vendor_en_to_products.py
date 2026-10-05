"""add vendor_en to products

Revision ID: 614303ae8e8a
Revises: ce663168d61b
Create Date: 2026-10-05 20:49:25.043326

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '614303ae8e8a'
down_revision: Union[str, None] = 'ce663168d61b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("products", sa.Column("vendor_en", sa.String(255), nullable=True))


def downgrade() -> None:
    op.drop_column("products", "vendor_en")
