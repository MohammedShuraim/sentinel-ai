import logging

from google.genai import errors as genai_errors

from app.models.investor_profile import InvestorProfile
from app.models.stock import Stock
from app.services.llm_service import LLMService
from app.services.recommendation_service import RecommendationService

logger = logging.getLogger(__name__)


class RecommendationExplanationService:
    """Explains why a stock matches an investor profile via an LLM.

    Builds an explanation prompt and returns the raw LLM response.
    Falls back to a deterministic explanation when the LLM provider fails.
    """

    def __init__(self, llm_service: LLMService):
        """Create the recommendation explanation service with an injected LLM."""
        self.llm_service = llm_service

    def explain(
        self,
        profile: str,
        stock_context: str,
        *,
        investor_profile: InvestorProfile | None = None,
        stock: Stock | None = None,
    ) -> str:
        """Explain why the stock matches the investor profile."""
        if not stock_context:
            return (
                "I don't have enough information in the available knowledge base."
            )

        prompt = (
            "Explain why the supplied stock matches the investor profile.\n"
            "\n"
            "Rules:\n"
            "- Reference only the supplied investor profile.\n"
            "- Reference only the supplied stock context.\n"
            "- Do not invent financial facts.\n"
            "- Remain concise.\n"
            "- Do not use markdown tables.\n"
            "- Do not use bullet lists.\n"
            "- Do not mention recommendation scores.\n"
            "\n"
            "Investor Profile:\n"
            "\n"
            f"{profile}\n"
            "\n"
            "Stock Context:\n"
            "\n"
            f"{stock_context}\n"
            "\n"
            "Explanation:"
        )

        try:
            return self.llm_service.generate(prompt)
        except genai_errors.APIError as exc:
            logger.warning(
                "Gemini explanation failed; using deterministic fallback: %s",
                exc,
            )
            return self._fallback_explanation(investor_profile, stock)

    def _fallback_explanation(
        self,
        profile: InvestorProfile | None,
        stock: Stock | None,
    ) -> str:
        """Build a deterministic explanation from profile/stock matches."""
        if profile is None or stock is None:
            return (
                "This stock is included based on available profile preferences "
                "and market data. A detailed AI explanation is temporarily "
                "unavailable."
            )

        reasons: list[str] = []

        if (
            profile.preferred_sectors
            and stock.sector in profile.preferred_sectors
        ):
            reasons.append(
                f"it belongs to the preferred {stock.sector} sector"
            )

        if (
            profile.dividend_preference is True
            and stock.fundamental is not None
            and stock.fundamental.dividend_yield is not None
            and stock.fundamental.dividend_yield > 0
        ):
            reasons.append(
                f"it pays a dividend yield of "
                f"{stock.fundamental.dividend_yield}"
            )

        recommendation_service = RecommendationService()

        if recommendation_service._matches_risk_tolerance(profile, stock):
            reasons.append(
                f"it aligns with a {profile.risk_tolerance} risk tolerance"
            )

        if recommendation_service._matches_investment_style(profile, stock):
            reasons.append(
                f"it fits a {profile.investment_style} investment style"
            )

        if (
            stock.sentiment is not None
            and stock.sentiment.overall_sentiment is not None
        ):
            reasons.append(
                f"recent news sentiment is "
                f"{stock.sentiment.overall_sentiment}"
            )

        if not reasons:
            return (
                f"{stock.company_name} ({stock.ticker}) is recommended from "
                f"available profile preferences. A detailed AI explanation is "
                f"temporarily unavailable."
            )

        if len(reasons) == 1:
            detail = reasons[0]
        elif len(reasons) == 2:
            detail = f"{reasons[0]} and {reasons[1]}"
        else:
            detail = ", ".join(reasons[:-1]) + f", and {reasons[-1]}"

        return (
            f"{stock.company_name} ({stock.ticker}) matches the investor "
            f"profile because {detail}."
        )
