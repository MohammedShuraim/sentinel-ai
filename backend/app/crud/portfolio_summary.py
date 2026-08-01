from sqlalchemy.orm import Session

from app.crud.portfolio import get_user_portfolio
from app.schemas.portfolio_summary import PortfolioSummary


def get_portfolio_summary(db: Session, user_id: int) -> PortfolioSummary:
    portfolios = get_user_portfolio(db, user_id)

    if not portfolios:
        return PortfolioSummary(
            total_holdings=0,
            total_quantity=0,
            total_invested=0,
        )

    total_holdings = len(portfolios)

    total_quantity = sum(
        portfolio.quantity
        for portfolio in portfolios
    )

    total_invested = sum(
        portfolio.quantity * portfolio.average_price
        for portfolio in portfolios
    )

    return PortfolioSummary(
        total_holdings=total_holdings,
        total_quantity=total_quantity,
        total_invested=total_invested,
    )
