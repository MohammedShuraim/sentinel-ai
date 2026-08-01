from sqlalchemy.orm import Session


class NewsImportService:
    """Imports stock market news articles into the database.

    Orchestrates the full import pipeline: fetching articles from an
    external news provider, validating and normalizing them, and storing
    the resulting records in the news table.
    """

    def fetch_news(self) -> list[dict]:
        """Fetch raw news articles from the external news provider.

        Will call the provider's API and return the articles as a list
        of dictionaries, without applying any validation or normalization.
        """
        raise NotImplementedError

    def validate_articles(self, articles: list[dict]) -> list[dict]:
        """Validate and normalize raw articles.

        Will remove articles with missing or invalid required fields,
        normalize URLs, and normalize timestamps. Returns only the
        articles that are safe to store.
        """
        raise NotImplementedError

    def store_articles(self, db: Session, articles: list[dict]) -> int:
        """Store validated articles in the news table.

        Will resolve each article's ticker to a stock_id, skip articles
        whose URL already exists, insert the remaining articles, and
        return the number of records inserted.
        """
        raise NotImplementedError

    def import_news(self, db: Session) -> int:
        """Run the full news import pipeline.

        Will chain ``fetch_news`` -> ``validate_articles`` ->
        ``store_articles`` and return the number of articles imported.
        """
        raise NotImplementedError
