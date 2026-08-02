from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.investor_profile import InvestorProfile
from app.services.investor_profile_embedding_service import (
    InvestorProfileEmbeddingService,
)


class InvestorProfileService:
    """Loads and updates persisted investor preference profiles.

    Performs no LLM calls, JSON parsing, or conversation retrieval.
    """

    def __init__(
        self,
        profile_embedding_service: InvestorProfileEmbeddingService,
    ):
        """Create the investor profile service with embedding support."""
        self.profile_embedding_service = profile_embedding_service

    def get_or_create(
        self,
        db: Session,
        user_id: int,
    ) -> InvestorProfile:
        """Return the user's investor profile, creating an empty one if needed."""
        stmt = select(InvestorProfile).where(InvestorProfile.user_id == user_id)
        profile = db.scalars(stmt).first()

        if profile is not None:
            return profile

        profile = InvestorProfile(user_id=user_id)
        db.add(profile)
        db.commit()
        db.refresh(profile)

        self.profile_embedding_service.update_embedding(db, profile)

        return profile

    def update_profile(
        self,
        db: Session,
        profile: InvestorProfile,
        preferences: dict,
    ) -> InvestorProfile:
        """Update profile fields whose preference values are not None.

        Skips commit and embedding regeneration when no field changes.
        """
        changed = False

        for field, value in preferences.items():
            if value is None:
                continue
            if getattr(profile, field) == value:
                continue
            setattr(profile, field, value)
            changed = True

        if not changed:
            return profile

        db.commit()
        db.refresh(profile)

        self.profile_embedding_service.update_embedding(db, profile)

        return profile
