from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.models.embedding import Embedding
from app.models.stock import Stock


def search_similar_embeddings(
    db: Session,
    query_embedding: list[float],
    limit: int = 5,
) -> list[tuple[Embedding, float]]:
    distance = Embedding.embedding.cosine_distance(query_embedding)

    stmt = (
        select(Embedding, distance)
        .options(
            selectinload(Embedding.stock).selectinload(Stock.news),
            selectinload(Embedding.stock).selectinload(Stock.fundamental),
        )
        .order_by(distance)
        .limit(limit)
    )

    rows = db.execute(stmt).unique().all()

    return [
        (embedding, 1.0 - float(dist))
        for embedding, dist in rows
    ]
