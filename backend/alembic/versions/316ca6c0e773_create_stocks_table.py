"""create stocks table

Revision ID: 316ca6c0e773
Revises: b475eb4399e7
Create Date: 2026-08-01 00:40:32.924314

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "316ca6c0e773"
down_revision: Union[str, Sequence[str], None] = "b475eb4399e7"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "stocks",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("ticker", sa.String(length=20), nullable=False),
        sa.Column("company_name", sa.String(length=255), nullable=False),
        sa.Column("exchange", sa.String(length=20), nullable=False),
        sa.Column("sector", sa.String(length=100), nullable=False),
        sa.Column("industry", sa.String(length=100), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_index(
        op.f("ix_stocks_company_name"),
        "stocks",
        ["company_name"],
        unique=False,
    )

    op.create_index(
        op.f("ix_stocks_id"),
        "stocks",
        ["id"],
        unique=False,
    )

    op.create_index(
        op.f("ix_stocks_ticker"),
        "stocks",
        ["ticker"],
        unique=True,
    )


def downgrade() -> None:
    op.drop_index(op.f("ix_stocks_ticker"), table_name="stocks")
    op.drop_index(op.f("ix_stocks_id"), table_name="stocks")
    op.drop_index(op.f("ix_stocks_company_name"), table_name="stocks")
    op.drop_table("stocks")
