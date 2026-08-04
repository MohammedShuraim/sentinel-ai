from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.conversation import Conversation
from app.models.message import Message


def create_message(
    db: Session,
    conversation_id: int,
    role: str,
    content: str,
) -> Message:
    db_message = Message(
        conversation_id=conversation_id,
        role=role,
        content=content,
    )

    db.add(db_message)

    conversation = db.get(Conversation, conversation_id)
    if conversation is not None:
        conversation.updated_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(db_message)

    return db_message


def get_messages(
    db: Session,
    conversation_id: int,
) -> list[Message]:
    stmt = (
        select(Message)
        .where(Message.conversation_id == conversation_id)
        .order_by(Message.created_at.asc())
    )

    return list(db.scalars(stmt).all())


def get_recent_messages(
    db: Session,
    conversation_id: int,
    limit: int = 10,
) -> list[Message]:
    stmt = (
        select(Message)
        .where(Message.conversation_id == conversation_id)
        .order_by(Message.created_at.desc())
        .limit(limit)
    )

    messages = list(db.scalars(stmt).all())
    messages.reverse()

    return messages
