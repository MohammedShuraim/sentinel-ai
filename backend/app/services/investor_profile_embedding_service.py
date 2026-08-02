from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.investor_profile import InvestorProfile
from app.models.investor_profile_embedding import InvestorProfileEmbedding
from app.services.investor_profile_formatter_service import (
    InvestorProfileFormatterService,
)
from app.services.providers.embedding_provider import EmbeddingProvider


class InvestorProfileEmbeddingService:
    """Generates and persists semantic embeddings for investor profiles.

    Formats profile text, embeds it via Sentence Transformers, and upserts
    the vector. Performs no recommendation scoring or chat orchestration.
    """

    def __init__(
        self,
        formatter: InvestorProfileFormatterService,
        embedding_provider: EmbeddingProvider,
    ):
        """Create the profile embedding service with injected dependencies."""
        self.formatter = formatter
        self.embedding_provider = embedding_provider

    def update_embedding(
        self,
        db: Session,
        profile: InvestorProfile,
    ) -> InvestorProfileEmbedding:
        """Format, embed, and persist the investor profile vector.

        Skips embedding regeneration when formatted profile text is unchanged.
        """
        profile_text = self.formatter.format_profile(profile)

        stmt = select(InvestorProfileEmbedding).where(
            InvestorProfileEmbedding.user_id == profile.user_id,
        )
        db_embedding = db.scalars(stmt).first()

        if (
            db_embedding is not None
            and db_embedding.profile_text == profile_text
        ):
            return db_embedding

        vector = self.embedding_provider.embed(profile_text)

        if db_embedding is None:
            db_embedding = InvestorProfileEmbedding(
                user_id=profile.user_id,
                profile_text=profile_text,
                embedding=vector,
            )
            db.add(db_embedding)
        else:
            db_embedding.profile_text = profile_text
            db_embedding.embedding = vector

        db.commit()
        db.refresh(db_embedding)

        return db_embedding
