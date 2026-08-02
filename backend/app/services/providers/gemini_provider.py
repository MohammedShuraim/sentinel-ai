from google import genai

from app.services.providers.llm_provider import LLMProvider


class GeminiProvider(LLMProvider):
    """Client for Google's Gemini large language models.

    Initializes the GenAI client once and generates text from a prompt.
    Performs no retrieval, embeddings, prompt construction, memory,
    database access, or LangGraph orchestration.
    """

    def __init__(
        self,
        api_key: str,
        model: str = "models/gemini-3.6-flash",
    ):
        """Create a Gemini provider and initialize the client once.

        Stores the API key and model name, then builds a single
        ``genai.Client`` instance for subsequent generation calls.
        """
        self.api_key = api_key
        self.model = model
        self.client = genai.Client(api_key=api_key)

    def generate(self, prompt: str) -> str:
        """Generate a text response from the configured Gemini model.

        Returns only the generated text. SDK exceptions are raised
        unchanged.
        """
        response = self.client.models.generate_content(
            model=self.model,
            contents=prompt,
        )

        return response.text
