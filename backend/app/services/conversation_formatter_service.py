from app.models.message import Message


class ConversationFormatterService:
    """Formats persisted chat messages into a plain-text history string.

    Performs no database access, truncation, or summarization.
    """

    def format_messages(self, messages: list[Message]) -> str:
        """Convert messages into a formatted conversation history string.

        Returns an empty string when ``messages`` is empty.
        """
        if not messages:
            return ""

        blocks: list[str] = []

        for message in messages:
            if message.role == "user":
                label = "User"
            elif message.role == "assistant":
                label = "Assistant"
            else:
                label = message.role.capitalize()

            blocks.append(f"{label}:\n{message.content}")

        return "\n\n".join(blocks)
