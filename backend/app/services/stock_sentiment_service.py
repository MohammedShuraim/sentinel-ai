from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.news_analysis import NewsAnalysis
from app.models.stock_sentiment import StockSentiment


class StockSentimentService:
    """Maintains rolling aggregate sentiment counts per stock.

    Updates counters from news analysis results. Performs no LLM calls.
    """

    def update_stock_sentiment(
        self,
        db: Session,
        analysis: NewsAnalysis,
    ) -> StockSentiment:
        """Increment sentiment counts and recompute the majority overall."""
        stock_id = analysis.news.stock_id

        stmt = select(StockSentiment).where(StockSentiment.stock_id == stock_id)
        sentiment = db.scalars(stmt).first()

        if sentiment is None:
            sentiment = StockSentiment(
                stock_id=stock_id,
                positive_count=0,
                neutral_count=0,
                negative_count=0,
                overall_sentiment="neutral",
            )
            db.add(sentiment)

        if analysis.sentiment == "positive":
            sentiment.positive_count += 1
        elif analysis.sentiment == "neutral":
            sentiment.neutral_count += 1
        elif analysis.sentiment == "negative":
            sentiment.negative_count += 1

        sentiment.overall_sentiment = self._majority_sentiment(sentiment)

        db.commit()
        db.refresh(sentiment)

        return sentiment

    def _majority_sentiment(self, sentiment: StockSentiment) -> str:
        """Return the sentiment label with the highest count."""
        counts = {
            "positive": sentiment.positive_count,
            "neutral": sentiment.neutral_count,
            "negative": sentiment.negative_count,
        }

        return max(counts, key=lambda label: counts[label])
