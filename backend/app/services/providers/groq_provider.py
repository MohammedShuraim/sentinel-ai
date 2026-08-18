from collections.abc import Iterator

from groq import Groq

from app.services.providers.llm_provider import LLMProvider


class GroqProvider(LLMProvider):
    """Client for Groq Chat Completions models.

    Initializes the Groq client once and generates text from a prompt.
    Performs no retrieval, embeddings, prompt construction, memory,
    database access, or LangGraph orchestration.
    """

    def __init__(
        self,
        api_key: str,
        model: str = "openai/gpt-oss-120b",
    ):
        """Create a Groq provider and initialize the client once."""
        self.api_key = api_key
        self.model = model
        self.client = Groq(api_key=api_key)

    def generate(self, prompt: str) -> str:
        """Generate a text response from the configured Groq model.

        Returns only the generated text. SDK exceptions are raised
        unchanged.
        """
        completion = self.client.chat.completions.create(
            model=self.model,
            messages=[{"role": "user", "content": prompt}],
        )

        return completion.choices[0].message.content or ""

    def stream(self, prompt: str) -> Iterator[str]:
        """Yield Groq chat-completion deltas with ``stream=True``."""
        completion = self.client.chat.completions.create(
            model=self.model,
            messages=[{"role": "user", "content": prompt}],
            stream=True,
        )
        for chunk in completion:
            choices = getattr(chunk, "choices", None) or []
            if not choices:
                continue
            delta = choices[0].delta
            text = getattr(delta, "content", None)
            if text:
                yield text
