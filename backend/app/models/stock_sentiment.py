from datetime import datetime, timezone
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.stock import Stock


class StockSentiment(Base):
    __tablename__ = "stock_sentiments"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    stock_id: Mapped[int] = mapped_column(
        ForeignKey("stocks.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True,
    )

    positive_count: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )

    neutral_count: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )

    negative_count: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )

    overall_sentiment: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default="neutral",
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    stock: Mapped["Stock"] = relationship(back_populates="sentiment")
