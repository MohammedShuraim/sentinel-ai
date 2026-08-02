import json

from app.models.news import News
from app.models.news_analysis import NewsAnalysis
from app.services.llm_service import LLMService


class NewsAnalysisService:
    """Analyzes news articles into structured intelligence via an LLM.

    Builds an analysis prompt, parses the JSON response, and returns a
    ``NewsAnalysis`` instance. Performs no database writes.
    """

    def __init__(self, llm_service: LLMService):
        """Create the news analysis service with an injected LLM."""
        self.llm_service = llm_service

    def analyze(self, article: News) -> NewsAnalysis:
        """Analyze a news article and return a NewsAnalysis model instance."""
        prompt = (
            "Analyze the news article below.\n"
            "\n"
            "Return valid JSON only. Do NOT include markdown.\n"
            "\n"
            "Extract only these fields:\n"
            "- sentiment: one of positive, neutral, negative\n"
            "- impact: one of high, medium, low\n"
            "- event_type: one of earnings, acquisition, management, "
            "regulation, product, investment, litigation, other\n"
            "- mentioned_tickers: list of ticker strings\n"
            "- summary: a concise summary string\n"
            "\n"
            "Example output:\n"
            "{\n"
            '  "sentiment": "positive",\n'
            '  "impact": "medium",\n'
            '  "event_type": "earnings",\n'
            '  "mentioned_tickers": ["RELIANCE"],\n'
            '  "summary": "Company reported stronger quarterly results."\n'
            "}\n"
            "\n"
            "Title:\n"
            f"{article.title}\n"
            "\n"
            "Content:\n"
            f"{article.content}"
        )

        raw_response = self.llm_service.generate(prompt)
        data = self._parse_json(raw_response)

        return NewsAnalysis(
            news_id=article.id,
            sentiment=data["sentiment"],
            impact=data["impact"],
            event_type=data["event_type"],
            mentioned_tickers=data["mentioned_tickers"],
            summary=data["summary"],
        )

    def _parse_json(self, response: str) -> dict:
        """Parse the LLM response as JSON."""
        text = response.strip()

        if text.startswith("```"):
            lines = text.splitlines()
            if lines and lines[0].startswith("```"):
                lines = lines[1:]
            if lines and lines[-1].strip() == "```":
                lines = lines[:-1]
            text = "\n".join(lines).strip()

        try:
            return json.loads(text)
        except (json.JSONDecodeError, TypeError) as exc:
            raise ValueError("Invalid news analysis JSON.") from exc
