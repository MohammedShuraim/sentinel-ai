"""unique_fundamentals_stock_id

Revision ID: e5b72d8a1c9f
Revises: d4a91c2e7f8b
Create Date: 2026-08-02 19:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "e5b72d8a1c9f"
down_revision: Union[str, Sequence[str], None] = "d4a91c2e7f8b"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Remove duplicate fundamentals, then enforce unique stock_id."""
    op.execute(
        """
        DELETE FROM fundamentals
        WHERE id NOT IN (
            SELECT kept.id
            FROM (
                SELECT DISTINCT ON (stock_id) id
                FROM fundamentals
                ORDER BY stock_id, updated_at DESC, id DESC
            ) AS kept
        )
        """
    )

    op.drop_index(
        op.f("ix_fundamentals_stock_id"),
        table_name="fundamentals",
    )
    op.create_index(
        op.f("ix_fundamentals_stock_id"),
        "fundamentals",
        ["stock_id"],
        unique=True,
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(
        op.f("ix_fundamentals_stock_id"),
        table_name="fundamentals",
    )
    op.create_index(
        op.f("ix_fundamentals_stock_id"),
        "fundamentals",
        ["stock_id"],
        unique=False,
    )
