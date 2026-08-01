from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.dependencies import get_db
from app.models.stock import Stock
from app.schemas.fundamental import FundamentalRead
from app.services.fundamental_import_service import FundamentalImportService
from app.services.providers.yahoo_finance_provider import YahooFinanceProvider

router = APIRouter(
    prefix="/fundamentals",
    tags=["Fundamentals"],
)


@router.post(
    "/import/{stock_id}",
    response_model=FundamentalRead,
    status_code=status.HTTP_201_CREATED,
)
def import_fundamentals(
    stock_id: int,
    db: Session = Depends(get_db),
):
    stock = db.get(Stock, stock_id)

    if stock is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Stock not found",
        )

    provider = YahooFinanceProvider()
    service = FundamentalImportService(provider)

    return service.import_fundamentals(db, stock)
