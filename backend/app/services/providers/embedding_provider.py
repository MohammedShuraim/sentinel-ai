class EmbeddingProvider:
    """Abstract provider interface for text embeddings.

    Concrete implementations (Sentence Transformers, OpenAI, Gemini, etc.)
    are responsible only for generating embeddings. They perform:

    - no chunking
    - no database access
    - no vector storage
    - no retrieval
    - no AI reasoning

    Those responsibilities belong to other layers. Callers are expected
    to pass already-prepared text and handle persistence separately.
    """

    def embed(self, text: str) -> list[float]:
        """Generate a vector embedding for a single text string.

        Returns the embedding as a ``list[float]``.
        """
        raise NotImplementedError
