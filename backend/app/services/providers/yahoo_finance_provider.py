import yfinance as yf

from app.services.providers.fundamentals_provider import FundamentalsProvider


class YahooFinanceProvider(FundamentalsProvider):
    """Client for Yahoo Finance company fundamentals via yfinance.

    This class is responsible only for communicating with Yahoo Finance.
    It performs no validation, normalization, or persistence — callers are
    expected to map the returned dictionary into the fundamentals import
    pipeline.
    """

    def fetch_fundamentals(self, ticker: str) -> dict:
        """Fetch company fundamentals for a single stock from Yahoo Finance.

        Returns a dictionary compatible with FundamentalCreate. Missing
        metrics are returned as ``None``. ``face_value`` is always
        ``None`` because Yahoo Finance does not expose it for NSE stocks.
        """
        yahoo_ticker = ticker if ticker.endswith(".NS") else f"{ticker}.NS"

        stock = yf.Ticker(yahoo_ticker)
        info = stock.info

        return {
            "market_cap": info.get("marketCap"),
            "pe_ratio": info.get("trailingPE"),
            "eps": info.get("trailingEps"),
            "roe": info.get("returnOnEquity"),
            "debt_to_equity": info.get("debtToEquity"),
            "book_value": info.get("bookValue"),
            "dividend_yield": info.get("dividendYield"),
            "face_value": None,
        }
