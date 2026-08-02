from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.embedding_metadata import EmbeddingMetadata


def get_embedding_metadata(
    db: Session,
    stock_id: int,
) -> EmbeddingMetadata | None:
    stmt = select(EmbeddingMetadata).where(
        EmbeddingMetadata.stock_id == stock_id,
    )

    return db.scalars(stmt).first()


def create_or_update_embedding_metadata(
    db: Session,
    stock_id: int,
    document_hash: str,
) -> EmbeddingMetadata:
    db_metadata = get_embedding_metadata(db, stock_id)

    if db_metadata is not None:
        db_metadata.document_hash = document_hash
    else:
        db_metadata = EmbeddingMetadata(
            stock_id=stock_id,
            document_hash=document_hash,
        )
        db.add(db_metadata)

    db.commit()
    db.refresh(db_metadata)

    return db_metadata


def delete_embedding_metadata(
    db: Session,
    stock_id: int,
) -> bool:
    db_metadata = get_embedding_metadata(db, stock_id)

    if db_metadata is None:
        return False

    db.delete(db_metadata)
    db.commit()

    return True
