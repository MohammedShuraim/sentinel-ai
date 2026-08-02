"""create_embedding_metadata_table

Revision ID: d4a91c2e7f8b
Revises: c3f8a1d92e4b
Create Date: 2026-08-02 19:25:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "d4a91c2e7f8b"
down_revision: Union[str, Sequence[str], None] = "c3f8a1d92e4b"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        "embedding_metadata",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("stock_id", sa.Integer(), nullable=False),
        sa.Column("document_hash", sa.String(length=64), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(
            ["stock_id"],
            ["stocks.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_embedding_metadata_id"),
        "embedding_metadata",
        ["id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_embedding_metadata_stock_id"),
        "embedding_metadata",
        ["stock_id"],
        unique=True,
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(
        op.f("ix_embedding_metadata_stock_id"),
        table_name="embedding_metadata",
    )
    op.drop_index(
        op.f("ix_embedding_metadata_id"),
        table_name="embedding_metadata",
    )
    op.drop_table("embedding_metadata")
