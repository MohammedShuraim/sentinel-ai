import logging

from app.core.config import settings
from app.services.providers.failover_provider import FailoverProvider
from app.services.providers.gemini_provider import GeminiProvider
from app.services.providers.groq_provider import GroqProvider
from app.services.providers.llm_provider import LLMProvider

logger = logging.getLogger(__name__)


class ProviderConfigurationError(Exception):
    """A configured provider is missing required settings."""


def _build_provider(name: str) -> LLMProvider:
    """Instantiate one provider by name from application settings."""
    if name == "gemini":
        api_key = settings.GOOGLE_API_KEY or settings.GEMINI_API_KEY
        if not api_key:
            raise ProviderConfigurationError(
                "Gemini provider selected but GOOGLE_API_KEY/GEMINI_API_KEY is not set"
            )
        return GeminiProvider(api_key=api_key)
    if name == "groq":
        if not settings.GROQ_API_KEY:
            raise ProviderConfigurationError(
                "Groq provider selected but GROQ_API_KEY is not set"
            )
        return GroqProvider(
            api_key=settings.GROQ_API_KEY,
            model=settings.GROQ_MODEL,
        )
    raise ProviderConfigurationError(f"Unknown LLM provider: {name!r}")


def create_llm_provider() -> LLMProvider:
    """Build the application LLM provider from environment configuration.

    PRIMARY_PROVIDER / FALLBACK_PROVIDER select the provider chain.
    If the fallback cannot be constructed (e.g. missing API key), the
    application keeps running on the primary provider alone.
    """
    primary_name = settings.PRIMARY_PROVIDER.strip().lower()
    fallback_name = settings.FALLBACK_PROVIDER.strip().lower()

    primary = _build_provider(primary_name)

    fallback: LLMProvider | None = None
    if fallback_name and fallback_name not in {"none", primary_name}:
        try:
            fallback = _build_provider(fallback_name)
        except ProviderConfigurationError as exc:
            logger.warning("Fallback provider disabled: %s", exc)

    if fallback is None:
        logger.info("LLM provider chain: %s (no fallback)", primary_name)
    else:
        logger.info("LLM provider chain: %s -> %s", primary_name, fallback_name)

    return FailoverProvider(
        primary=primary,
        fallback=fallback,
        primary_name=primary_name,
        fallback_name=fallback_name,
    )
