class FundamentalsProvider:
    """Abstract provider interface for company fundamentals.

    Concrete implementations are responsible only for communicating with
    an external data source. They perform no validation, normalization,
    or persistence — callers are expected to map the returned dictionary
    into the fundamentals import pipeline.
    """

    def fetch_fundamentals(self, ticker: str) -> dict:
        """Fetch company fundamentals for a single stock.

        Returns a dictionary compatible with
        FundamentalCreate.
        """
        raise NotImplementedError
