import logging
import re

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.crud.embedding_search import search_similar_embeddings
from app.crud.stock import get_all_stocks, get_stock_by_ticker
from app.models.embedding import Embedding
from app.models.stock import Stock
from app.schemas.retrieved_document import RetrievedDocument
from app.services.providers.embedding_provider import EmbeddingProvider

logger = logging.getLogger(__name__)

_TICKER_BONUS = 0.30
_COMPANY_BONUS = 0.25
_SOURCE_BONUS = 0.20

_FUNDAMENTAL_PATTERNS = (
    r"\bpe\b",
    r"\bp/e\b",
    r"\bpe ratio\b",
    r"\beps\b",
    r"\broe\b",
    r"\bdividend\b",
    r"\bmarket cap\b",
    r"\bdebt\b",
    r"\bdebt to equity\b",
    r"\bbook value\b",
    r"\bface value\b",
)

_NEWS_PATTERNS = (
    r"\bnews\b",
    r"\bheadline\b",
    r"\bannounced\b",
    r"\breported\b",
    r"\barticle\b",
)


class RetrieverService:
    """Retrieves relevant document chunks by semantic similarity.

    Embeds the query via an ``EmbeddingProvider``, looks up nearest
    chunks, then applies deterministic ticker/company/source bonuses
    before returning the top results.
    """

    def __init__(self, embedding_provider: EmbeddingProvider):
        """Create the retriever with an injected embedding provider."""
        self.embedding_provider = embedding_provider

    def retrieve(
        self,
        db: Session,
        query: str,
        limit: int = 5,
    ) -> list[RetrievedDocument]:
        """Return the most relevant chunks for ``query`` with source metadata.

        Uses cosine similarity as the base score, then re-ranks with
        deterministic bonuses for ticker, company, and source-type matches.
        """
        query_embedding = self.embedding_provider.embed(query)

        # Over-fetch so ticker-matched stocks outside the raw top-k can surface.
        candidate_limit = max(limit * 10, 25)

        results = search_similar_embeddings(
            db,
            query_embedding,
            candidate_limit,
        )

        mentioned_tickers, mentioned_companies = self._detect_query_entities(
            db,
            query,
        )
        is_fundamental_query = self._is_fundamental_query(query)
        is_news_query = self._is_news_query(query)

        logger.info(
            "Retriever query entities: tickers=%s companies=%s "
            "fundamental=%s news=%s",
            sorted(mentioned_tickers),
            sorted(mentioned_companies),
            is_fundamental_query,
            is_news_query,
        )

        # Ensure mentioned tickers' chunks are candidates even if outside top-k.
        results = self._merge_ticker_embeddings(
            db,
            query_embedding,
            results,
            mentioned_tickers,
        )

        documents = [
            self._to_retrieved_document(
                embedding,
                score,
                mentioned_tickers=mentioned_tickers,
                mentioned_companies=mentioned_companies,
                is_fundamental_query=is_fundamental_query,
                is_news_query=is_news_query,
            )
            for embedding, score in results
        ]

        # Exact ticker/company matches must outrank pure semantic similarity.
        documents.sort(
            key=lambda document: (
                self._ticker_match(document.ticker, mentioned_tickers),
                self._company_match(document.company_name, mentioned_companies),
                self._source_preference(
                    document.source_type,
                    is_fundamental_query=is_fundamental_query,
                    is_news_query=is_news_query,
                ),
                document.score,
            ),
            reverse=True,
        )

        return documents[:limit]

    def _merge_ticker_embeddings(
        self,
        db: Session,
        query_embedding: list[float],
        results: list[tuple[Embedding, float]],
        mentioned_tickers: set[str],
    ) -> list[tuple[Embedding, float]]:
        """Add embeddings for mentioned tickers missing from the candidate set."""
        if not mentioned_tickers:
            return results

        existing_ids = {embedding.id for embedding, _score in results}
        distance = Embedding.embedding.cosine_distance(query_embedding)

        stmt = (
            select(Embedding, distance)
            .join(Stock, Embedding.stock_id == Stock.id)
            .where(Stock.ticker.in_(sorted(mentioned_tickers)))
            .options(
                selectinload(Embedding.stock).selectinload(Stock.news),
                selectinload(Embedding.stock).selectinload(Stock.fundamental),
            )
        )

        merged = list(results)

        for embedding, dist in db.execute(stmt).unique().all():
            if embedding.id in existing_ids:
                continue

            merged.append((embedding, 1.0 - float(dist)))
            existing_ids.add(embedding.id)

        return merged

    def _to_retrieved_document(
        self,
        embedding: Embedding,
        score: float,
        *,
        mentioned_tickers: set[str],
        mentioned_companies: set[str],
        is_fundamental_query: bool,
        is_news_query: bool,
    ) -> RetrievedDocument:
        """Map an embedding row and similarity score to a RetrievedDocument."""
        stock = embedding.stock
        chunk_text = embedding.chunk_text

        stock_id = stock.id if stock is not None else None
        company_name = stock.company_name if stock is not None else None
        ticker = stock.ticker if stock is not None else None

        news_id = None
        fundamental_id = None
        title = None
        url = None
        source_type = "company"

        matched_news = None
        if stock is not None:
            for article in stock.news:
                if article.title and article.title in chunk_text:
                    matched_news = article
                    break

        # Prefer fundamental when the chunk contains metric markers. Document
        # chunks often include a trailing news blurb; classifying those as news
        # drops the fundamental bonus on PE/EPS-style queries.
        if self._looks_like_fundamental(chunk_text):
            source_type = "fundamental"
            if stock is not None and stock.fundamental is not None:
                fundamental_id = stock.fundamental.id
        elif matched_news is not None:
            source_type = "news"
            news_id = matched_news.id
            title = matched_news.title
            url = matched_news.url

        ticker_bonus = (
            _TICKER_BONUS
            if self._ticker_match(ticker, mentioned_tickers)
            else 0.0
        )
        company_bonus = (
            _COMPANY_BONUS
            if self._company_match(company_name, mentioned_companies)
            else 0.0
        )
        source_bonus = 0.0
        if is_fundamental_query and source_type == "fundamental":
            source_bonus = _SOURCE_BONUS
        elif is_news_query and source_type == "news":
            source_bonus = _SOURCE_BONUS

        boosted_score = score + ticker_bonus + company_bonus + source_bonus

        logger.info(
            "Rerank %s source=%s cosine=%.4f ticker_bonus=%.2f "
            "company_bonus=%.2f source_bonus=%.2f final=%.4f",
            ticker,
            source_type,
            score,
            ticker_bonus,
            company_bonus,
            source_bonus,
            boosted_score,
        )

        return RetrievedDocument(
            stock_id=stock_id,
            company_name=company_name,
            ticker=ticker,
            source_type=source_type,
            news_id=news_id,
            fundamental_id=fundamental_id,
            title=title,
            url=url,
            chunk_text=chunk_text,
            score=boosted_score,
        )

    def _detect_query_entities(
        self,
        db: Session,
        query: str,
    ) -> tuple[set[str], set[str]]:
        """Detect ticker symbols and company names mentioned in the query."""
        mentioned_tickers: set[str] = set()
        mentioned_companies: set[str] = set()

        tokens = re.findall(r"[A-Za-z][A-Za-z0-9.&-]*", query)

        for token in tokens:
            stock = get_stock_by_ticker(db, token)
            if stock is not None:
                mentioned_tickers.add(stock.ticker.upper())

        query_lower = query.lower()

        for stock in get_all_stocks(db):
            company_name = stock.company_name.strip()
            if len(company_name) < 3:
                continue

            if company_name.lower() in query_lower:
                mentioned_companies.add(company_name.lower())

        return mentioned_tickers, mentioned_companies

    @staticmethod
    def _ticker_match(ticker: str | None, mentioned_tickers: set[str]) -> bool:
        return ticker is not None and ticker.upper() in mentioned_tickers

    @staticmethod
    def _company_match(
        company_name: str | None,
        mentioned_companies: set[str],
    ) -> bool:
        return (
            company_name is not None
            and company_name.lower() in mentioned_companies
        )

    @staticmethod
    def _source_preference(
        source_type: str,
        *,
        is_fundamental_query: bool,
        is_news_query: bool,
    ) -> int:
        if is_fundamental_query and source_type == "fundamental":
            return 1
        if is_news_query and source_type == "news":
            return 1
        return 0

    @staticmethod
    def _is_fundamental_query(query: str) -> bool:
        """Return True when the query asks about fundamental metrics."""
        query_lower = query.lower()

        return any(
            re.search(pattern, query_lower) for pattern in _FUNDAMENTAL_PATTERNS
        )

    @staticmethod
    def _is_news_query(query: str) -> bool:
        """Return True when the query asks about news content."""
        query_lower = query.lower()

        return any(re.search(pattern, query_lower) for pattern in _NEWS_PATTERNS)

    @staticmethod
    def _looks_like_fundamental(chunk_text: str) -> bool:
        """Return True when chunk text appears to describe fundamentals."""
        markers = (
            "Market Cap:",
            "PE Ratio:",
            "Dividend Yield:",
            "Debt to Equity:",
            "Book Value:",
            "EPS:",
            "ROE:",
        )

        return any(marker in chunk_text for marker in markers)
