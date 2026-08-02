from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import embedding_provider, llm_service
from app.crud.news import create_news, get_news, get_news_by_stock
from app.crud.stock import get_stock_by_ticker
from app.db.dependencies import get_db
from app.schemas.news import NewsCreate, NewsRead
from app.services.document_builder_service import DocumentBuilderService
from app.services.embedding_import_service import EmbeddingImportService
from app.services.embedding_persistence_service import (
    EmbeddingPersistenceService,
)
from app.services.embedding_service import EmbeddingService
from app.services.news_analysis_service import NewsAnalysisService
from app.services.news_import_service import NewsImportService
from app.services.providers.marketaux_provider import MarketauxProvider
from app.services.stock_sentiment_service import StockSentimentService
from app.services.text_chunking_service import TextChunkingService

router = APIRouter(
    prefix="/news",
    tags=["News"],
)


def _build_embedding_import_service() -> EmbeddingImportService:
    document_builder = DocumentBuilderService()
    chunking_service = TextChunkingService()
    embedding_service = EmbeddingService(
        chunking_service,
        embedding_provider,
    )
    embedding_persistence = EmbeddingPersistenceService(embedding_service)

    return EmbeddingImportService(
        document_builder,
        embedding_persistence,
    )


@router.get("/", response_model=list[NewsRead])
def list_news(
    db: Session = Depends(get_db),
):
    return get_news(db)


@router.post(
    "/",
    response_model=NewsRead,
    status_code=status.HTTP_201_CREATED,
)
def add_news(
    news: NewsCreate,
    stock_ticker: str,
    db: Session = Depends(get_db),
):
    db_stock = get_stock_by_ticker(db, stock_ticker)

    if db_stock is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Stock not found",
        )

    db_news = create_news(db, db_stock.id, news)

    if db_news is None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="News article already exists",
        )

    return db_news


@router.post("/import")
def import_news_from_provider(
    db: Session = Depends(get_db),
):
    provider = MarketauxProvider()
    news_analysis_service = NewsAnalysisService(llm_service)
    stock_sentiment_service = StockSentimentService()
    embedding_import_service = _build_embedding_import_service()
    service = NewsImportService(
        provider,
        news_analysis_service,
        stock_sentiment_service,
        embedding_import_service,
    )

    inserted = service.import_news(db)

    return {"inserted": inserted}


@router.get("/{ticker}", response_model=list[NewsRead])
def read_news_by_stock(
    ticker: str,
    db: Session = Depends(get_db),
):
    db_stock = get_stock_by_ticker(db, ticker)

    if db_stock is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Stock not found",
        )

    return get_news_by_stock(db, db_stock.id)
