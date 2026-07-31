# 1. AI System Overview

The AI subsystem is the core intelligence layer of the Sentellent platform. It combines Retrieval-Augmented Generation (RAG), LangGraph workflows, long-term investor memory, and personalized recommendation capabilities to provide grounded, explainable financial insights.

The AI system retrieves relevant company fundamentals, financial news, and investor preferences before generating responses. Every recommendation is supported by retrieved evidence, ensuring transparency and minimizing hallucinations.

### Primary Responsibilities

- Process natural language financial queries.
- Retrieve relevant documents from the vector store.
- Generate grounded responses using retrieved context.
- Maintain long-term investor memory.
- Build and update investor personas.
- Generate personalized stock recommendations.
- Provide citations for every AI-generated claim.
- Reject unsupported or unverifiable financial information.

---

# 2. Design Goals

The AI subsystem is designed to achieve the following objectives.

## Functional Goals

- Support Retrieval-Augmented Generation (RAG).
- Learn investor preferences over time.
- Generate personalized stock recommendations.
- Retrieve company fundamentals and financial news.
- Provide grounded responses with citations.
- Update investor memory automatically.
- Analyze sentiment from financial news.

## Non-Functional Goals

- Minimize hallucinations.
- Optimize retrieval latency.
- Support concurrent AI requests.
- Reduce unnecessary LLM calls.
- Maintain scalable AI workflows.
- Enable future model upgrades.
- Ensure reliable and explainable outputs.

# 3. AI Architecture

The AI subsystem follows a modular architecture where each component performs a dedicated responsibility.

```text
User Query
      │
      ▼
LangGraph Orchestrator
      │
      ├───────────────┐
      ▼               ▼
Memory          Query Analysis
      │               │
      ▼               ▼
Retriever    Prompt Builder
      │               │
      └───────┬───────┘
              ▼
OpenAI GPT-5.5
              │
              ▼
Citation Generator
              │
              ▼
Grounded Response
```

### Core Components

- LangGraph Orchestrator
- Query Analyzer
- Investor Memory Manager
- Document Retriever
- Prompt Builder
- OpenAI GPT-5.5
- Citation Generator
- Recommendation Engine
- Response Formatter

# 4. LangGraph Workflow

The AI system uses **LangGraph** as the orchestration framework to manage multi-step reasoning, retrieval, memory updates, and response generation. Each node in the workflow performs a dedicated responsibility while maintaining a clear execution path.

## Workflow Stages

1. Receive user query.
2. Retrieve investor memory.
3. Analyze user intent.
4. Retrieve relevant documents.
5. Build contextual prompt.
6. Generate AI response.
7. Generate citations.
8. Update investor memory if required.
9. Return grounded response.

## Workflow Principles

- Execute modular processing nodes.
- Support conditional execution paths.
- Minimize unnecessary LLM calls.
- Maintain conversation context.
- Enable future workflow expansion.

---

# 5. Agent Components

The AI system is composed of specialized components responsible for different stages of the reasoning process.

| Component | Responsibility |
|------------|---------------|
| LangGraph Orchestrator | Controls workflow execution |
| Query Analyzer | Determines user intent |
| Memory Manager | Retrieves and updates investor memory |
| Retriever | Searches relevant documents |
| Prompt Builder | Builds contextual prompts |
| LLM | Generates grounded responses |
| Citation Generator | Produces supporting citations |
| Recommendation Engine | Generates personalized recommendations |
| Response Formatter | Formats final API response |

Each component operates independently while collaborating through the LangGraph execution graph.

---

# 6. Retrieval-Augmented Generation (RAG)

The platform follows the Retrieval-Augmented Generation (RAG) approach to improve response accuracy and reduce hallucinations.

## RAG Workflow

1. Receive user query.
2. Generate query embedding.
3. Search the vector database.
4. Retrieve relevant news and fundamentals.
5. Rank retrieved documents.
6. Build contextual prompt.
7. Generate AI response.
8. Attach citations.
9. Return grounded response.

## Retrieval Sources

The retriever searches across multiple knowledge sources.

- Company fundamentals.
- Financial news articles.
- Investor memory.
- Historical conversations.
- Stock metadata.

## Retrieval Objectives

- Retrieve only relevant documents.
- Prioritize recent financial information.
- Minimize retrieval latency.
- Prevent duplicate retrieval.
- Support explainable AI responses.

---

# 7. Document Ingestion Pipeline

The ingestion pipeline continuously prepares financial data for Retrieval-Augmented Generation.

## Ingestion Workflow

1. User follows a stock.
2. Retrieve company fundamentals.
3. Retrieve financial news.
4. Clean raw data.
5. Split documents into chunks.
6. Generate vector embeddings.
7. Store chunks in PostgreSQL.
8. Store embeddings in pgvector.
9. Generate article metadata.
10. Perform sentiment analysis.
11. Update stock knowledge base.

## Ingestion Responsibilities

- Fetch company fundamentals.
- Fetch recent financial news.
- Normalize structured data.
- Remove duplicate articles.
- Generate document embeddings.
- Store searchable vectors.
- Tag article sentiment.
- Extract mentioned companies.
- Maintain ingestion history.

## Ingestion Design Principles

- Support concurrent ingestion jobs.
- Prevent duplicate document indexing.
- Ensure idempotent processing.
- Validate incoming data.
- Retry failed ingestion tasks.
- Maintain audit logs.

# 8. Investor Memory System

The Investor Memory System enables the AI agent to learn, retain, and utilize long-term user preferences across conversations. Memory is continuously updated from user interactions and AI-driven information extraction to deliver personalized investment recommendations.

## Memory Sources

Investor memory is constructed from multiple sources.

- User profile information.
- Investment preferences.
- Conversation history.
- Explicit user instructions.
- Extracted investor characteristics.
- Historical recommendations.
- User feedback.

## Memory Categories

| Memory Type | Description |
|-------------|-------------|
| Risk Profile | Conservative, Moderate, Aggressive |
| Investment Style | Growth, Value, Dividend, Momentum |
| Sector Preferences | Preferred and avoided sectors |
| Financial Constraints | Budget and investment limits |
| Portfolio Preferences | Preferred company characteristics |
| Conversation Context | Previous discussions |
| Recommendation History | Previously suggested stocks |

## Memory Operations

- Create new investor memory.
- Retrieve existing memory.
- Update investor preferences.
- Merge duplicate information.
- Remove obsolete memory.
- Maintain conversation continuity.

## Memory Design Principles

- Persist memory across sessions.
- Retrieve only relevant memories.
- Support incremental updates.
- Avoid duplicate memory entries.
- Protect user privacy.
- Ensure efficient retrieval.

---

# 9. Persona Extraction

The AI system automatically extracts investor characteristics from conversations and transforms them into a structured investor persona.

## Persona Extraction Workflow

1. Analyze user conversation.
2. Identify investment preferences.
3. Detect financial constraints.
4. Extract risk tolerance.
5. Identify preferred sectors.
6. Update investor memory.
7. Store structured persona.

## Extracted Attributes

- Risk tolerance.
- Investment strategy.
- Dividend preference.
- Growth preference.
- Value investing preference.
- Preferred sectors.
- Avoided sectors.
- Debt tolerance.
- Investment horizon.
- Preferred market capitalization.

## Example

User Input

```
I prefer dividend-paying companies and avoid businesses with high debt.
```

Extracted Persona

```json
{
  "investment_style": "Dividend",
  "avoid_high_debt": true,
  "risk_profile": "Conservative"
}
```

---

# 10. Recommendation Engine

The Recommendation Engine generates personalized stock recommendations by combining investor memory, company fundamentals, financial news, and Retrieval-Augmented Generation.

## Recommendation Workflow

1. Retrieve investor persona.
2. Retrieve company fundamentals.
3. Retrieve financial news.
4. Retrieve stock sentiment.
5. Apply investor rules.
6. Rank candidate stocks.
7. Generate recommendations.
8. Provide supporting citations.

## Recommendation Inputs

- Investor memory.
- Company fundamentals.
- Financial news.
- Market sentiment.
- Historical interactions.
- User investment preferences.

## Ranking Factors

| Factor | Purpose |
|---------|---------|
| Investor Profile | Match user preferences |
| Company Fundamentals | Evaluate financial strength |
| News Sentiment | Assess recent developments |
| Risk Compatibility | Match risk tolerance |
| Industry Preference | Prioritize preferred sectors |
| Recommendation Confidence | Measure recommendation quality |

## Recommendation Principles

- Personalize recommendations.
- Prioritize grounded evidence.
- Explain recommendation rationale.
- Include supporting citations.
- Respect investor constraints.
- Avoid unsupported suggestions.

---

# 11. Prompt Engineering Strategy

The AI system uses structured prompts to ensure consistent, grounded, and explainable responses.

## Prompt Components

- System instructions.
- User query.
- Retrieved documents.
- Investor memory.
- Conversation history.
- Citation requirements.
- Response guidelines.

## Prompt Objectives

- Minimize hallucinations.
- Encourage factual responses.
- Reference retrieved evidence.
- Personalize recommendations.
- Produce concise explanations.
- Follow financial domain terminology.

## Prompt Design Principles

- Separate system and user prompts.
- Include only relevant context.
- Limit prompt size.
- Prioritize retrieved information.
- Avoid conflicting instructions.
- Encourage citation generation.

# 12. AI Response Generation

The AI system generates responses by combining retrieved documents, investor memory, and user queries through the LangGraph workflow.

## Response Generation Workflow

1. Receive user query.
2. Retrieve investor memory.
3. Retrieve relevant documents.
4. Build contextual prompt.
5. Generate response using the LLM.
6. Validate generated content.
7. Attach supporting citations.
8. Return structured response.

## Response Characteristics

- Grounded in retrieved data.
- Personalized using investor memory.
- Supported by citations.
- Financial figures presented in INR.
- Concise and easy to understand.
- Consistent across conversations.

---

# 13. Citation Strategy

Every AI-generated recommendation or financial claim must be traceable to a retrieved source.

## Citation Sources

- Company fundamentals.
- Financial news articles.
- Investor memory (where applicable).
- Retrieved knowledge base documents.

## Citation Principles

- Cite every financial claim.
- Reference the originating document.
- Avoid unsupported statements.
- Preserve source transparency.
- Support explainable recommendations.

## Example Citation

```text
Recommendation:
TCS demonstrates strong earnings growth.

Sources:
• Q1 Financial Report
• Economic Times – TCS Earnings Analysis
```

---

# 14. Anti-Hallucination Strategy

The AI system minimizes hallucinations by ensuring responses are generated only from verified, retrieved information.

## Prevention Techniques

- Require document retrieval before generation.
- Reject unsupported financial claims.
- Validate retrieved context.
- Prioritize structured company fundamentals.
- Use citations for every recommendation.
- Prevent fabricated numerical values.

## Unsupported Queries

If sufficient supporting information is unavailable, the AI responds with an appropriate message.

Example

```
I do not have sufficient information in the retrieved data to answer this question accurately.
```

---

# 15. AI Safety & Guardrails

The AI system follows safety mechanisms to improve reliability and user trust.

## Guardrails

- Restrict responses to retrieved knowledge.
- Prevent prompt injection attacks.
- Ignore conflicting user instructions.
- Protect investor-specific information.
- Validate generated recommendations.
- Avoid speculative financial advice.
- Prevent exposure of internal system prompts.

## Responsible AI Principles

- Transparency.
- Explainability.
- Privacy.
- Reliability.
- Security.
- Fairness.

---

# 16. Performance Optimization

The AI subsystem is optimized for efficiency and scalability.

## Optimization Strategies

- Cache reusable embeddings.
- Reuse previously indexed documents.
- Avoid redundant retrieval operations.
- Deduplicate overlapping news articles.
- Minimize unnecessary LLM calls.
- Retrieve only relevant context.
- Support concurrent request execution.

## Performance Objectives

- Low response latency.
- Efficient vector retrieval.
- Reduced computational cost.
- Scalable AI processing.
- Consistent response quality.

---

# 17. Model Selection

The AI platform uses specialized models for different stages of the workflow.

| Component | Selected Model |
|-----------|----------------|
| Language Model | OpenAI GPT-5.5 |
| Embedding Model | OpenAI Embedding Model |
| Orchestration | LangGraph |
| Vector Search | pgvector |
| Sentiment Analysis | OpenAI GPT-5.5 |
| Recommendation Logic | Hybrid Rule-Based + LLM |

## Model Selection Criteria

- High reasoning capability.
- Reliable financial language understanding.
- Efficient embedding generation.
- Strong retrieval compatibility.
- Easy integration with LangGraph.

---

# 18. Monitoring & Evaluation

The AI subsystem is continuously monitored to ensure reliability and performance.

## Monitoring Metrics

- Response latency.
- Retrieval latency.
- Vector search accuracy.
- Citation coverage.
- Recommendation quality.
- Memory update success rate.
- Error rate.
- API throughput.

## Evaluation Criteria

- Grounded responses.
- Citation accuracy.
- Recommendation relevance.
- Retrieval precision.
- User satisfaction.
- Response consistency.

---

# 19. Future AI Enhancements

Potential future enhancements include:

- Multi-agent collaboration.
- Real-time market monitoring.
- Portfolio optimization.
- Explainable recommendation scoring.
- Streaming AI responses.
- Multilingual financial assistance.
- Personalized market alerts.
- Reinforcement learning from user feedback.
- Support for additional financial markets.
- Advanced portfolio risk analysis.

---

# 20. AI Summary

The AI subsystem combines LangGraph orchestration, Retrieval-Augmented Generation, investor memory, and personalized recommendation logic to provide grounded and explainable financial assistance.

Key characteristics include:

- LangGraph workflow orchestration.
- Retrieval-Augmented Generation (RAG).
- Long-term investor memory.
- Automated persona extraction.
- Personalized recommendations.
- Grounded responses with citations.
- Anti-hallucination safeguards.
- Scalable AI architecture.
- Efficient retrieval and indexing.
- Modular and extensible design.

---

# Appendix A – Prompt Design Principles

The following principles guide prompt engineering throughout the AI system.

- Separate system and user instructions.
- Include only relevant retrieved context.
- Prioritize factual information.
- Encourage concise responses.
- Require supporting citations.
- Minimize unnecessary prompt length.
- Avoid conflicting instructions.
- Use structured financial terminology.
- Maintain consistent response formatting.

Consistent prompt engineering improves response quality, explainability, and reliability.

---

# Appendix B – AI Best Practices

The following best practices guide AI implementation and maintenance.

- Always retrieve documents before generation.
- Ground every recommendation in retrieved evidence.
- Provide citations for financial claims.
- Reject unsupported or unverifiable information.
- Keep investor memory updated incrementally.
- Reuse cached embeddings where appropriate.
- Deduplicate overlapping financial news.
- Design retrieval workflows for scalability.
- Protect investor privacy and sensitive data.
- Monitor model performance and response quality.
- Regularly evaluate retrieval accuracy.
- Update prompts as system capabilities evolve.
- Log AI decisions for debugging and auditing.
- Optimize LLM usage to reduce latency and cost.
- Continuously review AI safety and security measures.

## Automatic Memory Updates

The AI system updates memory from multiple sources.

### User-Driven Updates

- Investor preferences.
- Risk tolerance.
- Investment strategy.
- Financial constraints.

### Data-Driven Updates

- Company sentiment.
- Market events.
- Financial indicators.
- News impact.
- Company-specific facts.

These updates occur automatically during document ingestion without requiring explicit user interaction.

# News Intelligence Extraction

Each ingested financial article is analyzed to extract structured metadata.

## Extracted Information

- Overall sentiment.
- Company sentiment.
- Event type.
- Mentioned companies.
- Financial metrics.
- Risk indicators.
- Market impact.
- Confidence score.

The extracted metadata is stored alongside document embeddings to improve retrieval and recommendation quality.

# Efficient Retrieval Strategy

The AI system minimizes unnecessary computation through optimized retrieval techniques.

## Optimization Techniques

- Cache generated embeddings.
- Reuse existing document vectors.
- Perform incremental indexing.
- Retrieve only relevant document subsets.
- Apply similarity search before LLM inference.
- Rank documents using deterministic algorithms.
- Avoid repeated embedding generation.
- Reduce redundant LLM invocations.

# Concurrent Ingestion Strategy

The ingestion pipeline supports multiple concurrent ingestion jobs without compromising data integrity.

## Design Principles

- Idempotent ingestion.
- Duplicate article detection.
- Transactional database updates.
- Safe vector indexing.
- Retry failed jobs.
- Prevent race conditions.
- Lock shared resources where required.
- Maintain ingestion history.

## Recommendation Score

Recommendations are ranked using multiple signals.

- Investor persona similarity.
- Company fundamentals.
- Recent news sentiment.
- Financial quality.
- Risk compatibility.
- Sector preference.
- Confidence score.

Higher combined scores produce higher recommendation rankings.

## Memory Lifecycle

1. Extract information.
2. Validate memory.
3. Store memory.
4. Retrieve relevant memory.
5. Update memory.
6. Archive obsolete memory.

## AI Quality Metrics

- Retrieval Precision
- Retrieval Recall
- Citation Coverage
- Hallucination Rate
- Memory Accuracy
- Recommendation Precision
- Response Latency
- Token Usage

# Appendix C – AI Engineering Best Practices

The following best practices guide AI implementation.

- Always retrieve before generation.
- Never fabricate financial data.
- Every recommendation must include citations.
- Cache reusable embeddings.
- Perform incremental document indexing.
- Avoid duplicate embeddings.
- Design ingestion to be idempotent.
- Prevent race conditions during concurrent ingestion.
- Use deterministic ranking before LLM inference.
- Minimize unnecessary LLM calls.
- Keep investor memory synchronized.
- Continuously evaluate retrieval quality.