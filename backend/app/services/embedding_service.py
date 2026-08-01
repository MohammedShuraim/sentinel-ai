from app.services.providers.embedding_provider import EmbeddingProvider
from app.services.text_chunking_service import TextChunkingService


class EmbeddingService:
    """Orchestrates document chunking and embedding generation.

    Combines ``TextChunkingService`` and an ``EmbeddingProvider`` to
    produce ``(chunk, embedding)`` pairs. Performs no database access,
    vector storage, retrieval, or AI inference.
    """

    def __init__(
        self,
        chunking_service: TextChunkingService,
        embedding_provider: EmbeddingProvider,
    ):
        """Create the embedding service with injected dependencies."""
        self.chunking_service = chunking_service
        self.embedding_provider = embedding_provider

    def embed_document(
        self,
        document: str,
    ) -> list[tuple[str, list[float]]]:
        """Chunk a document and embed each chunk.

        Returns a list of ``(chunk, embedding)`` tuples in chunk order.
        """
        chunks = self.chunking_service.chunk_document(document)

        return [
            (chunk, self.embedding_provider.embed(chunk))
            for chunk in chunks
        ]
