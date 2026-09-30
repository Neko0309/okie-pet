"""add email verification fields to users

Revision ID: ed392fd791b2
Revises: fcfab15ce1d3
Create Date: 2026-09-30 15:32:48.466415

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'ed392fd791b2'
down_revision: Union[str, None] = 'fcfab15ce1d3'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # server_default=true backfills existing accounts as already-verified
    # (they predate this feature) — the ORM always sends an explicit
    # is_verified=False on new registrations, so this default only ever
    # applies to pre-existing rows.
    op.add_column(
        "users",
        sa.Column("is_verified", sa.Boolean(), nullable=False, server_default=sa.text("true")),
    )
    op.add_column("users", sa.Column("verification_code_hash", sa.String(64), nullable=True))
    op.add_column(
        "users",
        sa.Column("verification_code_expires_at", sa.DateTime(timezone=True), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("users", "verification_code_expires_at")
    op.drop_column("users", "verification_code_hash")
    op.drop_column("users", "is_verified")
