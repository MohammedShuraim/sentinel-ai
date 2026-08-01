from app.models.fundamental import Fundamental
from app.models.news import News
from app.models.stock import Stock


class DocumentBuilderService:
    """Builds plain-text company documents from stock context.

    Combines stock profile, fundamentals, and recent news into a single
    string suitable for downstream embedding or retrieval. Performs no
    database access, embedding, or AI inference.
    """

    def build_document(
        self,
        stock: Stock,
        fundamental: Fundamental | None,
        news: list[News],
    ) -> str:
        """Build one plain-text document describing the company."""
        lines = [
            "Company:",
            stock.company_name,
            "",
            "Ticker:",
            stock.ticker,
            "",
            "Exchange:",
            stock.exchange,
            "",
            "Sector:",
            stock.sector,
            "",
            "Industry:",
            stock.industry,
            "",
            "Fundamentals",
            "",
        ]

        if fundamental is None:
            lines.append("Not available")
        else:
            lines.extend(
                [
                    f"Market Cap: {self._format_value(fundamental.market_cap)}",
                    "",
                    f"PE Ratio: {self._format_value(fundamental.pe_ratio)}",
                    "",
                    f"EPS: {self._format_value(fundamental.eps)}",
                    "",
                    f"ROE: {self._format_value(fundamental.roe)}",
                    "",
                    f"Debt to Equity: {self._format_value(fundamental.debt_to_equity)}",
                    "",
                    f"Book Value: {self._format_value(fundamental.book_value)}",
                    "",
                    f"Dividend Yield: {self._format_value(fundamental.dividend_yield)}",
                ]
            )

        lines.extend(
            [
                "",
                "Recent News",
                "",
            ]
        )

        if not news:
            lines.append("No recent news available.")
        else:
            for index, article in enumerate(news):
                if index > 0:
                    lines.append("")

                lines.extend(
                    [
                        "Title:",
                        article.title,
                        "",
                        "Summary:",
                        article.content,
                    ]
                )

        return "\n".join(lines)

    @staticmethod
    def _format_value(value: float | None) -> str:
        if value is None:
            return "N/A"

        return str(value)
