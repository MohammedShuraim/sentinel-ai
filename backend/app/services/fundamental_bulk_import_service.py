from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.fundamental import Fundamental
from app.models.stock import Stock
from app.services.fundamental_import_service import FundamentalImportService
from app.services.providers.fundamentals_provider import FundamentalsProvider


class FundamentalBulkImportService:
    """Imports fundamentals for every stock in the database.

    Orchestrates bulk import by loading all stocks and delegating each
    one to ``FundamentalImportService``.
    """

    def __init__(self, provider: FundamentalsProvider):
        """Create the bulk import service for the given provider."""
        self.provider = provider

    def import_all(self, db: Session) -> list[Fundamental]:
        """Fetch and upsert fundamentals for every stock.

        Loads all stocks, runs ``import_fundamentals`` for each, and
        returns the resulting ``Fundamental`` records.
        """
        stocks = list(db.scalars(select(Stock)).all())

        service = FundamentalImportService(self.provider)

        fundamentals: list[Fundamental] = []

        for stock in stocks:
            fundamentals.append(service.import_fundamentals(db, stock))

        return fundamentals
