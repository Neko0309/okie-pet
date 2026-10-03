"""add stripe checkout session id to orders

Revision ID: ce663168d61b
Revises: 2ad24622c2b5
Create Date: 2026-10-03 16:44:00.748742

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'ce663168d61b'
down_revision: Union[str, None] = '2ad24622c2b5'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "orders", sa.Column("stripe_checkout_session_id", sa.String(255), nullable=True)
    )
    op.create_unique_constraint(
        "uq_orders_stripe_checkout_session_id", "orders", ["stripe_checkout_session_id"]
    )


def downgrade() -> None:
    op.drop_constraint("uq_orders_stripe_checkout_session_id", "orders", type_="unique")
    op.drop_column("orders", "stripe_checkout_session_id")
