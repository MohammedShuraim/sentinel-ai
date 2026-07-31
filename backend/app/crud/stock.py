from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.models.stock import Stock
from app.schemas.stock import StockCreate


def _normalize_ticker(ticker: str) -> str:
    return ticker.strip().upper()


def create_stock(db: Session, stock: StockCreate) -> Stock | None:
    ticker = _normalize_ticker(stock.ticker)

    if get_stock_by_ticker(db, ticker) is not None:
        return None

    db_stock = Stock(
        ticker=ticker,
        company_name=stock.company_name,
        exchange=stock.exchange,
        sector=stock.sector,
        industry=stock.industry,
    )

    db.add(db_stock)
    db.commit()
    db.refresh(db_stock)

    return db_stock


def get_stock_by_ticker(db: Session, ticker: str) -> Stock | None:
    stmt = select(Stock).where(Stock.ticker == _normalize_ticker(ticker))

    return db.scalars(stmt).first()


def get_all_stocks(db: Session) -> list[Stock]:
    stmt = (
        select(Stock)
        .where(Stock.is_active.is_(True))
        .order_by(Stock.company_name.asc())
    )

    return list(db.scalars(stmt).all())


def search_stocks(db: Session, query: str) -> list[Stock]:
    query = query.strip()

    if not query:
        return []

    pattern = f"%{query}%"

    stmt = (
        select(Stock)
        .where(
            Stock.is_active.is_(True),
            or_(
                Stock.ticker.ilike(pattern),
                Stock.company_name.ilike(pattern),
            ),
        )
        .order_by(Stock.company_name.asc())
    )

    return list(db.scalars(stmt).all())
