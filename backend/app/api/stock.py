from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.admin_gate import require_data_imports_enabled
from app.crud.stock import (
    create_stock,
    get_all_stocks,
    get_stock_by_ticker,
    search_stocks,
)
from app.db.dependencies import get_db
from app.schemas.stock import StockCreate, StockRead
from app.services.stock_import_service import StockImportService

# backend/app/api/stock.py -> parents[2] == backend project root
BASE_DIR = Path(__file__).resolve().parents[2]
NSE_STOCKS_CSV = BASE_DIR / "data" / "nse_stocks.csv"

router = APIRouter(
    prefix="/stocks",
    tags=["Stock Master"],
)


@router.get("/", response_model=list[StockRead])
def list_stocks(
    db: Session = Depends(get_db),
):
    return get_all_stocks(db)


@router.get("/search", response_model=list[StockRead])
def search(
    q: str = "",
    db: Session = Depends(get_db),
):
    return search_stocks(db, q)


@router.post("/import")
def import_stocks_from_csv(
    db: Session = Depends(get_db),
    _: None = Depends(require_data_imports_enabled),
):
    service = StockImportService()
    inserted = service.import_stocks(db, str(NSE_STOCKS_CSV))

    return {"inserted": inserted}


@router.get("/{ticker}", response_model=StockRead)
def read_stock(
    ticker: str,
    db: Session = Depends(get_db),
):
    db_stock = get_stock_by_ticker(db, ticker)

    if db_stock is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Stock not found",
        )

    return db_stock


@router.post(
    "/",
    response_model=StockRead,
    status_code=status.HTTP_201_CREATED,
)
def add_stock(
    stock: StockCreate,
    db: Session = Depends(get_db),
    _: None = Depends(require_data_imports_enabled),
):
    db_stock = create_stock(db, stock)

    if db_stock is None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ticker already exists",
        )

    return db_stock
