from typing import TypedDict

from sqlalchemy.orm import Session

from app.schemas.retrieved_document import RetrievedDocument


class AgentState(TypedDict):
    """Shared state passed between LangGraph nodes.

    Minimal initial shape for the Sentellent agent. Future phases may
    extend this with memory, sentiment, and tool outputs.
    """

    question: str
    """The original user question."""

    history: str
    """Formatted recent conversation history supplied by ConversationService."""

    profile: str
    """Formatted investor profile supplied by ConversationService."""

    db: Session
    """Request-scoped SQLAlchemy session for retrieval and ticker lookup."""

    context: str
    """The retrieved RAG context."""

    sources: list[RetrievedDocument]
    """Retrieved source documents used to ground the answer."""

    answer: str
    """The final generated answer."""
