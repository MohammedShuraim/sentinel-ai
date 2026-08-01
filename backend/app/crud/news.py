from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.news import News
from app.schemas.news import NewsCreate


def create_news(db: Session, stock_id: int, news: NewsCreate) -> News | None:
    if get_news_by_url(db, news.url) is not None:
        return None

    db_news = News(
        stock_id=stock_id,
        title=news.title,
        content=news.content,
        url=news.url,
        source=news.source,
        published_at=news.published_at,
    )

    db.add(db_news)
    db.commit()
    db.refresh(db_news)

    return db_news


def get_news(db: Session) -> list[News]:
    stmt = select(News).order_by(News.published_at.desc())

    return list(db.scalars(stmt).all())


def get_news_by_stock(db: Session, stock_id: int) -> list[News]:
    stmt = (
        select(News)
        .where(News.stock_id == stock_id)
        .order_by(News.published_at.desc())
    )

    return list(db.scalars(stmt).all())


def get_latest_news(db: Session, limit: int = 20) -> list[News]:
    stmt = select(News).order_by(News.published_at.desc()).limit(limit)

    return list(db.scalars(stmt).all())


def get_news_by_url(db: Session, url: str) -> News | None:
    stmt = select(News).where(News.url == url)

    return db.scalars(stmt).first()


def delete_news(db: Session, news_id: int) -> bool:
    db_news = db.get(News, news_id)

    if db_news is None:
        return False

    db.delete(db_news)
    db.commit()

    return True
