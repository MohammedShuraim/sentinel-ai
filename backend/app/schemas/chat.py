from datetime import datetime

from pydantic import BaseModel

from app.schemas.retrieved_document import RetrievedDocument


class ChatRequest(BaseModel):
    """User chat request for the AI stock analyst agent.

    If ``conversation_id`` is ``None``, the user's latest conversation is
    continued (or a new one is created when none exists).
    Otherwise the existing conversation is continued.
    """

    question: str
    conversation_id: int | None = None


class ChatResponse(BaseModel):
    """Assistant response with the conversation identifier to reuse."""

    conversation_id: int
    answer: str
    sources: list[RetrievedDocument]


class ChatMessageRead(BaseModel):
    """Persisted chat message for history hydration."""

    id: int
    role: str
    content: str
    created_at: datetime

    model_config = {"from_attributes": True}


class ActiveConversationResponse(BaseModel):
    """The user's ongoing conversation, or empty when none exists yet."""

    conversation_id: int | None
    messages: list[ChatMessageRead]
