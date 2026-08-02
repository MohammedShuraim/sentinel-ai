"""add_google_oauth_fields_to_users

Revision ID: c3f8a1d92e4b
Revises: a9167c99a8dd
Create Date: 2026-08-02 16:20:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "c3f8a1d92e4b"
down_revision: Union[str, Sequence[str], None] = "a9167c99a8dd"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column(
        "users",
        sa.Column(
            "auth_provider",
            sa.String(length=30),
            nullable=False,
            server_default="email",
        ),
    )
    op.add_column(
        "users",
        sa.Column("google_sub", sa.String(length=255), nullable=True),
    )
    op.add_column(
        "users",
        sa.Column("profile_picture", sa.Text(), nullable=True),
    )
    op.alter_column(
        "users",
        "hashed_password",
        existing_type=sa.String(length=255),
        nullable=True,
    )
    op.create_index(
        op.f("ix_users_google_sub"),
        "users",
        ["google_sub"],
        unique=True,
    )
    op.alter_column(
        "users",
        "auth_provider",
        server_default=None,
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f("ix_users_google_sub"), table_name="users")
    op.alter_column(
        "users",
        "hashed_password",
        existing_type=sa.String(length=255),
        nullable=False,
    )
    op.drop_column("users", "profile_picture")
    op.drop_column("users", "google_sub")
    op.drop_column("users", "auth_provider")
