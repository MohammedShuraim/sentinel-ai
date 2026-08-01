from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.crud.stock import get_stock_by_ticker
from app.crud.stock_follow import follow_stock, get_followed_stocks, unfollow_stock
from app.db.dependencies import get_db
from app.models.stock_follow import StockFollow
from app.models.user import User
from app.schemas.stock_follow import StockFollowCreate, StockFollowRead

router = APIRouter(
    prefix="/stocks",
    tags=["Stocks"],
)


def _serialize_follow(follow: StockFollow) -> dict:
    return {
        "id": follow.id,
        "ticker": follow.stock.ticker,
        "created_at": follow.created_at,
    }


@router.post(
    "/follow",
    response_model=StockFollowRead,
    status_code=status.HTTP_201_CREATED,
)
def follow(
    stock: StockFollowCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if get_stock_by_ticker(db, stock.ticker) is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Stock not found",
        )

    db_follow = follow_stock(db, current_user.id, stock)

    if db_follow is None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Stock already followed",
        )

    return _serialize_follow(db_follow)


@router.get("/my-stocks", response_model=list[StockFollowRead])
def my_stocks(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    follows = get_followed_stocks(db, current_user.id)

    return [_serialize_follow(follow) for follow in follows]


@router.delete("/unfollow/{ticker}")
def unfollow(
    ticker: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    deleted = unfollow_stock(db, current_user.id, ticker)

    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Stock not followed",
        )

    return {"message": "Stock unfollowed successfully"}
