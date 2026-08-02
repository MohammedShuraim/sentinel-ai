"""create investor profile, sentiment, news analysis, and investor embedding tables

Revision ID: ce231d45722a
Revises: e5b72d8a1c9f
Create Date: 2026-08-02 19:47:48.063044

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from pgvector.sqlalchemy import Vector
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "ce231d45722a"
down_revision: Union[str, Sequence[str], None] = "e5b72d8a1c9f"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.execute("CREATE EXTENSION IF NOT EXISTS vector")

    op.create_table(
        "investor_profiles",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("risk_tolerance", sa.String(length=50), nullable=True),
        sa.Column(
            "preferred_sectors",
            postgresql.JSON(astext_type=sa.Text()),
            nullable=True,
        ),
        sa.Column("investment_style", sa.String(length=50), nullable=True),
        sa.Column("preferred_market_cap", sa.String(length=50), nullable=True),
        sa.Column("dividend_preference", sa.Boolean(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_investor_profiles_id"),
        "investor_profiles",
        ["id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_investor_profiles_user_id"),
        "investor_profiles",
        ["user_id"],
        unique=True,
    )

    op.create_table(
        "investor_profile_embeddings",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("profile_text", sa.Text(), nullable=False),
        sa.Column("embedding", Vector(dim=384), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_investor_profile_embeddings_id"),
        "investor_profile_embeddings",
        ["id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_investor_profile_embeddings_user_id"),
        "investor_profile_embeddings",
        ["user_id"],
        unique=True,
    )

    op.create_table(
        "stock_sentiments",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("stock_id", sa.Integer(), nullable=False),
        sa.Column("positive_count", sa.Integer(), nullable=False),
        sa.Column("neutral_count", sa.Integer(), nullable=False),
        sa.Column("negative_count", sa.Integer(), nullable=False),
        sa.Column("overall_sentiment", sa.String(length=50), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(
            ["stock_id"],
            ["stocks.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_stock_sentiments_id"),
        "stock_sentiments",
        ["id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_stock_sentiments_stock_id"),
        "stock_sentiments",
        ["stock_id"],
        unique=True,
    )

    op.create_table(
        "news_analysis",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("news_id", sa.Integer(), nullable=False),
        sa.Column("sentiment", sa.String(length=50), nullable=False),
        sa.Column("impact", sa.String(length=50), nullable=False),
        sa.Column("event_type", sa.String(length=50), nullable=False),
        sa.Column(
            "mentioned_tickers",
            postgresql.JSON(astext_type=sa.Text()),
            nullable=False,
        ),
        sa.Column("summary", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(
            ["news_id"],
            ["news.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_news_analysis_id"),
        "news_analysis",
        ["id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_news_analysis_news_id"),
        "news_analysis",
        ["news_id"],
        unique=True,
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f("ix_news_analysis_news_id"), table_name="news_analysis")
    op.drop_index(op.f("ix_news_analysis_id"), table_name="news_analysis")
    op.drop_table("news_analysis")

    op.drop_index(
        op.f("ix_stock_sentiments_stock_id"),
        table_name="stock_sentiments",
    )
    op.drop_index(op.f("ix_stock_sentiments_id"), table_name="stock_sentiments")
    op.drop_table("stock_sentiments")

    op.drop_index(
        op.f("ix_investor_profile_embeddings_user_id"),
        table_name="investor_profile_embeddings",
    )
    op.drop_index(
        op.f("ix_investor_profile_embeddings_id"),
        table_name="investor_profile_embeddings",
    )
    op.drop_table("investor_profile_embeddings")

    op.drop_index(
        op.f("ix_investor_profiles_user_id"),
        table_name="investor_profiles",
    )
    op.drop_index(op.f("ix_investor_profiles_id"), table_name="investor_profiles")
    op.drop_table("investor_profiles")
