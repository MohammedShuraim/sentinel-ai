"""Formats the user's live portfolio/watchlist/trade context for AI prompts."""

from sqlalchemy.orm import Session

from app.crud.portfolio import get_user_portfolio
from app.crud.stock_follow import get_followed_stocks
from app.crud.transaction import get_user_transactions
from app.models.stock import Stock


class UserContextFormatterService:
    """Build a compact investment-context block for the LLM.

    Reuses existing CRUD helpers. Performs no LLM calls.
    """

    def format_user_context(self, db: Session, user_id: int) -> str:
        holdings = get_user_portfolio(db, user_id)
        follows = get_followed_stocks(db, user_id)
        transactions = get_user_transactions(db, user_id)[:8]

        holding_lines: list[str] = []
        owned_tickers: list[str] = []
        for holding in holdings:
            stock = db.get(Stock, holding.stock_id)
            if stock is None:
                continue
            owned_tickers.append(stock.ticker)
            invested = holding.quantity * holding.average_price
            holding_lines.append(
                f"- {stock.ticker} ({stock.company_name}): "
                f"{holding.quantity:g} units @ avg ₹{holding.average_price:,.2f} "
                f"(invested ₹{invested:,.2f})"
            )

        watch_lines: list[str] = []
        for follow in follows:
            stock = db.get(Stock, follow.stock_id)
            if stock is None:
                continue
            watch_lines.append(f"- {stock.ticker} ({stock.company_name})")

        tx_lines: list[str] = []
        for tx in transactions:
            stock = db.get(Stock, tx.stock_id)
            ticker = stock.ticker if stock is not None else f"stock#{tx.stock_id}"
            tx_lines.append(
                f"- {tx.transaction_type} {tx.quantity:g} {ticker} "
                f"@ ₹{tx.price:,.2f}"
            )

        holdings_block = (
            "\n".join(holding_lines)
            if holding_lines
            else "- None (empty portfolio)"
        )
        watch_block = "\n".join(watch_lines) if watch_lines else "- None"
        tx_block = "\n".join(tx_lines) if tx_lines else "- None"
        owned_block = ", ".join(owned_tickers) if owned_tickers else "none"

        return (
            "Portfolio Holdings:\n"
            f"{holdings_block}\n"
            "\n"
            "Watchlist:\n"
            f"{watch_block}\n"
            "\n"
            "Recent Transactions:\n"
            f"{tx_block}\n"
            "\n"
            "Owned tickers (do not ignore):\n"
            f"{owned_block}\n"
            "\n"
            "Portfolio rules:\n"
            "- If the user already owns a stock, acknowledge it explicitly.\n"
            "- Never recommend buying the exact same holding as if it were new "
            "without explaining Increase Position, Average Down, Hold, "
            "Take Profit, or Diversify instead.\n"
            "- Prefer diversification when concentration risk is high."
        )
