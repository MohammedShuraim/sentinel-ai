class TextChunkingService:
    """Splits plain-text documents into overlapping character chunks.

    Uses pure Python character slicing only — no external chunking
    libraries. Suitable for preparing documents for embedding.
    """

    def chunk_document(
        self,
        document: str,
        chunk_size: int = 500,
        overlap: int = 100,
    ) -> list[str]:
        """Split ``document`` into overlapping character-based chunks.

        If the document fits in one chunk, returns a single-element list.
        Otherwise returns chunks of at most ``chunk_size`` characters,
        each starting ``chunk_size - overlap`` characters after the
        previous chunk's start.
        """
        if len(document) <= chunk_size:
            return [document]

        step = chunk_size - overlap
        chunks: list[str] = []
        start = 0

        while start < len(document):
            end = start + chunk_size
            chunks.append(document[start:end])

            if end >= len(document):
                break

            start += step

        return chunks
