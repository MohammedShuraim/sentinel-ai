from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.portfolio import Portfolio
from app.schemas.portfolio import PortfolioCreate, PortfolioUpdate


def create_portfolio(
    db: Session,
    user_id: int,
    portfolio: PortfolioCreate,
) -> Portfolio | None:
    if get_portfolio_by_stock(db, user_id, portfolio.stock_id) is not None:
        return None

    db_portfolio = Portfolio(
        user_id=user_id,
        stock_id=portfolio.stock_id,
        quantity=portfolio.quantity,
        average_price=portfolio.average_price,
    )

    db.add(db_portfolio)
    db.commit()
    db.refresh(db_portfolio)

    return db_portfolio


def get_portfolio(db: Session, portfolio_id: int) -> Portfolio | None:
    return db.get(Portfolio, portfolio_id)


def get_user_portfolio(db: Session, user_id: int) -> list[Portfolio]:
    stmt = (
        select(Portfolio)
        .where(Portfolio.user_id == user_id)
        .order_by(Portfolio.created_at.desc())
    )

    return list(db.scalars(stmt).all())


def get_portfolio_by_stock(
    db: Session,
    user_id: int,
    stock_id: int,
) -> Portfolio | None:
    stmt = select(Portfolio).where(
        Portfolio.user_id == user_id,
        Portfolio.stock_id == stock_id,
    )

    return db.scalars(stmt).first()


def update_portfolio(
    db: Session,
    portfolio_id: int,
    portfolio: PortfolioUpdate,
) -> Portfolio | None:
    db_portfolio = db.get(Portfolio, portfolio_id)

    if db_portfolio is None:
        return None

    updates = portfolio.model_dump(exclude_unset=True)

    for field, value in updates.items():
        setattr(db_portfolio, field, value)

    db.commit()
    db.refresh(db_portfolio)

    return db_portfolio


def delete_portfolio(db: Session, portfolio_id: int) -> bool:
    db_portfolio = db.get(Portfolio, portfolio_id)

    if db_portfolio is None:
        return False

    db.delete(db_portfolio)
    db.commit()

    return True
