import logging
import re
import time
from collections.abc import Iterator

from google.genai import errors as genai_errors
from langgraph.graph import END, START, StateGraph
from sqlalchemy.orm import Session

from app.crud.stock import get_stock_by_ticker
from app.graph.prompts import (
    build_financial_analyst_prompt,
    build_general_assistant_prompt,
)
from app.graph.state import AgentState
from app.schemas.retrieved_document import RetrievedDocument
from app.services.intent_router import Intent, IntentRouter, uses_rag
from app.services.llm_service import LLMService
from app.services.providers.failover_provider import ProviderUnavailableError
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
    """LangGraph workflow with intent routing before optional RAG.

    Flow:
    classify intent → (optional retrieve) → generate answer via LLM
    failover (Gemini → Groq). Conversation memory is supplied by the
    caller and included in both general and financial prompts.
    """

    def __init__(
        self,
        rag_service: RAGService,
        llm_service: LLMService,
        intent_router: IntentRouter | None = None,
    ):
        """Create the agent graph and compile it once."""
        self.rag_service = rag_service
        self.llm_service = llm_service
        self.intent_router = intent_router or IntentRouter()

        graph = StateGraph(AgentState)

        graph.add_node("classify_intent", self._classify_intent)
        graph.add_node("retrieve_context", self._retrieve_context)
        graph.add_node("generate_answer", self._generate_answer)

        graph.add_edge(START, "classify_intent")
        graph.add_conditional_edges(
            "classify_intent",
            self._route_after_intent,
            {
                "retrieve_context": "retrieve_context",
                "generate_answer": "generate_answer",
            },
        )
        graph.add_edge("retrieve_context", "generate_answer")
        graph.add_edge("generate_answer", END)

        self.graph = graph.compile()

    def _classify_intent(self, state: AgentState) -> AgentState:
        """Classify the turn and decide whether retrieval is needed."""
        intent = self.intent_router.classify(
            state["db"],
            state["question"],
            state["history"],
        )
        rag = uses_rag(intent)
        logger.info(
            "Agent route: intent=%s path=%s",
            intent.value,
            "RAG" if rag else "General LLM",
        )
        return {
            **state,
            "intent": intent.value,
            "use_rag": rag,
            "context": "",
            "sources": [],
        }

    def _route_after_intent(self, state: AgentState) -> str:
        """Return the next node name after intent classification."""
        if state["use_rag"]:
            return "retrieve_context"
        return "generate_answer"

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
        """Generate an answer using the prompt selected by intent."""
        prompt = self._build_prompt(state)

        started = time.perf_counter()
        try:
            answer = self.llm_service.generate(prompt)
        except (ProviderUnavailableError, genai_errors.APIError) as exc:
            logger.warning(
                "AI answer generation failed; returning graceful fallback: %s",
                exc,
            )
            answer = _GEMINI_UNAVAILABLE_ANSWER
        answer_ms = (time.perf_counter() - started) * 1000
        logger.info(
            "Answer generation: %.0f ms intent=%s use_rag=%s",
            answer_ms,
            state.get("intent"),
            state.get("use_rag"),
        )

        return {
            **state,
            "answer": answer,
        }

    @staticmethod
    def _build_prompt(state: AgentState) -> str:
        """Select the general or financial prompt from graph state."""
        if state["use_rag"]:
            return build_financial_analyst_prompt(
                question=state["question"],
                history=state["history"],
                profile=state["profile"],
                context=state["context"],
            )
        return build_general_assistant_prompt(
            question=state["question"],
            history=state["history"],
            profile=state["profile"],
        )

    def prepare(
        self,
        db: Session,
        question: str,
        history: str,
        profile: str,
    ) -> tuple[str, list[RetrievedDocument], str, bool]:
        """Run intent routing and optional RAG; return prompt + metadata.

        Returns ``(prompt, sources, intent, use_rag)``. Does not call the LLM.
        """
        state: AgentState = {
            "question": question,
            "history": history,
            "profile": profile,
            "db": db,
            "intent": Intent.GENERAL_CHAT.value,
            "use_rag": False,
            "context": "",
            "sources": [],
            "answer": "",
        }
        state = self._classify_intent(state)
        if state["use_rag"]:
            state = self._retrieve_context(state)
        prompt = self._build_prompt(state)
        return prompt, state["sources"], state["intent"], state["use_rag"]

    def stream(
        self,
        db: Session,
        question: str,
        history: str,
        profile: str,
    ) -> tuple[Iterator[str], list[RetrievedDocument]]:
        """Prepare the turn and return a token iterator plus sources.

        Retrieval/prompt construction complete before streaming begins.
        Provider failover remains inside ``llm_service.stream``.
        """
        prompt, sources, intent, use_rag = self.prepare(
            db=db,
            question=question,
            history=history,
            profile=profile,
        )

        def token_iter() -> Iterator[str]:
            started = time.perf_counter()
            try:
                yield from self.llm_service.stream(prompt)
            except (ProviderUnavailableError, genai_errors.APIError) as exc:
                logger.warning(
                    "AI stream generation failed; returning graceful fallback: %s",
                    exc,
                )
                yield _GEMINI_UNAVAILABLE_ANSWER
            answer_ms = (time.perf_counter() - started) * 1000
            logger.info(
                "Answer stream: %.0f ms intent=%s use_rag=%s",
                answer_ms,
                intent,
                use_rag,
            )

        return token_iter(), sources

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
                "intent": Intent.GENERAL_CHAT.value,
                "use_rag": False,
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
