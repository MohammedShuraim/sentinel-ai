"""add investor profile goal fields

Revision ID: a1b2c3d4e5f6
Revises: ce231d45722a
Create Date: 2026-08-05 06:55:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "a1b2c3d4e5f6"
down_revision: Union[str, Sequence[str], None] = "ce231d45722a"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "investor_profiles",
        sa.Column("investment_horizon", sa.String(length=50), nullable=True),
    )
    op.add_column(
        "investor_profiles",
        sa.Column("investment_budget", sa.String(length=50), nullable=True),
    )
    op.add_column(
        "investor_profiles",
        sa.Column("investment_goals", sa.String(length=100), nullable=True),
    )
    op.add_column(
        "investor_profiles",
        sa.Column("experience_level", sa.String(length=50), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("investor_profiles", "experience_level")
    op.drop_column("investor_profiles", "investment_goals")
    op.drop_column("investor_profiles", "investment_budget")
    op.drop_column("investor_profiles", "investment_horizon")
