from concurrent.futures import ThreadPoolExecutor, as_completed

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.api.dependencies import get_current_user
from app.core.dependencies import llm_service
from app.crud.portfolio import get_user_portfolio
from app.db.dependencies import get_db
from app.models.investor_profile import InvestorProfile
from app.models.stock import Stock
from app.models.user import User
from app.schemas.recommendation import (
    RecommendationItem,
    RecommendationResponse,
)
from app.services.providers.finnhub_provider import FinnhubProvider
from app.services.recommendation_explanation_service import (
    RecommendationExplanationService,
)
from app.services.recommendation_service import RecommendationService

router = APIRouter(
    prefix="/recommendations",
    tags=["Recommendations"],
)


def _load_active_stocks(db: Session) -> list[Stock]:
    stmt = (
        select(Stock)
        .where(Stock.is_active.is_(True))
        .options(
            selectinload(Stock.fundamental),
            selectinload(Stock.news),
            selectinload(Stock.sentiment),
        )
        .order_by(Stock.company_name.asc())
    )
    return list(db.scalars(stmt).all())


def _fetch_quotes(tickers: list[str]) -> dict[str, float | None]:
    """Best-effort quotes with a tight overall budget so onboarding stays snappy."""
    if not tickers:
        return {}

    finnhub = FinnhubProvider()
    prices: dict[str, float | None] = {ticker: None for ticker in tickers}

    with ThreadPoolExecutor(max_workers=min(5, len(tickers))) as pool:
        futures = {
            pool.submit(finnhub.fetch_quote, ticker): ticker for ticker in tickers
        }
        try:
            for future in as_completed(futures, timeout=4):
                ticker = futures[future]
                try:
                    prices[ticker] = future.result()
                except Exception:
                    prices[ticker] = None
        except TimeoutError:
            pass

    return prices


@router.get(
    "/",
    response_model=RecommendationResponse,
)
def get_recommendations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    stmt = select(InvestorProfile).where(
        InvestorProfile.user_id == current_user.id,
    )
    profile = db.scalars(stmt).first()
    recommendation_service = RecommendationService()

    if profile is None or not recommendation_service.has_preferences(profile):
        return RecommendationResponse(
            recommendations=[],
            empty_reason=(
                "Investor profile incomplete. Finish the AI questionnaire "
                "so we can personalize stock recommendations."
            ),
        )

    stocks = _load_active_stocks(db)
    if not stocks:
        return RecommendationResponse(
            recommendations=[],
            empty_reason=(
                "Stock universe not imported. Import the active stock dataset "
                "(and fundamentals) before recommendations can be generated."
            ),
        )

    ranked = recommendation_service.rank_stocks(profile, stocks)
    positive = [(stock, score) for stock, score in ranked if score > 0]
    # Prefer positive matches; fall back to top ranked so onboarding is not empty
    # when fundamentals are sparse. Never return [] without empty_reason.
    top_stocks = (positive or ranked)[:5]
    if not top_stocks:
        return RecommendationResponse(
            recommendations=[],
            empty_reason=(
                "No qualifying stocks matched the user's profile with the "
                "current market dataset."
            ),
        )

    owned_ids = {
        holding.stock_id for holding in get_user_portfolio(db, current_user.id)
    }

    # Dashboard and onboarding must stay fast on small instances.
    # Use deterministic profile-fit copy here; Chat remains the LLM path.
    explanation_service = RecommendationExplanationService(llm_service)
    quotes = _fetch_quotes([stock.ticker for stock, _ in top_stocks])

    recommendations: list[RecommendationItem] = []
    horizon = recommendation_service.time_horizon_for_profile(profile)

    for stock, score in top_stocks:
        owned = stock.id in owned_ids
        explanation = explanation_service._fallback_explanation(profile, stock)

        expected_pct, expected_label = (
            recommendation_service.expected_return_for_score(score)
        )

        recommendations.append(
            RecommendationItem(
                stock_id=stock.id,
                company_name=stock.company_name,
                ticker=stock.ticker,
                score=score,
                explanation=explanation,
                sources=[],
                sector=stock.sector,
                current_price=quotes.get(stock.ticker),
                expected_return_pct=expected_pct,
                expected_return_label=expected_label,
                risk_level=recommendation_service.risk_level_for_stock(stock),
                time_horizon=horizon,
                confidence=recommendation_service.confidence_for_score(score),
                already_owned=owned,
            )
        )

    return RecommendationResponse(
        recommendations=recommendations,
        empty_reason=None,
    )
