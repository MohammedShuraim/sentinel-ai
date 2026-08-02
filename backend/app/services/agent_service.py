from sqlalchemy.orm import Session

from app.services.llm_service import LLMService
from app.services.rag_service import RAGService


class AgentService:
    """Answers stock questions using retrieved context and an LLM.

    Orchestrates ``RAGService`` for context retrieval and ``LLMService``
    for generation. Performs no database writes, embedding generation,
    manual retrieval, memory management, or LangGraph orchestration.
    """

    def __init__(
        self,
        rag_service: RAGService,
        llm_service: LLMService,
    ):
        """Create the agent service with injected dependencies."""
        self.rag_service = rag_service
        self.llm_service = llm_service

    def answer(
        self,
        db: Session,
        question: str,
    ) -> str:
        """Retrieve context, build the analyst prompt, and generate an answer."""
        context = self.rag_service.retrieve_context(db, question)

        prompt = (
            "You are an AI-powered Indian stock analyst.\n"
            "\n"
            "Use ONLY the provided context to answer the user's question.\n"
            "\n"
            "If the answer cannot be found in the context, reply exactly:\n"
            "\n"
            '"I don\'t have enough information in the available knowledge base."\n'
            "\n"
            "Context:\n"
            "\n"
            f"{context}\n"
            "\n"
            "Question:\n"
            "\n"
            f"{question}\n"
            "\n"
            "Answer:"
        )

        return self.llm_service.generate(prompt)
