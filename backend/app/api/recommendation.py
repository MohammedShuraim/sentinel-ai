from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.core.dependencies import llm_service, rag_service
from app.crud.stock import get_all_stocks
from app.db.dependencies import get_db
from app.models.investor_profile import InvestorProfile
from app.models.user import User
from app.schemas.recommendation import (
    RecommendationItem,
    RecommendationResponse,
)
from app.services.document_builder_service import DocumentBuilderService
from app.services.investor_profile_formatter_service import (
    InvestorProfileFormatterService,
)
from app.services.recommendation_explanation_service import (
    RecommendationExplanationService,
)
from app.services.recommendation_service import RecommendationService

router = APIRouter(
    prefix="/recommendations",
    tags=["Recommendations"],
)


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
        return RecommendationResponse(recommendations=[])

    stocks = get_all_stocks(db)
    ranked = recommendation_service.rank_stocks(profile, stocks)
    top_stocks = ranked[:5]

    profile_formatter = InvestorProfileFormatterService()
    profile_text = profile_formatter.format_profile(profile)

    document_builder = DocumentBuilderService()
    explanation_service = RecommendationExplanationService(llm_service)

    recommendations: list[RecommendationItem] = []

    for stock, score in top_stocks:
        stock_context = document_builder.build_document(
            stock,
            stock.fundamental,
            list(stock.news),
        )
        explanation = explanation_service.explain(
            profile=profile_text,
            stock_context=stock_context,
            investor_profile=profile,
            stock=stock,
        )
        sources = rag_service.retrieve_documents(
            db,
            f"{stock.company_name} {stock.ticker}",
        )

        recommendations.append(
            RecommendationItem(
                stock_id=stock.id,
                company_name=stock.company_name,
                ticker=stock.ticker,
                score=score,
                explanation=explanation,
                sources=sources,
            )
        )

    return RecommendationResponse(recommendations=recommendations)
