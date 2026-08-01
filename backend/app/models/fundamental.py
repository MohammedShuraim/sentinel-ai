from datetime import datetime, timezone
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, Float, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.stock import Stock


class Fundamental(Base):
    __tablename__ = "fundamentals"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    stock_id: Mapped[int] = mapped_column(
        ForeignKey("stocks.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    market_cap: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )

    pe_ratio: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )

    eps: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )

    roe: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )

    debt_to_equity: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )

    book_value: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )

    dividend_yield: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )

    face_value: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    stock: Mapped["Stock"] = relationship(back_populates="fundamental")
