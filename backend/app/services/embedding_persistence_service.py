from sqlalchemy.orm import Session

from app.crud.embedding import create_embedding
from app.models.embedding import Embedding
from app.services.embedding_service import EmbeddingService


class EmbeddingPersistenceService:
    """Persists chunk embeddings produced by ``EmbeddingService``.

    Orchestrates embedding generation and CRUD persistence. Performs no
    retrieval, similarity search, or AI reasoning.
    """

    def __init__(self, embedding_service: EmbeddingService):
        """Create the persistence service with an injected embedding service."""
        self.embedding_service = embedding_service

    def store_document(
        self,
        db: Session,
        stock_id: int,
        document: str,
    ) -> list[Embedding]:
        """Embed a document and store every chunk embedding.

        Returns the persisted ``Embedding`` records in chunk order.
        """
        chunk_embeddings = self.embedding_service.embed_document(document)

        embeddings: list[Embedding] = []

        for chunk_index, (chunk_text, embedding) in enumerate(chunk_embeddings):
            db_embedding = create_embedding(
                db,
                stock_id,
                chunk_index,
                chunk_text,
                embedding,
            )
            embeddings.append(db_embedding)

        return embeddings
