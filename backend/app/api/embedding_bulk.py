from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.db.dependencies import get_db
from app.schemas.embedding import EmbeddingRead
from app.services.document_builder_service import DocumentBuilderService
from app.services.embedding_bulk_import_service import (
    EmbeddingBulkImportService,
)
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
    "/import-all",
    response_model=list[EmbeddingRead],
    status_code=status.HTTP_201_CREATED,
)
def import_all_embeddings(
    db: Session = Depends(get_db),
):
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
    service = EmbeddingBulkImportService(embedding_import)

    return service.import_all(db)
