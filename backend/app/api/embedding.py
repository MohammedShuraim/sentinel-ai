from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.dependencies import get_db
from app.models.stock import Stock
from app.schemas.embedding import EmbeddingRead
from app.services.document_builder_service import DocumentBuilderService
from app.services.embedding_import_service import EmbeddingImportService
from app.services.embedding_persistence_service import (
    EmbeddingPersistenceService,
)
from app.services.embedding_service import EmbeddingService
from app.services.providers.sentence_transformer_provider import (
    SentenceTransformerProvider,
)
from app.services.text_chunking_service import TextChunkingService

router = APIRouter(
    prefix="/embeddings",
    tags=["Embeddings"],
)


@router.post(
    "/import/{stock_id}",
    response_model=list[EmbeddingRead],
    status_code=status.HTTP_201_CREATED,
)
def import_embeddings(
    stock_id: int,
    db: Session = Depends(get_db),
):
    stock = db.get(Stock, stock_id)

    if stock is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Stock not found",
        )

    document_builder = DocumentBuilderService()
    chunking_service = TextChunkingService()
    embedding_provider = SentenceTransformerProvider()
    embedding_service = EmbeddingService(
        chunking_service,
        embedding_provider,
    )
    embedding_persistence = EmbeddingPersistenceService(embedding_service)
    embedding_import = EmbeddingImportService(
        document_builder,
        embedding_persistence,
    )

    return embedding_import.import_stock(db, stock)
