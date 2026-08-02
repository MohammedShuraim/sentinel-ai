from sqlalchemy.orm import Session

from app.schemas.retrieved_document import RetrievedDocument
from app.services.retriever_service import RetrieverService


class RAGService:
    """Assembles retrieved chunks into a single RAG context string.

    Delegates retrieval to ``RetrieverService`` and joins the resulting
    chunk texts. Performs no LLM calls, prompt engineering, or AI
    reasoning.
    """

    def __init__(self, retriever: RetrieverService):
        """Create the RAG service with an injected retriever."""
        self.retriever = retriever

    def retrieve_documents(
        self,
        db: Session,
        query: str,
        limit: int = 5,
    ) -> list[RetrievedDocument]:
        """Retrieve similar chunks with source metadata."""
        return self.retriever.retrieve(db, query, limit)

    def retrieve_context(
        self,
        db: Session,
        query: str,
        limit: int = 5,
    ) -> str:
        """Retrieve similar chunks and join them into one context string."""
        documents = self.retrieve_documents(db, query, limit)

        return "\n\n".join(document.chunk_text for document in documents)
