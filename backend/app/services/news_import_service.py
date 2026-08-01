from datetime import datetime

from sqlalchemy.orm import Session

from app.crud.news import create_news
from app.crud.stock import get_all_stocks, get_stock_by_ticker
from app.schemas.news import NewsCreate


class NewsImportService:
    """Imports stock market news articles into the database.

    Orchestrates the full import pipeline: fetching articles from an
    external news provider, validating and normalizing them, and storing
    the resulting records in the news table.
    """

    def __init__(self, provider):
        """Create the news import service for the given news provider.

        Any object exposing a ``fetch_news()`` method returning raw
        article dictionaries is accepted, so providers can be swapped
        without changing the pipeline.
        """
        self.provider = provider

    def fetch_news(self, *args, **kwargs) -> list[dict]:
        """Fetch raw news articles from the configured news provider.

        Arguments are forwarded to the provider unchanged, since each
        provider takes its own parameters. Returns the articles as a
        list of dictionaries, without validation or normalization.
        """
        return self.provider.fetch_news(*args, **kwargs)

    def validate_articles(self, articles: list[dict]) -> list[dict]:
        """Validate and normalize raw articles.

        Skips articles with missing or empty required fields, including
        those without identified entities, trims whitespace from string
        values, and maps the provider's field names onto the news
        schema. The entities list is preserved as provided so that
        ``store_articles`` can resolve the stock it belongs to.
        """
        required_fields = (
            "title",
            "description",
            "url",
            "source",
            "published_at",
            "entities",
        )

        valid_articles: list[dict] = []

        for article in articles:
            cleaned = {
                key: value.strip() if isinstance(value, str) else value
                for key, value in article.items()
            }

            if any(not cleaned.get(field) for field in required_fields):
                continue

            valid_articles.append(
                {
                    "title": cleaned["title"],
                    "content": cleaned["description"],
                    "url": cleaned["url"],
                    "source": cleaned["source"],
                    "published_at": cleaned["published_at"],
                    "entities": cleaned["entities"],
                }
            )

        return valid_articles

    def store_articles(self, db: Session, articles: list[dict]) -> int:
        """Store validated articles in the news table.

        Resolves each article to a stock through its NSE entity, skips
        articles with no NSE entity or no matching stock, and delegates
        insertion (including duplicate-URL handling) to the news CRUD
        layer. Returns the number of records inserted.
        """
        inserted = 0

        for article in articles:
            nse_entities = [
                entity
                for entity in article["entities"]
                if str(entity.get("symbol", "")).endswith(".NS")
            ]

            if not nse_entities:
                continue

            # Marketaux may tag one article with several entities (e.g. both
            # the NSE and BSE listing, or other companies mentioned in
            # passing), so pick the highest-confidence NSE match.
            entity = max(nse_entities, key=lambda e: e.get("match_score", 0))

            db_stock = get_stock_by_ticker(db, entity["symbol"].removesuffix(".NS"))

            if db_stock is None:
                continue

            news = NewsCreate(
                title=article["title"],
                content=article["content"],
                url=article["url"],
                source=article["source"],
                published_at=datetime.fromisoformat(
                    article["published_at"].replace("Z", "+00:00")
                ),
            )

            if create_news(db, db_stock.id, news) is not None:
                inserted += 1

        return inserted

    def import_news(self, db: Session) -> int:
        """Run the full news import pipeline for all active stocks.

        Builds the provider's NSE symbol list from the stock master,
        then chains ``fetch_news`` -> ``validate_articles`` ->
        ``store_articles`` and returns the number of articles imported.
        """
        stocks = get_all_stocks(db)

        if not stocks:
            return 0

        symbols = [f"{stock.ticker}.NS" for stock in stocks]

        articles = self.fetch_news(symbols)
        valid_articles = self.validate_articles(articles)

        return self.store_articles(db, valid_articles)
