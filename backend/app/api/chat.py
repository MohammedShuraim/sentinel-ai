import json
import logging
from collections.abc import Iterator

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.core.dependencies import get_conversation_service
from app.db.dependencies import get_db
from app.models.user import User
from app.schemas.chat import ActiveConversationResponse, ChatRequest, ChatResponse
from app.services.conversation_service import (
    ConversationNotFoundError,
    ConversationService,
)

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/chat",
    tags=["Chat"],
)


@router.get(
    "/active",
    response_model=ActiveConversationResponse,
    status_code=status.HTTP_200_OK,
)
def get_active_conversation(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    conversation_service: ConversationService = Depends(get_conversation_service),
):
    """Return the current user's ongoing conversation with full message history."""
    return conversation_service.get_active_conversation(
        db=db,
        user_id=current_user.id,
    )


@router.post(
    "/",
    response_model=ChatResponse,
    status_code=status.HTTP_200_OK,
)
def chat(
    request: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    conversation_service: ConversationService = Depends(get_conversation_service),
):
    try:
        conversation_id, answer, sources = conversation_service.chat(
            db=db,
            user_id=current_user.id,
            question=request.question,
            conversation_id=request.conversation_id,
        )
    except ConversationNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found.",
        )

    return ChatResponse(
        conversation_id=conversation_id,
        answer=answer,
        sources=sources,
    )


@router.post("/stream")
def chat_stream(
    request: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    conversation_service: ConversationService = Depends(get_conversation_service),
):
    """Stream an assistant reply as Server-Sent Events (text/event-stream).

    Event payload types:
    - start: ``{type, conversation_id}``
    - token: ``{type, delta}``
    - done: ``{type, conversation_id, answer, sources}``
    - error: ``{type, detail}``
    """

    def event_generator() -> Iterator[str]:
        try:
            events = conversation_service.chat_stream(
                db=db,
                user_id=current_user.id,
                question=request.question,
                conversation_id=request.conversation_id,
            )
            for event in events:
                yield f"data: {json.dumps(event, default=str)}\n\n"
        except ConversationNotFoundError:
            payload = {
                "type": "error",
                "detail": "Conversation not found.",
            }
            yield f"data: {json.dumps(payload)}\n\n"
        except Exception:
            logger.exception("Unhandled chat stream failure")
            payload = {
                "type": "error",
                "detail": "The AI service is temporarily unavailable.",
            }
            yield f"data: {json.dumps(payload)}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
