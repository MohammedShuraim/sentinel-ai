"""normalize stock_follows to reference stocks

Revision ID: f3216b2d40f8
Revises: 316ca6c0e773
Create Date: 2026-08-01 02:17:52.673530

NOTE: This is a schema-only migration. It assumes stock_follows is empty
(or already backfilled). On a database with existing follow records,
adding the NOT NULL stock_id column will fail, and dropping ticker /
company_name would destroy the data needed to backfill it. See the
migration strategy for populated databases in the project notes before
running this in production.
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "f3216b2d40f8"
down_revision: Union[str, Sequence[str], None] = "316ca6c0e773"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "stock_follows",
        sa.Column("stock_id", sa.Integer(), nullable=False),
    )

    op.drop_index(op.f("ix_stock_follows_ticker"), table_name="stock_follows")
    op.drop_constraint(
        op.f("uq_stock_follows_user_id_ticker"),
        "stock_follows",
        type_="unique",
    )

    op.create_index(
        op.f("ix_stock_follows_stock_id"),
        "stock_follows",
        ["stock_id"],
        unique=False,
    )
    op.create_unique_constraint(
        "uq_stock_follows_user_id_stock_id",
        "stock_follows",
        ["user_id", "stock_id"],
    )
    op.create_foreign_key(
        "fk_stock_follows_stock_id_stocks",
        "stock_follows",
        "stocks",
        ["stock_id"],
        ["id"],
        ondelete="CASCADE",
    )

    op.drop_column("stock_follows", "company_name")
    op.drop_column("stock_follows", "ticker")


def downgrade() -> None:
    op.add_column(
        "stock_follows",
        sa.Column("ticker", sa.VARCHAR(length=20), autoincrement=False, nullable=False),
    )
    op.add_column(
        "stock_follows",
        sa.Column("company_name", sa.VARCHAR(length=255), autoincrement=False, nullable=False),
    )

    op.drop_constraint(
        "fk_stock_follows_stock_id_stocks",
        "stock_follows",
        type_="foreignkey",
    )
    op.drop_constraint(
        "uq_stock_follows_user_id_stock_id",
        "stock_follows",
        type_="unique",
    )
    op.drop_index(op.f("ix_stock_follows_stock_id"), table_name="stock_follows")

    op.create_unique_constraint(
        op.f("uq_stock_follows_user_id_ticker"),
        "stock_follows",
        ["user_id", "ticker"],
    )
    op.create_index(
        op.f("ix_stock_follows_ticker"),
        "stock_follows",
        ["ticker"],
        unique=False,
    )

    op.drop_column("stock_follows", "stock_id")
