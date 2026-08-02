import hashlib
import logging

from sqlalchemy.orm import Session

from app.crud.embedding import (
    delete_embeddings_for_stock,
    get_embeddings_for_stock,
)
from app.crud.embedding_metadata import (
    create_or_update_embedding_metadata,
    get_embedding_metadata,
)
from app.models.embedding import Embedding
from app.models.stock import Stock
from app.services.document_builder_service import DocumentBuilderService
from app.services.embedding_persistence_service import (
    EmbeddingPersistenceService,
)

logger = logging.getLogger(__name__)


class EmbeddingImportService:
    """Builds a stock document and persists its chunk embeddings.

    Orchestrates ``DocumentBuilderService`` and
    ``EmbeddingPersistenceService``. Skips regeneration when the
    document hash is unchanged. Performs no similarity search, LLM
    calls, or prompt generation.
    """

    def __init__(
        self,
        document_builder: DocumentBuilderService,
        embedding_persistence: EmbeddingPersistenceService,
    ):
        """Create the import service with injected dependencies."""
        self.document_builder = document_builder
        self.embedding_persistence = embedding_persistence

    def import_stock(
        self,
        db: Session,
        stock: Stock,
    ) -> list[Embedding]:
        """Build and store embeddings for a single stock."""
        fundamental = stock.fundamental
        # Relationship order is undefined unless ordered; sort for stable hashes.
        news = sorted(
            list(stock.news),
            key=lambda article: (
                article.published_at,
                article.id,
            ),
        )

        document = self.document_builder.build_document(
            stock,
            fundamental,
            news,
        )
        document_hash = hashlib.sha256(document.encode("utf-8")).hexdigest()

        metadata = get_embedding_metadata(db, stock.id)

        if metadata is not None and metadata.document_hash == document_hash:
            logger.info(
                "Document unchanged; skipping embedding regeneration."
            )
            return get_embeddings_for_stock(db, stock.id)

        logger.info("Document changed; regenerating embeddings.")

        delete_embeddings_for_stock(db, stock.id)

        embeddings = self.embedding_persistence.store_document(
            db,
            stock.id,
            document,
        )

        create_or_update_embedding_metadata(
            db,
            stock.id,
            document_hash,
        )

        return embeddings
