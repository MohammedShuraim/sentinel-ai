from sqlalchemy import select
from sqlalchemy.orm import Session

from app.crud.stock import get_stock_by_ticker
from app.models.stock_follow import StockFollow
from app.schemas.stock_follow import StockFollowCreate


def follow_stock(db: Session, user_id: int, stock: StockFollowCreate) -> StockFollow | None:
    db_stock = get_stock_by_ticker(db, stock.ticker)

    if db_stock is None:
        return None

    existing = db.scalars(
        select(StockFollow).where(
            StockFollow.user_id == user_id,
            StockFollow.stock_id == db_stock.id,
        )
    ).first()

    if existing is not None:
        return None

    db_follow = StockFollow(
        user_id=user_id,
        stock_id=db_stock.id,
    )

    db.add(db_follow)
    db.commit()
    db.refresh(db_follow)

    return db_follow


def get_followed_stocks(db: Session, user_id: int) -> list[StockFollow]:
    stmt = (
        select(StockFollow)
        .where(StockFollow.user_id == user_id)
        .order_by(StockFollow.created_at.desc())
    )

    return list(db.scalars(stmt).all())


def get_followed_stock(db: Session, user_id: int, ticker: str) -> StockFollow | None:
    db_stock = get_stock_by_ticker(db, ticker)

    if db_stock is None:
        return None

    stmt = select(StockFollow).where(
        StockFollow.user_id == user_id,
        StockFollow.stock_id == db_stock.id,
    )

    return db.scalars(stmt).first()


def unfollow_stock(db: Session, user_id: int, ticker: str) -> bool:
    db_follow = get_followed_stock(db, user_id, ticker)

    if db_follow is None:
        return False

    db.delete(db_follow)
    db.commit()

    return True
