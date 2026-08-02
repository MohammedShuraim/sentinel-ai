from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.models.embedding import Embedding


def create_embedding(
    db: Session,
    stock_id: int,
    chunk_index: int,
    chunk_text: str,
    embedding: list[float],
) -> Embedding:
    db_embedding = Embedding(
        stock_id=stock_id,
        chunk_index=chunk_index,
        chunk_text=chunk_text,
        embedding=embedding,
    )

    db.add(db_embedding)
    db.commit()
    db.refresh(db_embedding)

    return db_embedding


def get_embeddings_for_stock(db: Session, stock_id: int) -> list[Embedding]:
    stmt = (
        select(Embedding)
        .where(Embedding.stock_id == stock_id)
        .order_by(Embedding.chunk_index.asc())
    )

    return list(db.scalars(stmt).all())


def delete_embeddings_for_stock(db: Session, stock_id: int) -> None:
    stmt = delete(Embedding).where(Embedding.stock_id == stock_id)

    db.execute(stmt)
    db.commit()
