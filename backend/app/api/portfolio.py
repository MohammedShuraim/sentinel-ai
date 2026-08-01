from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.crud.portfolio import (
    create_portfolio,
    delete_portfolio,
    get_portfolio,
    get_user_portfolio,
    update_portfolio,
)
from app.db.dependencies import get_db
from app.schemas.portfolio import PortfolioCreate, PortfolioRead, PortfolioUpdate

router = APIRouter(
    prefix="/portfolio",
    tags=["Portfolio"],
)

# TODO: replace with the authenticated user once auth is integrated.
USER_ID = 1


@router.post(
    "/",
    response_model=PortfolioRead,
    status_code=status.HTTP_201_CREATED,
)
def add_portfolio(
    portfolio: PortfolioCreate,
    db: Session = Depends(get_db),
):
    db_portfolio = create_portfolio(db, USER_ID, portfolio)

    if db_portfolio is None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Portfolio entry already exists",
        )

    return db_portfolio


@router.get("/", response_model=list[PortfolioRead])
def list_portfolio(
    db: Session = Depends(get_db),
):
    return get_user_portfolio(db, USER_ID)


@router.get("/{portfolio_id}", response_model=PortfolioRead)
def read_portfolio(
    portfolio_id: int,
    db: Session = Depends(get_db),
):
    db_portfolio = get_portfolio(db, portfolio_id)

    if db_portfolio is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Portfolio not found",
        )

    return db_portfolio


@router.patch("/{portfolio_id}", response_model=PortfolioRead)
def edit_portfolio(
    portfolio_id: int,
    portfolio: PortfolioUpdate,
    db: Session = Depends(get_db),
):
    db_portfolio = update_portfolio(db, portfolio_id, portfolio)

    if db_portfolio is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Portfolio not found",
        )

    return db_portfolio


@router.delete("/{portfolio_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_portfolio(
    portfolio_id: int,
    db: Session = Depends(get_db),
):
    deleted = delete_portfolio(db, portfolio_id)

    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Portfolio not found",
        )
