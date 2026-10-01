"""add password reset code fields to users

Revision ID: 2ad24622c2b5
Revises: ed392fd791b2
Create Date: 2026-10-02 00:46:27.735405

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '2ad24622c2b5'
down_revision: Union[str, None] = 'ed392fd791b2'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("users", sa.Column("reset_code_hash", sa.String(64), nullable=True))
    op.add_column(
        "users", sa.Column("reset_code_expires_at", sa.DateTime(timezone=True), nullable=True)
    )


def downgrade() -> None:
    op.drop_column("users", "reset_code_expires_at")
    op.drop_column("users", "reset_code_hash")
