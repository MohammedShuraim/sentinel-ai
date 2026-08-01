from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.transaction import Transaction
from app.schemas.transaction import TransactionCreate


def create_transaction(
    db: Session,
    user_id: int,
    transaction: TransactionCreate,
) -> Transaction:
    db_transaction = Transaction(
        user_id=user_id,
        stock_id=transaction.stock_id,
        transaction_type=transaction.transaction_type,
        quantity=transaction.quantity,
        price=transaction.price,
    )

    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)

    return db_transaction


def get_transaction(db: Session, transaction_id: int) -> Transaction | None:
    return db.get(Transaction, transaction_id)


def get_user_transactions(db: Session, user_id: int) -> list[Transaction]:
    stmt = (
        select(Transaction)
        .where(Transaction.user_id == user_id)
        .order_by(Transaction.transaction_date.desc())
    )

    return list(db.scalars(stmt).all())


def get_stock_transactions(
    db: Session,
    user_id: int,
    stock_id: int,
) -> list[Transaction]:
    stmt = (
        select(Transaction)
        .where(
            Transaction.user_id == user_id,
            Transaction.stock_id == stock_id,
        )
        .order_by(Transaction.transaction_date.desc())
    )

    return list(db.scalars(stmt).all())
