import logging
import time
from collections.abc import Iterator
from typing import Any

from google.genai import errors as genai_errors
from sqlalchemy.orm import Session

from app.crud.conversation import (
    create_conversation,
    get_latest_user_conversation,
    get_user_conversation,
)
from app.crud.message import create_message, get_messages, get_recent_messages
from app.schemas.chat import ActiveConversationResponse, ChatMessageRead
from app.graph.agent_graph import AgentGraph
from app.models.conversation import Conversation
from app.schemas.retrieved_document import RetrievedDocument
from app.services.conversation_formatter_service import (
    ConversationFormatterService,
)
from app.services.investor_profile_formatter_service import (
    InvestorProfileFormatterService,
)
from app.services.investor_profile_service import InvestorProfileService
from app.services.preference_extraction_service import (
    PreferenceExtractionService,
)
from app.services.preference_parser_service import PreferenceParserService
from app.services.providers.failover_provider import ProviderUnavailableError

logger = logging.getLogger(__name__)


class ConversationNotFoundError(Exception):
    """Raised when a conversation is missing or not owned by the user."""


class ConversationService:
    """Orchestrates chat turns against a persisted conversation.

    Creates or loads a conversation, stores the user message, formats
    recent history, updates investor preferences, runs the agent graph
    with a personalized prompt, and stores the assistant reply.
    """

    def __init__(
        self,
        agent_graph: AgentGraph,
        formatter: ConversationFormatterService,
        preference_extraction_service: PreferenceExtractionService,
        preference_parser_service: PreferenceParserService,
        investor_profile_service: InvestorProfileService,
        profile_formatter: InvestorProfileFormatterService,
    ):
        """Create the conversation service with injected dependencies."""
        self.agent_graph = agent_graph
        self.formatter = formatter
        self.preference_extraction_service = preference_extraction_service
        self.preference_parser_service = preference_parser_service
        self.investor_profile_service = investor_profile_service
        self.profile_formatter = profile_formatter

    def chat(
        self,
        db: Session,
        user_id: int,
        question: str,
        conversation_id: int | None = None,
    ) -> tuple[int, str, list[RetrievedDocument]]:
        """Persist a chat turn and return conversation id, answer, and sources."""
        total_started = time.perf_counter()

        conversation, history, profile_text = self._prepare_turn(
            db=db,
            user_id=user_id,
            question=question,
            conversation_id=conversation_id,
        )

        answer, sources = self.agent_graph.run(
            db=db,
            question=question,
            history=history,
            profile=profile_text,
        )

        create_message(
            db,
            conversation.id,
            role="assistant",
            content=answer,
        )

        total_ms = (time.perf_counter() - total_started) * 1000
        logger.info("Total: %.0f ms", total_ms)

        return (
            conversation.id,
            answer,
            sources,
        )

    def chat_stream(
        self,
        db: Session,
        user_id: int,
        question: str,
        conversation_id: int | None = None,
    ) -> Iterator[dict[str, Any]]:
        """Stream a chat turn as SSE event payloads.

        Yields:
        - ``start`` with ``conversation_id`` after the user message is stored
        - ``token`` deltas while the model streams
        - ``done`` with the full answer and sources after persistence
        - ``error`` when the turn cannot continue
        """
        total_started = time.perf_counter()

        conversation, history, profile_text = self._prepare_turn(
            db=db,
            user_id=user_id,
            question=question,
            conversation_id=conversation_id,
        )

        yield {
            "type": "start",
            "conversation_id": conversation.id,
        }

        token_iter, sources = self.agent_graph.stream(
            db=db,
            question=question,
            history=history,
            profile=profile_text,
        )

        chunks: list[str] = []
        try:
            for token in token_iter:
                chunks.append(token)
                yield {"type": "token", "delta": token}
        except Exception as exc:
            logger.exception("Chat stream failed: %s", exc)
            yield {
                "type": "error",
                "detail": "The AI service is temporarily unavailable.",
            }
            return

        answer = "".join(chunks)
        create_message(
            db,
            conversation.id,
            role="assistant",
            content=answer,
        )

        total_ms = (time.perf_counter() - total_started) * 1000
        logger.info("Total stream: %.0f ms", total_ms)

        yield {
            "type": "done",
            "conversation_id": conversation.id,
            "answer": answer,
            "sources": [source.model_dump() for source in sources],
        }

    def get_active_conversation(
        self,
        db: Session,
        user_id: int,
    ) -> ActiveConversationResponse:
        """Return the user's most recent conversation and full message history."""
        conversation = get_latest_user_conversation(db, user_id)
        if conversation is None:
            return ActiveConversationResponse(
                conversation_id=None,
                messages=[],
            )

        messages = get_messages(db, conversation.id)
        return ActiveConversationResponse(
            conversation_id=conversation.id,
            messages=[
                ChatMessageRead.model_validate(message) for message in messages
            ],
        )

    def _prepare_turn(
        self,
        db: Session,
        user_id: int,
        question: str,
        conversation_id: int | None,
    ) -> tuple[Conversation, str, str]:
        """Load or create conversation, store user message, return history/profile."""
        if conversation_id is None:
            conversation = get_latest_user_conversation(db, user_id)
            if conversation is None:
                conversation = create_conversation(db, user_id)
        else:
            conversation = get_user_conversation(
                db,
                user_id,
                conversation_id,
            )

            if conversation is None:
                raise ConversationNotFoundError("Conversation not found.")

        create_message(
            db,
            conversation.id,
            role="user",
            content=question,
        )

        recent_messages = get_recent_messages(db, conversation.id)
        history = self.formatter.format_messages(recent_messages)

        profile = self.investor_profile_service.get_or_create(db, user_id)

        if self.preference_extraction_service.should_extract(question):
            preference_started = time.perf_counter()
            try:
                raw_preferences = (
                    self.preference_extraction_service.extract_preferences(
                        history,
                    )
                )
            except (ProviderUnavailableError, genai_errors.APIError) as exc:
                logger.warning(
                    "AI preference extraction failed; continuing without "
                    "preference update: %s",
                    exc,
                )
                raw_preferences = None
            preference_ms = (time.perf_counter() - preference_started) * 1000

            preferences = None
            if raw_preferences is not None:
                try:
                    preferences = self.preference_parser_service.parse(
                        raw_preferences,
                    )
                except ValueError:
                    preferences = None

            if preferences is not None:
                self.investor_profile_service.update_profile(
                    db,
                    profile,
                    preferences,
                )

            logger.info("Preference extraction: %.0f ms", preference_ms)
        else:
            logger.info("Preference extraction: 0 ms (skipped)")

        profile_text = self.profile_formatter.format_profile(profile)
        return conversation, history, profile_text
