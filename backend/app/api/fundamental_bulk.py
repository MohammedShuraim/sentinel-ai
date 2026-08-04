from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.admin_gate import require_data_imports_enabled
from app.db.dependencies import get_db
from app.schemas.fundamental import FundamentalRead
from app.services.fundamental_bulk_import_service import (
    FundamentalBulkImportService,
)
from app.services.providers.yahoo_finance_provider import YahooFinanceProvider

router = APIRouter(
    prefix="/fundamentals",
    tags=["Fundamentals"],
)


@router.post(
    "/import-all",
    response_model=list[FundamentalRead],
    status_code=status.HTTP_201_CREATED,
)
def import_all_fundamentals(
    db: Session = Depends(get_db),
    _: None = Depends(require_data_imports_enabled),
):
    provider = YahooFinanceProvider()
    service = FundamentalBulkImportService(provider)

    return service.import_all(db)
