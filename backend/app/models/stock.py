from typing import TYPE_CHECKING

from sqlalchemy import Boolean, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.fundamental import Fundamental
    from app.models.news import News
    from app.models.portfolio import Portfolio
    from app.models.stock_follow import StockFollow
    from app.models.transaction import Transaction


class Stock(Base):
    __tablename__ = "stocks"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    ticker: Mapped[str] = mapped_column(
        String(20),
        unique=True,
        nullable=False,
        index=True,
    )

    company_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        index=True,
    )

    exchange: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
    )

    sector: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    industry: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
    )

    followers: Mapped[list["StockFollow"]] = relationship(
        back_populates="stock",
        cascade="all, delete-orphan",
    )

    news: Mapped[list["News"]] = relationship(
        back_populates="stock",
        cascade="all, delete-orphan",
    )

    portfolios: Mapped[list["Portfolio"]] = relationship(
        back_populates="stock",
        cascade="all, delete-orphan",
    )

    transactions: Mapped[list["Transaction"]] = relationship(
        back_populates="stock",
        cascade="all, delete-orphan",
    )

    fundamental: Mapped["Fundamental"] = relationship(
        back_populates="stock",
        cascade="all, delete-orphan",
        uselist=False,
    )
