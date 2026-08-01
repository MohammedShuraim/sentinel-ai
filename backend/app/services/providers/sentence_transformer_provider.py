from sentence_transformers import SentenceTransformer

from app.services.providers.embedding_provider import EmbeddingProvider


class SentenceTransformerProvider(EmbeddingProvider):
    """Local embedding provider powered by Sentence Transformers.

    Loads ``all-MiniLM-L6-v2`` once at construction time and generates
    embeddings for individual text strings. Performs no chunking,
    database access, vector storage, or retrieval.
    """

    def __init__(self):
        """Load the Sentence Transformer model exactly once."""
        self.model = SentenceTransformer("all-MiniLM-L6-v2")

    def embed(self, text: str) -> list[float]:
        """Generate a vector embedding for a single text string.

        Returns the embedding as a ``list[float]``.
        """
        vector = self.model.encode(
            text,
            convert_to_numpy=True,
        )

        return vector.tolist()
