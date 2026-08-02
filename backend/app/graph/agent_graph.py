import logging
import re
import time

from google.genai import errors as genai_errors
from langgraph.graph import END, START, StateGraph
from sqlalchemy.orm import Session

from app.crud.stock import get_stock_by_ticker
from app.graph.state import AgentState
from app.schemas.retrieved_document import RetrievedDocument
from app.services.llm_service import LLMService
from app.services.rag_service import RAGService

_GEMINI_UNAVAILABLE_ANSWER = (
    "The AI service is temporarily unavailable. Please try again in a minute."
)

logger = logging.getLogger(__name__)

_CONVERSATIONAL_REFERENCE_PATTERN = re.compile(
    r"\b(its|it|it's|that company|this company|the company|"
    r"that stock|this stock|the stock)\b",
    re.IGNORECASE,
)


class AgentGraph:
    """LangGraph workflow for RAG-backed stock question answering.

    Compiles a two-node graph that retrieves context and then generates
    an answer. Dependencies are injected; the graph itself owns no
    providers or database connections.
    """

    def __init__(
        self,
        rag_service: RAGService,
        llm_service: LLMService,
    ):
        """Create the agent graph and compile it once."""
        self.rag_service = rag_service
        self.llm_service = llm_service

        graph = StateGraph(AgentState)

        graph.add_node("retrieve_context", self._retrieve_context)
        graph.add_node("generate_answer", self._generate_answer)

        graph.add_edge(START, "retrieve_context")
        graph.add_edge("retrieve_context", "generate_answer")
        graph.add_edge("generate_answer", END)

        self.graph = graph.compile()

    def _retrieve_context(self, state: AgentState) -> AgentState:
        """Retrieve RAG documents and concatenate chunk text for the prompt."""
        db = state["db"]

        retrieval_query = self._resolve_retrieval_query(
            db,
            question=state["question"],
            history=state["history"],
        )

        logger.info(
            "Retrieval query resolved: original=%r resolved=%r",
            state["question"],
            retrieval_query,
        )

        started = time.perf_counter()
        documents = self.rag_service.retrieve_documents(
            db=db,
            query=retrieval_query,
        )
        retrieval_ms = (time.perf_counter() - started) * 1000
        logger.info("Retrieval: %.0f ms", retrieval_ms)

        context = "\n\n".join(document.chunk_text for document in documents)

        return {
            **state,
            "context": context,
            "sources": documents,
        }

    def _generate_answer(self, state: AgentState) -> AgentState:
        """Generate an answer from profile, history, context, and question."""
        prompt = (
            "You are an AI-powered Indian stock analyst.\n"
            "\n"
            "Investor Profile:\n"
            "\n"
            f"{state['profile']}\n"
            "\n"
            "Use ONLY the provided context to answer the user's question.\n"
            "\n"
            "If the answer cannot be found in the context, reply exactly:\n"
            "\n"
            '"I don\'t have enough information in the available knowledge base."\n'
            "\n"
            "Conversation History:\n"
            "\n"
            f"{state['history']}\n"
            "\n"
            "Retrieved Context:\n"
            "\n"
            f"{state['context']}\n"
            "\n"
            "Current Question:\n"
            "\n"
            f"{state['question']}\n"
            "\n"
            "Answer:"
        )

        started = time.perf_counter()
        try:
            answer = self.llm_service.generate(prompt)
        except genai_errors.APIError as exc:
            logger.warning(
                "Gemini answer generation failed; returning fallback answer: %s",
                exc,
            )
            answer = _GEMINI_UNAVAILABLE_ANSWER
        answer_ms = (time.perf_counter() - started) * 1000
        logger.info("Answer generation: %.0f ms", answer_ms)

        return {
            **state,
            "answer": answer,
        }

    def run(
        self,
        db: Session,
        question: str,
        history: str,
        profile: str,
    ) -> tuple[str, list[RetrievedDocument]]:
        """Invoke the compiled graph and return the answer with sources."""
        final_state = self.graph.invoke(
            {
                "question": question,
                "history": history,
                "profile": profile,
                "db": db,
                "context": "",
                "sources": [],
                "answer": "",
            }
        )

        return final_state["answer"], final_state["sources"]

    def _resolve_retrieval_query(
        self,
        db: Session,
        *,
        question: str,
        history: str,
    ) -> str:
        """Resolve conversational references using the last ticker in history.

        The last referenced ticker is obtained by scanning the formatted
        conversation history for known stock tickers and keeping the most
        recently mentioned one. The original question stays unchanged for
        the LLM prompt; only retrieval uses the resolved query.
        """
        if self._tickers_in_text(db, question):
            return question

        if not _CONVERSATIONAL_REFERENCE_PATTERN.search(question):
            return question

        last_ticker = self._last_ticker_in_text(db, history)

        if last_ticker is None:
            return question

        cleaned = _CONVERSATIONAL_REFERENCE_PATTERN.sub(" ", question)
        cleaned = re.sub(r"\s+", " ", cleaned).strip().rstrip("?").strip()

        about_match = re.match(
            r"what about\s+(.+)$",
            cleaned,
            flags=re.IGNORECASE,
        )
        if about_match is not None:
            topic = about_match.group(1).strip()
            return f"What is the {topic} of {last_ticker}?"

        return f"{cleaned} of {last_ticker}?"

    def _tickers_in_text(self, db: Session, text: str) -> list[str]:
        """Return stock tickers mentioned in ``text`` in appearance order."""
        tickers: list[str] = []

        for token in re.findall(r"[A-Za-z][A-Za-z0-9.&-]*", text):
            stock = get_stock_by_ticker(db, token)
            if stock is not None:
                tickers.append(stock.ticker.upper())

        return tickers

    def _last_ticker_in_text(self, db: Session, text: str) -> str | None:
        """Return the most recently mentioned ticker in ``text``, if any."""
        tickers = self._tickers_in_text(db, text)

        if not tickers:
            return None

        return tickers[-1]
