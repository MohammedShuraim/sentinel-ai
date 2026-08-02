import math

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.crud.portfolio import (
    create_portfolio,
    delete_portfolio,
    get_portfolio_by_stock,
    update_portfolio,
)
from app.crud.transaction import (
    create_transaction,
    get_stock_transactions,
    get_user_transactions,
)
from app.db.dependencies import get_db
from app.models.user import User
from app.schemas.portfolio import PortfolioCreate, PortfolioUpdate
from app.schemas.transaction import TransactionCreate, TransactionRead

router = APIRouter(
    prefix="/transactions",
    tags=["Transactions"],
)


@router.post(
    "/buy",
    response_model=TransactionRead,
    status_code=status.HTTP_201_CREATED,
)
def buy_stock(
    transaction: TransactionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if transaction.transaction_type != "BUY":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="transaction_type must be BUY",
        )

    db_transaction = create_transaction(db, current_user.id, transaction)

    db_portfolio = get_portfolio_by_stock(
        db,
        current_user.id,
        transaction.stock_id,
    )

    if db_portfolio is None:
        create_portfolio(
            db,
            current_user.id,
            PortfolioCreate(
                stock_id=transaction.stock_id,
                quantity=transaction.quantity,
                average_price=transaction.price,
            ),
        )
    else:
        new_quantity = db_portfolio.quantity + transaction.quantity
        new_average_price = (
            db_portfolio.quantity * db_portfolio.average_price
            + transaction.quantity * transaction.price
        ) / new_quantity

        update_portfolio(
            db,
            db_portfolio.id,
            PortfolioUpdate(
                quantity=new_quantity,
                average_price=new_average_price,
            ),
        )

    return db_transaction


@router.post(
    "/sell",
    response_model=TransactionRead,
    status_code=status.HTTP_201_CREATED,
)
def sell_stock(
    transaction: TransactionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if transaction.transaction_type != "SELL":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="transaction_type must be SELL",
        )

    db_portfolio = get_portfolio_by_stock(
        db,
        current_user.id,
        transaction.stock_id,
    )

    if db_portfolio is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Portfolio not found",
        )

    if transaction.quantity > db_portfolio.quantity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Insufficient shares",
        )

    db_transaction = create_transaction(db, current_user.id, transaction)

    new_quantity = db_portfolio.quantity - transaction.quantity

    if math.isclose(new_quantity, 0.0, abs_tol=1e-9):
        delete_portfolio(db, db_portfolio.id)
    else:
        update_portfolio(
            db,
            db_portfolio.id,
            PortfolioUpdate(quantity=new_quantity),
        )

    return db_transaction


@router.get("/", response_model=list[TransactionRead])
def list_transactions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_user_transactions(db, current_user.id)


@router.get("/stock/{stock_id}", response_model=list[TransactionRead])
def list_stock_transactions(
    stock_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_stock_transactions(db, current_user.id, stock_id)
