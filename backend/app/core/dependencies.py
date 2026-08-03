"""Application-level singleton instances for the AI stack.

Objects are created once at module import so FastAPI endpoints can
reuse the same embedding model, Gemini client, and compiled agent
graph without reloading them on every request.
"""

from app.core.config import settings
from app.graph.agent_graph import AgentGraph
from app.services.conversation_formatter_service import (
    ConversationFormatterService,
)
from app.services.conversation_service import ConversationService
from app.services.investor_profile_embedding_service import (
    InvestorProfileEmbeddingService,
)
from app.services.investor_profile_formatter_service import (
    InvestorProfileFormatterService,
)
from app.services.investor_profile_service import InvestorProfileService
from app.services.llm_service import LLMService
from app.services.preference_extraction_service import (
    PreferenceExtractionService,
)
from app.services.preference_parser_service import PreferenceParserService
from app.services.providers.provider_factory import create_llm_provider
from app.services.providers.sentence_transformer_provider import (
    SentenceTransformerProvider,
)
from app.services.rag_service import RAGService
from app.services.retriever_service import RetrieverService

embedding_provider = SentenceTransformerProvider()
retriever_service = RetrieverService(embedding_provider)
rag_service = RAGService(retriever_service)

llm_provider = create_llm_provider()
llm_service = LLMService(llm_provider)

agent_graph = AgentGraph(
    rag_service=rag_service,
    llm_service=llm_service,
)

conversation_formatter_service = ConversationFormatterService()
preference_extraction_service = PreferenceExtractionService(llm_service)
preference_parser_service = PreferenceParserService()
investor_profile_formatter_service = InvestorProfileFormatterService()
investor_profile_embedding_service = InvestorProfileEmbeddingService(
    formatter=investor_profile_formatter_service,
    embedding_provider=embedding_provider,
)
investor_profile_service = InvestorProfileService(
    profile_embedding_service=investor_profile_embedding_service,
)

conversation_service = ConversationService(
    agent_graph=agent_graph,
    formatter=conversation_formatter_service,
    preference_extraction_service=preference_extraction_service,
    preference_parser_service=preference_parser_service,
    investor_profile_service=investor_profile_service,
    profile_formatter=investor_profile_formatter_service,
)


def get_agent_graph() -> AgentGraph:
    """Return the singleton compiled AgentGraph instance."""
    return agent_graph


def get_conversation_service() -> ConversationService:
    """Return the singleton ConversationService instance."""
    return conversation_service


def get_investor_profile_service() -> InvestorProfileService:
    """Return the singleton InvestorProfileService instance."""
    return investor_profile_service
