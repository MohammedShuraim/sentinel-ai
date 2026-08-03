from collections.abc import Iterator

from app.services.providers.llm_provider import LLMProvider


class LLMService:
    """Application service for interacting with LLM providers.

    Delegates text generation to an injected ``LLMProvider``. Performs
    no retrieval, embeddings, prompt construction, memory, database
    access, or LangGraph orchestration.
    """

    def __init__(self, provider: LLMProvider):
        """Create the LLM service with an injected provider."""
        self.provider = provider

    def generate(self, prompt: str) -> str:
        """Generate text by delegating to the configured provider.

        Returns the provider output unchanged.
        """
        return self.provider.generate(prompt)

    def stream(self, prompt: str) -> Iterator[str]:
        """Stream text deltas by delegating to the configured provider."""
        return self.provider.stream(prompt)
