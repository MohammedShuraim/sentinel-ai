from pydantic import BaseModel

from app.schemas.retrieved_document import RetrievedDocument


class ChatRequest(BaseModel):
    """User chat request for the AI stock analyst agent.

    If ``conversation_id`` is ``None``, a new conversation is created.
    Otherwise the existing conversation is continued.
    """

    question: str
    conversation_id: int | None = None


class ChatResponse(BaseModel):
    """Assistant response with the conversation identifier to reuse."""

    conversation_id: int
    answer: str
    sources: list[RetrievedDocument]
