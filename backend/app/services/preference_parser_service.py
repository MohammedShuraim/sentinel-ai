import json


class PreferenceParserService:
    """Parses LLM preference-extraction responses into dictionaries.

    Performs no field validation, value modification, inference,
    database access, or LLM calls.
    """

    def parse(self, response: str) -> dict:
        """Parse a JSON preference string into a dictionary.

        Raises:
            ValueError: If the response is not valid JSON.
        """
        try:
            return json.loads(response)
        except (json.JSONDecodeError, TypeError) as exc:
            raise ValueError("Invalid preference JSON.") from exc
