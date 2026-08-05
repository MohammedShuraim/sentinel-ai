from app.models.investor_profile import InvestorProfile
from app.models.stock import Stock


class RecommendationService:
    """Scores and ranks stocks against an investor profile.

    Performs no database queries, LLM calls, or RAG retrieval.
    """

    # SEBI-style INR market-cap buckets (absolute currency units).
    _LARGE_CAP_MIN = 200_000_000_000  # 20,000 Cr
    _MID_CAP_MIN = 50_000_000_000  # 5,000 Cr

    def __init__(self):
        """Create the recommendation service."""

    def score_stock(
        self,
        profile: InvestorProfile,
        stock: Stock,
    ) -> int:
        """Compute a recommendation score for one stock."""
        if not self.has_preferences(profile):
            return 0

        score = 0

        if (
            profile.preferred_sectors
            and stock.sector in profile.preferred_sectors
        ):
            score += 3

        if (
            profile.dividend_preference is True
            and stock.fundamental is not None
            and stock.fundamental.dividend_yield is not None
            and stock.fundamental.dividend_yield > 0
        ):
            score += 2

        if self._matches_risk_tolerance(profile, stock):
            score += 2

        if self._matches_investment_style(profile, stock):
            score += 2

        if self._matches_market_cap(profile, stock):
            score += 1

        score += self._sentiment_score(stock)

        return score

    def rank_stocks(
        self,
        profile: InvestorProfile,
        stocks: list[Stock],
    ) -> list[tuple[Stock, int]]:
        """Score stocks and return them sorted by highest score first."""
        ranked = [
            (stock, self.score_stock(profile, stock))
            for stock in stocks
        ]

        ranked.sort(key=lambda item: item[1], reverse=True)

        return ranked

    def has_preferences(self, profile: InvestorProfile) -> bool:
        """Return True when the profile has at least one preference set."""
        return any(
            (
                profile.risk_tolerance is not None,
                bool(profile.preferred_sectors),
                profile.investment_style is not None,
                profile.preferred_market_cap is not None,
                profile.dividend_preference is not None,
                profile.investment_horizon is not None,
                profile.investment_budget is not None,
                profile.investment_goals is not None,
                profile.experience_level is not None,
            )
        )

    def confidence_for_score(self, score: int) -> int:
        """Map raw score (max 12) to a 0–100 confidence percent."""
        return max(0, min(100, round((score / 12) * 100)))

    def risk_level_for_stock(self, stock: Stock) -> str:
        """Derive a display risk level from debt-to-equity fundamentals."""
        if stock.fundamental is None or stock.fundamental.debt_to_equity is None:
            return "Moderate"

        de = self._normalize_debt_to_equity(stock.fundamental.debt_to_equity)
        if de <= 0.5:
            return "Low"
        if de <= 1.5:
            return "Moderate"
        return "High"

    def time_horizon_for_profile(self, profile: InvestorProfile) -> str:
        """Prefer explicit profile horizon; else infer from investment style."""
        if profile.investment_horizon:
            return profile.investment_horizon

        style = (profile.investment_style or "").strip().lower()
        if "momentum" in style:
            return "Short-term"
        if "growth" in style:
            return "Medium-term"
        if "dividend" in style or "value" in style or "income" in style:
            return "Long-term"
        return "Medium-term"

    def expected_return_for_score(
        self,
        score: int,
    ) -> tuple[float | None, str]:
        """AI estimate band from match score — not a guaranteed return."""
        confidence = self.confidence_for_score(score)
        if confidence >= 75:
            return 15.0, "High"
        if confidence >= 50:
            return 10.0, "Moderate"
        if confidence >= 30:
            return 6.0, "Limited"
        return None, "Weak"

    def _matches_risk_tolerance(
        self,
        profile: InvestorProfile,
        stock: Stock,
    ) -> bool:
        """Return True when fundamentals match the profile risk tolerance."""
        if profile.risk_tolerance is None or stock.fundamental is None:
            return False

        debt_to_equity = stock.fundamental.debt_to_equity

        if debt_to_equity is None:
            return False

        normalized_de = self._normalize_debt_to_equity(debt_to_equity)
        risk = profile.risk_tolerance.strip().lower()

        if risk in {"conservative", "low"}:
            return normalized_de <= 0.5

        if risk in {"moderate", "medium", "balanced"}:
            return 0.5 < normalized_de <= 1.5

        if risk in {"aggressive", "high"}:
            return normalized_de > 1.5

        return False

    def _matches_investment_style(
        self,
        profile: InvestorProfile,
        stock: Stock,
    ) -> bool:
        """Return True when fundamentals match the profile investment style."""
        if profile.investment_style is None or stock.fundamental is None:
            return False

        fundamental = stock.fundamental
        style = profile.investment_style.strip().lower()

        if "dividend" in style or "income" in style:
            return (
                fundamental.dividend_yield is not None
                and fundamental.dividend_yield > 0
            )

        if "growth" in style:
            return (
                fundamental.roe is not None
                and fundamental.roe >= 15
            ) or (
                fundamental.pe_ratio is not None
                and fundamental.pe_ratio >= 25
            )

        if "value" in style:
            return (
                fundamental.pe_ratio is not None
                and 0 < fundamental.pe_ratio < 20
            )

        return False

    def _matches_market_cap(
        self,
        profile: InvestorProfile,
        stock: Stock,
    ) -> bool:
        """Return True when market cap matches the preferred bucket."""
        if profile.preferred_market_cap is None or stock.fundamental is None:
            return False

        market_cap = stock.fundamental.market_cap

        if market_cap is None:
            return False

        preferred = profile.preferred_market_cap.strip().lower()
        bucket = self._market_cap_bucket(market_cap)

        if "large" in preferred:
            return bucket == "large"

        if "mid" in preferred or "medium" in preferred:
            return bucket == "mid"

        if "small" in preferred:
            return bucket == "small"

        return False

    def _sentiment_score(self, stock: Stock) -> int:
        """Score rolling stock sentiment for the recommendation."""
        if stock.sentiment is None:
            return 0

        overall = stock.sentiment.overall_sentiment

        if overall == "positive":
            return 2

        if overall == "neutral":
            return 0

        if overall == "negative":
            return -3

        return 0

    def _market_cap_bucket(self, market_cap: float) -> str:
        """Classify an absolute market-cap value into a size bucket."""
        if market_cap >= self._LARGE_CAP_MIN:
            return "large"

        if market_cap >= self._MID_CAP_MIN:
            return "mid"

        return "small"

    @staticmethod
    def _normalize_debt_to_equity(debt_to_equity: float) -> float:
        """Normalize D/E that may be stored as a ratio or a percentage."""
        if debt_to_equity > 10:
            return debt_to_equity / 100.0

        return debt_to_equity
