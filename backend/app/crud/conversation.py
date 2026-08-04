from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.conversation import Conversation


def create_conversation(
    db: Session,
    user_id: int,
    title: str | None = None,
) -> Conversation:
    db_conversation = Conversation(
        user_id=user_id,
        title=title,
    )

    db.add(db_conversation)
    db.commit()
    db.refresh(db_conversation)

    return db_conversation


def get_conversation(
    db: Session,
    conversation_id: int,
) -> Conversation | None:
    return db.get(Conversation, conversation_id)


def get_user_conversations(
    db: Session,
    user_id: int,
) -> list[Conversation]:
    stmt = (
        select(Conversation)
        .where(Conversation.user_id == user_id)
        .order_by(Conversation.updated_at.desc(), Conversation.id.desc())
    )

    return list(db.scalars(stmt).all())


def get_latest_user_conversation(
    db: Session,
    user_id: int,
) -> Conversation | None:
    """Return the user's most recently updated conversation, if any."""
    stmt = (
        select(Conversation)
        .where(Conversation.user_id == user_id)
        .order_by(Conversation.updated_at.desc(), Conversation.id.desc())
        .limit(1)
    )

    return db.scalars(stmt).first()


def get_user_conversation(
    db: Session,
    user_id: int,
    conversation_id: int,
) -> Conversation | None:
    stmt = select(Conversation).where(
        Conversation.id == conversation_id,
        Conversation.user_id == user_id,
    )

    return db.scalars(stmt).first()
