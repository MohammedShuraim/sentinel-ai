import csv

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.stock import Stock


class StockImportService:
    """Imports the NSE stock master list from a CSV file into the database.

    Orchestrates the full import pipeline: loading the raw CSV file,
    validating and normalizing its rows, and bulk-inserting the resulting
    records into the stocks table.
    """

    REQUIRED_FIELDS = (
        "ticker",
        "company_name",
        "exchange",
        "sector",
        "industry",
    )

    def load_csv(self, file_path: str) -> list[dict]:
        """Read the CSV file at ``file_path`` and return its rows.

        Parses the file into a list of dictionaries keyed by column name,
        without applying any validation or normalization. Raises
        ``FileNotFoundError`` if the file does not exist.
        """
        with open(file_path, encoding="utf-8", newline="") as csv_file:
            return list(csv.DictReader(csv_file))

    def validate_rows(self, rows: list[dict]) -> list[dict]:
        """Validate and normalize raw CSV rows.

        Trims whitespace from every string field, normalizes tickers
        (strip and uppercase), and skips rows with missing or empty
        required fields. Duplicate tickers within the same CSV are
        dropped, keeping the first occurrence. Returns only the rows
        that are safe to insert.
        """
        valid_rows: list[dict] = []
        seen_tickers: set[str] = set()

        for row in rows:
            cleaned = {
                key: value.strip() if isinstance(value, str) else value
                for key, value in row.items()
            }

            if any(not cleaned.get(field) for field in self.REQUIRED_FIELDS):
                continue

            cleaned["ticker"] = cleaned["ticker"].upper()

            if cleaned["ticker"] in seen_tickers:
                continue

            seen_tickers.add(cleaned["ticker"])
            valid_rows.append(cleaned)

        return valid_rows

    def bulk_insert(self, db: Session, rows: list[dict]) -> int:
        """Insert validated rows into the stocks table in bulk.

        Fetches all existing tickers with a single query, skips rows
        whose ticker is already in the database, inserts the remaining
        rows in one transaction, and returns the number of records
        inserted.
        """
        existing_tickers = set(db.scalars(select(Stock.ticker)).all())

        new_stocks = [
            Stock(
                ticker=row["ticker"],
                company_name=row["company_name"],
                exchange=row["exchange"],
                sector=row["sector"],
                industry=row["industry"],
            )
            for row in rows
            if row["ticker"] not in existing_tickers
        ]

        if not new_stocks:
            return 0

        db.add_all(new_stocks)
        db.commit()

        return len(new_stocks)

    def import_stocks(self, db: Session, file_path: str) -> int:
        """Run the full import pipeline for the given CSV file.

        Chains ``load_csv`` -> ``validate_rows`` -> ``bulk_insert``
        and returns the number of stocks imported.
        """
        rows = self.load_csv(file_path)
        valid_rows = self.validate_rows(rows)

        return self.bulk_insert(db, valid_rows)