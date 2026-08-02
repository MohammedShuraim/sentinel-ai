from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.embedding import Embedding
from app.models.stock import Stock
from app.services.embedding_import_service import EmbeddingImportService


class EmbeddingBulkImportService:
    """Imports embeddings for every stock in the database.

    Orchestrates bulk import by loading all stocks and delegating each
    one to ``EmbeddingImportService``.
    """

    def __init__(self, embedding_import_service: EmbeddingImportService):
        """Create the bulk import service with an injected import service."""
        self.embedding_import_service = embedding_import_service

    def import_all(self, db: Session) -> list[Embedding]:
        """Build and store embeddings for every stock.

        Returns every persisted ``Embedding`` across all stocks.
        """
        stocks = list(db.scalars(select(Stock)).all())

        embeddings: list[Embedding] = []

        for stock in stocks:
            embeddings.extend(
                self.embedding_import_service.import_stock(db, stock)
            )

        return embeddings
