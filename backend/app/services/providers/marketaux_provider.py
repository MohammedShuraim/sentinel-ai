import httpx

from app.core.config import settings


class MarketauxProvider:
    """Client for the Marketaux financial news API.

    This class is responsible only for communicating with Marketaux. It
    performs no validation, normalization, or persistence — callers are
    expected to hand the raw articles to the news import pipeline.
    """

    def __init__(self):
        """Create a provider instance.

        Reads the Marketaux API key and base URL from application
        settings. The values are stored as-is without validation.
        """
        self.api_key = settings.MARKETAUX_API_KEY
        self.base_url = settings.MARKETAUX_BASE_URL

    def fetch_news(
        self,
        symbols: list[str],
        limit: int = 3,
        page: int = 1,
    ) -> list[dict]:
        """Fetch entity-tagged news for the given symbols from Marketaux.

        Returns the raw article dictionaries exactly as Marketaux sends
        them, without validation or normalization. Raises
        ``httpx.HTTPStatusError`` if Marketaux returns an error status.
        """
        params = {
            "api_token": self.api_key,
            "symbols": ",".join(symbols),
            "filter_entities": "true",
            "language": "en",
            "limit": limit,
            "page": page,
        }

        with httpx.Client() as client:
            response = client.get(f"{self.base_url}/news/all", params=params)
            response.raise_for_status()

            return response.json()["data"]
