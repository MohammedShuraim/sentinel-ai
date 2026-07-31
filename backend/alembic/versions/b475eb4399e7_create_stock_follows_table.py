"""create stock_follows table

Revision ID: b475eb4399e7
Revises: 520b6250d5a8
Create Date: 2026-07-31 23:54:32.555513

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "b475eb4399e7"
down_revision: Union[str, Sequence[str], None] = "520b6250d5a8"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "stock_follows",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("ticker", sa.String(length=20), nullable=False),
        sa.Column("company_name", sa.String(length=255), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", "ticker", name="uq_stock_follows_user_id_ticker"),
    )

    op.create_index(
        op.f("ix_stock_follows_id"),
        "stock_follows",
        ["id"],
        unique=False,
    )

    op.create_index(
        op.f("ix_stock_follows_ticker"),
        "stock_follows",
        ["ticker"],
        unique=False,
    )

    op.create_index(
        op.f("ix_stock_follows_user_id"),
        "stock_follows",
        ["user_id"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(op.f("ix_stock_follows_user_id"), table_name="stock_follows")
    op.drop_index(op.f("ix_stock_follows_ticker"), table_name="stock_follows")
    op.drop_index(op.f("ix_stock_follows_id"), table_name="stock_follows")
    op.drop_table("stock_follows")
