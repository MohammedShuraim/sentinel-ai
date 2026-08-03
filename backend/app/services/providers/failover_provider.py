import logging
from collections.abc import Iterator

import httpx
from google.genai import errors as genai_errors
from groq import APIConnectionError, APITimeoutError, APIStatusError, RateLimitError

from app.services.providers.llm_provider import LLMProvider

logger = logging.getLogger(__name__)

_TRANSIENT_STATUS_CODES = {408, 429, 500, 502, 503, 504}

_NETWORK_ERRORS = (
    httpx.TimeoutException,
    httpx.ConnectError,
    httpx.NetworkError,
    ConnectionError,
    TimeoutError,
)


class ProviderUnavailableError(Exception):
    """Every configured LLM provider failed on operational errors.

    Raised only after the primary provider and its retry, plus the
    fallback provider, all fail with transient/provider-side errors.
    Programming bugs and unexpected exceptions are never wrapped in
    this type — they propagate unchanged.
    """

    def __init__(
        self,
        message: str,
        *,
        primary_error: Exception | None = None,
        fallback_error: Exception | None = None,
    ):
        super().__init__(message)
        self.primary_error = primary_error
        self.fallback_error = fallback_error


def is_operational_failure(exc: Exception) -> bool:
    """Classify transient provider-side failures eligible for failover.

    Operational: rate limits (429), quota exhaustion, server errors
    (5xx), request timeouts, and connection failures from either SDK.
    Non-operational (returns False): invalid credentials, malformed
    requests, programming bugs, and any unexpected exception.
    """
    if isinstance(exc, genai_errors.APIError):
        return exc.code in _TRANSIENT_STATUS_CODES
    if isinstance(exc, RateLimitError):
        return True
    if isinstance(exc, (APIConnectionError, APITimeoutError)):
        return True
    if isinstance(exc, APIStatusError):
        return exc.status_code in _TRANSIENT_STATUS_CODES
    if isinstance(exc, _NETWORK_ERRORS):
        return True
    return False


class FailoverProvider(LLMProvider):
    """Primary-then-fallback LLM provider with one primary retry.

    Order of operations for every generate() call:
    1. Try the primary provider.
    2. On an operational failure, retry the primary once.
    3. If the retry also fails operationally, switch to the fallback.
    4. If the fallback fails operationally too, raise
       ``ProviderUnavailableError`` so callers can apply their existing
       graceful-degradation handling.
    Non-operational exceptions are re-raised immediately at every step.
    """

    def __init__(
        self,
        primary: LLMProvider,
        fallback: LLMProvider | None = None,
        *,
        primary_name: str = "primary",
        fallback_name: str = "fallback",
    ):
        self.primary = primary
        self.fallback = fallback
        self.primary_name = primary_name
        self.fallback_name = fallback_name

    def generate(self, prompt: str) -> str:
        logger.info("%s request started", self.primary_name)
        try:
            answer = self.primary.generate(prompt)
            logger.info("%s request succeeded", self.primary_name)
            return answer
        except Exception as exc:
            if not is_operational_failure(exc):
                raise
            logger.warning(
                "%s failed (%s): %s",
                self.primary_name,
                type(exc).__name__,
                exc,
            )

        logger.info("Retrying %s once", self.primary_name)
        try:
            answer = self.primary.generate(prompt)
            logger.info("%s request succeeded after retry", self.primary_name)
            return answer
        except Exception as exc:
            if not is_operational_failure(exc):
                raise
            primary_error = exc
            logger.warning(
                "%s retry failed (%s): %s",
                self.primary_name,
                type(exc).__name__,
                exc,
            )

        if self.fallback is None:
            raise ProviderUnavailableError(
                f"{self.primary_name} unavailable and no fallback configured",
                primary_error=primary_error,
            ) from primary_error

        logger.info("Switching to %s", self.fallback_name)
        try:
            answer = self.fallback.generate(prompt)
            logger.info("%s request succeeded", self.fallback_name)
            return answer
        except Exception as exc:
            if not is_operational_failure(exc):
                raise
            logger.error(
                "%s failed (%s): %s",
                self.fallback_name,
                type(exc).__name__,
                exc,
            )
            raise ProviderUnavailableError(
                f"All AI providers unavailable "
                f"({self.primary_name}, {self.fallback_name})",
                primary_error=primary_error,
                fallback_error=exc,
            ) from exc

    def stream(self, prompt: str) -> Iterator[str]:
        """Stream tokens with the same primary-retry-fallback policy.

        Failover only applies to operational failures that occur before
        the first token is yielded. Mid-stream errors propagate unchanged.
        """
        primary_error: Exception | None = None

        for attempt in (1, 2):
            label = (
                f"{self.primary_name} request"
                if attempt == 1
                else f"{self.primary_name} retry"
            )
            logger.info("%s started (stream)", label)
            started = False
            try:
                for token in self.primary.stream(prompt):
                    started = True
                    yield token
                logger.info("%s succeeded (stream)", label)
                return
            except Exception as exc:
                if started:
                    logger.error(
                        "%s failed mid-stream after tokens were yielded",
                        self.primary_name,
                    )
                    raise
                if not is_operational_failure(exc):
                    raise
                primary_error = exc
                logger.warning(
                    "%s failed before first token (%s): %s",
                    label,
                    type(exc).__name__,
                    exc,
                )
                if attempt == 1:
                    logger.info("Retrying %s once (stream)", self.primary_name)

        if self.fallback is None:
            raise ProviderUnavailableError(
                f"{self.primary_name} unavailable and no fallback configured",
                primary_error=primary_error,
            ) from primary_error

        logger.info("Switching to %s (stream)", self.fallback_name)
        started = False
        try:
            for token in self.fallback.stream(prompt):
                started = True
                yield token
            logger.info("%s request succeeded (stream)", self.fallback_name)
        except Exception as exc:
            if started:
                logger.error(
                    "%s failed mid-stream after tokens were yielded",
                    self.fallback_name,
                )
                raise
            if not is_operational_failure(exc):
                raise
            logger.error(
                "%s failed before first token (%s): %s",
                self.fallback_name,
                type(exc).__name__,
                exc,
            )
            raise ProviderUnavailableError(
                f"All AI providers unavailable "
                f"({self.primary_name}, {self.fallback_name})",
                primary_error=primary_error,
                fallback_error=exc,
            ) from exc
