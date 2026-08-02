import re

from app.services.llm_service import LLMService

_PREFERENCE_SIGNAL_PATTERN = re.compile(
    r"\b("
    r"prefer(?:ence|ences|ring)?|"
    r"risk(?:\s*tolerance)?|"
    r"conservative|aggressive|moderate|balanced|"
    r"dividend\s+(?:stock|stocks|invest|investor|income|focus)|"
    r"prefer(?:ence)?\s+dividend|want\s+dividends?|"
    r"income\s+invest|"
    r"growth\s+(?:stock|invest)|value\s+invest|"
    r"investment\s+style|investing\s+style|"
    r"large[\s-]*cap|mid[\s-]*cap|small[\s-]*cap|market\s*cap|"
    r"interested\s+in|looking\s+for|"
    r"my\s+portfolio|allocate|allocation|horizon|"
    r"i(?:'m|\s+am)\s+(?:a\s+)?(?:conservative|aggressive|moderate|"
    r"growth|value|dividend)|"
    r"i\s+(?:prefer|want|like|need)|"
    r"for\s+me|as\s+an\s+investor"
    r")\b",
    re.IGNORECASE,
)

_FOLLOW_UP_REFERENCE_PATTERN = re.compile(
    r"\b(its|it|it's|that company|this company|the company|"
    r"that stock|this stock|the stock)\b",
    re.IGNORECASE,
)

_FACTUAL_STOCK_QUESTION_PATTERN = re.compile(
    r"\b("
    r"what(?:'s|\s+is|\s+are|\s+was|\s+were)?|"
    r"how\s+(?:much|many|is|are)|"
    r"tell\s+me|show\s+me|give\s+me|"
    r"pe\b|p\/e|roe|eps|debt|yield|price|ratio|"
    r"sentiment|news|fundamentals?"
    r")\b",
    re.IGNORECASE,
)


class PreferenceExtractionService:
    """Extracts investor preferences from conversation text via an LLM.

    Builds an extraction prompt and returns the raw LLM response.
    Performs no JSON parsing, database access, or preference persistence.
    """

    def __init__(self, llm_service: LLMService):
        """Create the preference extraction service with an injected LLM."""
        self.llm_service = llm_service

    def should_extract(self, question: str) -> bool:
        """Return True when the user message likely states preferences.

        Skips pronoun follow-ups and factual stock questions that do not
        signal investment preferences, avoiding a Gemini round-trip.
        """
        text = question.strip()
        if not text:
            return False

        if _FOLLOW_UP_REFERENCE_PATTERN.search(text):
            return False

        if _PREFERENCE_SIGNAL_PATTERN.search(text):
            return True

        if _FACTUAL_STOCK_QUESTION_PATTERN.search(text):
            return False

        return False

    def extract_preferences(self, conversation: str) -> str:
        """Extract investor preferences from conversation text.

        Returns the raw LLM response unchanged.
        """
        prompt = (
            "Extract ONLY investor preferences from the conversation below.\n"
            "\n"
            "Return valid JSON only. Do NOT include markdown.\n"
            "\n"
            "Extract only these fields:\n"
            "- risk_tolerance\n"
            "- preferred_sectors\n"
            "- investment_style\n"
            "- preferred_market_cap\n"
            "- dividend_preference\n"
            "\n"
            "If a field is not mentioned, return null for that field.\n"
            "\n"
            "Do NOT infer preferences.\n"
            "Do NOT summarize.\n"
            "Do NOT answer investment questions.\n"
            "\n"
            "Example output:\n"
            "{\n"
            '  "risk_tolerance": null,\n'
            '  "preferred_sectors": ["Banking"],\n'
            '  "investment_style": "Dividend",\n'
            '  "preferred_market_cap": "Large",\n'
            '  "dividend_preference": true\n'
            "}\n"
            "\n"
            "Conversation:\n"
            "\n"
            f"{conversation}"
        )

        return self.llm_service.generate(prompt)
