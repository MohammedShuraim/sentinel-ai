from sqlalchemy.orm import Session

from app.crud.fundamental import create_or_update_fundamental
from app.models.fundamental import Fundamental
from app.models.stock import Stock
from app.schemas.fundamental import FundamentalCreate
from app.services.providers.fundamentals_provider import FundamentalsProvider


class FundamentalImportService:
    """Imports company fundamentals into the database.

    Orchestrates the import pipeline: fetching fundamentals from an
    external provider and persisting them through the CRUD layer.
    """

    def __init__(self, provider: FundamentalsProvider):
        """Create the fundamentals import service for the given provider.

        Any object exposing a ``fetch_fundamentals()`` method returning a
        dictionary compatible with ``FundamentalCreate`` is accepted, so
        providers can be swapped without changing the pipeline.
        """
        self.provider = provider

    def import_fundamentals(
        self,
        db: Session,
        stock: Stock,
    ) -> Fundamental:
        """Fetch and upsert fundamentals for a single stock.

        Calls the configured provider, builds a ``FundamentalCreate``
        payload, and persists it via ``create_or_update_fundamental``.
        Returns the resulting ``Fundamental`` record.
        """
        provider_data = self.provider.fetch_fundamentals(stock.ticker)

        fundamental = FundamentalCreate(
            stock_id=stock.id,
            **provider_data,
        )

        return create_or_update_fundamental(db, fundamental)
