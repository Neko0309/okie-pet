"""add ingredients to products

Revision ID: 1a143a44bbea
Revises: 614303ae8e8a
Create Date: 2026-10-05 22:15:30.458635

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '1a143a44bbea'
down_revision: Union[str, None] = '614303ae8e8a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("products", sa.Column("ingredients", sa.Text(), nullable=True))
    op.add_column("products", sa.Column("ingredients_en", sa.Text(), nullable=True))


def downgrade() -> None:
    op.drop_column("products", "ingredients_en")
    op.drop_column("products", "ingredients")
