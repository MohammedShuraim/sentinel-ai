from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.crud.portfolio import (
    create_portfolio,
    delete_portfolio,
    get_portfolio,
    get_user_portfolio,
    update_portfolio,
)
from app.crud.portfolio_summary import get_portfolio_summary
from app.db.dependencies import get_db
from app.models.user import User
from app.schemas.portfolio import PortfolioCreate, PortfolioRead, PortfolioUpdate
from app.schemas.portfolio_summary import PortfolioSummary

router = APIRouter(
    prefix="/portfolio",
    tags=["Portfolio"],
)


@router.post(
    "/",
    response_model=PortfolioRead,
    status_code=status.HTTP_201_CREATED,
)
def add_portfolio(
    portfolio: PortfolioCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db_portfolio = create_portfolio(db, current_user.id, portfolio)

    if db_portfolio is None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Portfolio entry already exists",
        )

    return db_portfolio


@router.get("/", response_model=list[PortfolioRead])
def list_portfolio(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_user_portfolio(db, current_user.id)


@router.get("/summary", response_model=PortfolioSummary)
def read_portfolio_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_portfolio_summary(db, current_user.id)


@router.get("/{portfolio_id}", response_model=PortfolioRead)
def read_portfolio(
    portfolio_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db_portfolio = get_portfolio(db, portfolio_id)

    if db_portfolio is None or db_portfolio.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Portfolio not found.",
        )

    return db_portfolio


@router.patch("/{portfolio_id}", response_model=PortfolioRead)
def edit_portfolio(
    portfolio_id: int,
    portfolio: PortfolioUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db_portfolio = get_portfolio(db, portfolio_id)

    if db_portfolio is None or db_portfolio.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Portfolio not found.",
        )

    db_portfolio = update_portfolio(db, portfolio_id, portfolio)

    if db_portfolio is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Portfolio not found.",
        )

    return db_portfolio


@router.delete("/{portfolio_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_portfolio(
    portfolio_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db_portfolio = get_portfolio(db, portfolio_id)

    if db_portfolio is None or db_portfolio.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Portfolio not found.",
        )

    deleted = delete_portfolio(db, portfolio_id)

    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Portfolio not found.",
        )
