from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.crud.news import create_news, get_news, get_news_by_stock
from app.crud.stock import get_stock_by_ticker
from app.db.dependencies import get_db
from app.schemas.news import NewsCreate, NewsRead

router = APIRouter(
    prefix="/news",
    tags=["News"],
)


@router.get("/", response_model=list[NewsRead])
def list_news(
    db: Session = Depends(get_db),
):
    return get_news(db)


@router.post(
    "/",
    response_model=NewsRead,
    status_code=status.HTTP_201_CREATED,
)
def add_news(
    news: NewsCreate,
    stock_ticker: str,
    db: Session = Depends(get_db),
):
    db_stock = get_stock_by_ticker(db, stock_ticker)

    if db_stock is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Stock not found",
        )

    db_news = create_news(db, db_stock.id, news)

    if db_news is None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="News article already exists",
        )

    return db_news


@router.get("/{ticker}", response_model=list[NewsRead])
def read_news_by_stock(
    ticker: str,
    db: Session = Depends(get_db),
):
    db_stock = get_stock_by_ticker(db, ticker)

    if db_stock is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Stock not found",
        )

    return get_news_by_stock(db, db_stock.id)
