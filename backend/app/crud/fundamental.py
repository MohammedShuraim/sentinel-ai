from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.fundamental import Fundamental
from app.schemas.fundamental import FundamentalCreate


def create_or_update_fundamental(
    db: Session,
    fundamental: FundamentalCreate,
) -> Fundamental:
    db_fundamental = get_fundamental(db, fundamental.stock_id)

    if db_fundamental is not None:
        updates = fundamental.model_dump(exclude={"stock_id"})

        for field, value in updates.items():
            setattr(db_fundamental, field, value)
    else:
        db_fundamental = Fundamental(**fundamental.model_dump())

        db.add(db_fundamental)

    db.commit()
    db.refresh(db_fundamental)

    return db_fundamental


def get_fundamental(db: Session, stock_id: int) -> Fundamental | None:
    stmt = select(Fundamental).where(Fundamental.stock_id == stock_id)

    return db.scalars(stmt).first()
