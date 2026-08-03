from collections.abc import Iterator


class LLMProvider:
    """Abstract provider interface for large language models.

    Concrete implementations (Gemini, OpenAI, Claude, local models, etc.)
    are responsible only for generating text from a prompt. They perform:

    - no retrieval
    - no embeddings
    - no prompt construction
    - no memory
    - no database access
    - no LangGraph orchestration

    Those responsibilities belong to higher layers. Callers are expected
    to pass a fully prepared prompt and handle the returned text.
    """

    def generate(self, prompt: str) -> str:
        """Generate a text response for the given prompt.

        Returns the model output as a string.
        """
        raise NotImplementedError

    def stream(self, prompt: str) -> Iterator[str]:
        """Yield text deltas for the given prompt as they are produced.

        Implementations must raise provider/SDK exceptions unchanged so
        higher layers can apply retry and failover before the first token.
        """
        raise NotImplementedError
