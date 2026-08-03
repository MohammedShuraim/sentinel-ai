from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.core.dependencies import get_investor_profile_service
from app.db.dependencies import get_db
from app.models.user import User
from app.schemas.investor_profile import (
    InvestorProfileRead,
    InvestorProfileUpdate,
)
from app.services.investor_profile_service import InvestorProfileService
from app.services.recommendation_service import RecommendationService

router = APIRouter(
    prefix="/investor-profile",
    tags=["Investor Profile"],
)


def _to_read(profile, recommendation_service: RecommendationService) -> InvestorProfileRead:
    sectors = profile.preferred_sectors
    if sectors is not None and not isinstance(sectors, list):
        sectors = list(sectors) if sectors else None

    return InvestorProfileRead(
        id=profile.id,
        user_id=profile.user_id,
        risk_tolerance=profile.risk_tolerance,
        preferred_sectors=sectors,
        investment_style=profile.investment_style,
        preferred_market_cap=profile.preferred_market_cap,
        dividend_preference=profile.dividend_preference,
        has_preferences=recommendation_service.has_preferences(profile),
    )


@router.get("/", response_model=InvestorProfileRead)
def get_investor_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    investor_profile_service: InvestorProfileService = Depends(
        get_investor_profile_service,
    ),
):
    """Return the current user's profile, creating an empty row if needed."""
    profile = investor_profile_service.get_or_create(db, current_user.id)
    return _to_read(profile, RecommendationService())


@router.put("/", response_model=InvestorProfileRead)
def update_investor_profile(
    payload: InvestorProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    investor_profile_service: InvestorProfileService = Depends(
        get_investor_profile_service,
    ),
):
    """Update investor preferences via the existing InvestorProfileService."""
    profile = investor_profile_service.get_or_create(db, current_user.id)
    preferences = payload.model_dump(exclude_unset=True)
    profile = investor_profile_service.update_profile(db, profile, preferences)
    return _to_read(profile, RecommendationService())
