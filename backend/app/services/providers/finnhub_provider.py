import httpx

from app.core.config import settings


class FinnhubProvider:
    """Client for the Finnhub market news API.

    This class is responsible only for communicating with Finnhub. It
    performs no validation, normalization, or persistence — callers are
    expected to hand the raw articles to the news import pipeline.
    """

    def __init__(self):
        """Create a provider instance.

        Reads the Finnhub API key and base URL from application
        settings. The values are stored as-is without validation; the
        HTTP client and timeouts will be added later.
        """
        self.api_key = settings.FINNHUB_API_KEY
        self.base_url = settings.FINNHUB_BASE_URL

    def fetch_news(self, tickers: list[str] | None = None) -> list[dict]:
        """Fetch general market news from Finnhub.

        Returns the raw article dictionaries exactly as Finnhub sends
        them, without validation or normalization. Raises
        ``httpx.HTTPStatusError`` if Finnhub returns an error status.
        """
        params = {
            "category": "general",
            "token": self.api_key,
        }

        with httpx.Client() as client:
            response = client.get(f"{self.base_url}/news", params=params)
            response.raise_for_status()

            return response.json()

    def fetch_fundamentals(self, ticker: str) -> dict:
        """Fetch company fundamentals for a single stock from Finnhub.

        Calls the Company Basic Financials endpoint and maps the latest
        available metrics into a dictionary compatible with
        ``FundamentalCreate``. Missing metrics are returned as ``None``.
        Raises ``httpx.HTTPStatusError`` if Finnhub returns an error
        status.
        """
        params = {
            "symbol": ticker,
            "metric": "all",
            "token": self.api_key,
        }

        with httpx.Client() as client:
            response = client.get(
                f"{self.base_url}/stock/metric",
                params=params,
            )
            response.raise_for_status()

            payload = response.json()

        metric = payload.get("metric") or {}

        return {
            "market_cap": metric.get("marketCapitalization"),
            "pe_ratio": metric.get("peBasicExclExtraTTM"),
            "eps": metric.get("epsBasicExclExtraItemsTTM"),
            "roe": metric.get("roeTTM"),
            "debt_to_equity": metric.get("totalDebt/totalEquityQuarterly"),
            "book_value": metric.get("bookValuePerShareQuarterly"),
            "dividend_yield": metric.get("dividendYieldIndicatedAnnual"),
            "face_value": metric.get("faceValue"),
        }
