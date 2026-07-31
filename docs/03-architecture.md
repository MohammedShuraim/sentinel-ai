## 1. Architecture Overview

The Sentinel AI platform follows a modular cloud-native architecture based on a separation of concerns between the frontend, backend, AI orchestration layer, database, and cloud infrastructure.

The system is designed as a production-ready application that allows investors to research Indian equities using Retrieval-Augmented Generation (RAG). Rather than relying solely on a Large Language Model, the application retrieves relevant company fundamentals and financial news before generating grounded responses with citations.

The architecture emphasizes scalability, maintainability, fault isolation, cloud deployment, Infrastructure as Code (Terraform), containerization (Docker), automated CI/CD pipelines, and long-term contextual memory for investor personalization.

Each major responsibility is isolated into independent layers so that future enhancements can be implemented without affecting unrelated parts of the system.

## 2. Design Goals

The architecture has been designed with the following goals:

- Modular design
- Cloud-native deployment
- Retrieval-Augmented Generation
- Long-term investor memory
- Production-ready infrastructure
- Automated deployment
- High maintainability
- Scalability
- Secure authentication
- Reliable data ingestion
- Efficient vector retrieval
- Minimal hallucination
- Transparent citations
- Easy testing
- Extensibility for future AI capabilities

                    +----------------------+
                    |       User           |
                    +----------+-----------+
                               |
                               v
                    +----------------------+
                    |     Next.js UI       |
                    +----------+-----------+
                               |
                               v
                    +----------------------+
                    |   FastAPI Backend    |
                    +----------+-----------+
                               |
         +---------------------+----------------------+
         |                     |                      |
         v                     v                      v
 +----------------+   +----------------+   +----------------+
 | Authentication |   | Stock Service  |   |  AI Service    |
 +----------------+   +----------------+   +----------------+
                                                 |
                                                 v
                                        +------------------+
                                        | LangGraph Agent  |
                                        +--------+---------+
                                                 |
                              +------------------+------------------+
                              |                                     |
                              v                                     v
                    +------------------+                 +------------------+
                    | Retriever        |                 | Memory Manager   |
                    +--------+---------+                 +--------+---------+
                             |                                    |
                             v                                    v
                    +------------------+                 +------------------+
                    | PostgreSQL +     |                 | Persona Memory   |
                    | pgvector         |                 +------------------+
                    +--------+---------+
                             |
                             v
                    +------------------+
                    | OpenAI GPT-5.5   |
                    +--------+---------+
                             |
                             v
                    +------------------+
                    | Grounded Response|
                    +------------------+

                    ## 4. System Components

### 4.1 Frontend

Responsibilities

- User authentication
- Dashboard
- Watchlist management
- Chat interface
- Portfolio view
- Settings
- Display citations
- Display recommendations

Technology

- Next.js
- React
- TypeScript

---

### 4.2 Backend

Responsibilities

- Authentication
- REST APIs
- Business logic
- Scheduler
- Data ingestion
- Recommendation engine
- Database access

Technology

- FastAPI

---

### 4.3 AI Layer

Responsibilities

- LangGraph workflow
- RAG
- Memory
- Prompt orchestration
- Citation generation
- Stock recommendation

---

### 4.4 Database Layer

Responsibilities

- Store users
- Store stocks
- Store news
- Store embeddings
- Store memories
- Store conversations

Technology

- PostgreSQL
- pgvector

---

### 4.5 Infrastructure Layer

Responsibilities

- Deployment
- Scaling
- Networking
- Monitoring
- Logging
- CI/CD

Technology

- AWS
- Terraform
- Docker
- GitHub Actions

## 5. Component Interaction

The Sentinel AI platform follows a layered, service-oriented architecture where each component is responsible for a specific domain. Components communicate through well-defined APIs and interfaces, ensuring loose coupling, maintainability, and scalability.

### 5.1 Frontend Layer

The frontend provides the user interface and communicates exclusively with the backend APIs.

Responsibilities:

- Google OAuth login
- Dashboard
- Watchlist management
- Stock search
- AI chat interface
- Portfolio recommendations
- Investor profile management
- Display grounded citations
- Display conversation history

Technologies:

- Next.js
- React
- TypeScript
- Tailwind CSS

---

### 5.2 Backend Layer

The backend acts as the application's orchestration layer.

Responsibilities:

- User authentication
- Business logic
- API endpoints
- Stock management
- News ingestion
- Scheduler
- AI orchestration
- Memory management
- Recommendation engine
- Database communication

Technology:

- FastAPI

---

### 5.3 AI Layer

The AI layer is responsible for reasoning and intelligent decision making.

Responsibilities:

- LangGraph workflow execution
- Retrieval-Augmented Generation
- Prompt orchestration
- Investor memory retrieval
- Citation generation
- Recommendation generation
- Anti-hallucination validation

Technologies:

- LangGraph
- LangChain
- OpenAI GPT-5.5

---

### 5.4 Database Layer

The database layer stores both structured and vector data.

Responsibilities:

- User accounts
- Stocks
- Company fundamentals
- Financial news
- Embeddings
- Investor personas
- Conversation history
- Metadata

Technologies:

- PostgreSQL
- pgvector

---

### 5.5 Infrastructure Layer

Infrastructure services provide production deployment and operational support.

Responsibilities:

- Container orchestration
- Networking
- Infrastructure provisioning
- Monitoring
- Logging
- CI/CD
- Cloud deployment

Technologies:

- AWS
- Docker
- Terraform
- GitHub Actions

---

## 6. User Request Flow

The following workflow illustrates how a user request is processed throughout the system.

```
User
        │
        ▼
Next.js Frontend
        │
        ▼
FastAPI Backend
        │
        ▼
Authentication Check
        │
        ▼
LangGraph Agent
        │
        ▼
Memory Retrieval
        │
        ▼
Retriever
        │
        ▼
Vector Database
        │
        ▼
Company Fundamentals
        │
        ▼
Financial News
        │
        ▼
Context Builder
        │
        ▼
OpenAI GPT-5.5
        │
        ▼
Citation Generator
        │
        ▼
Grounded Response
        │
        ▼
Frontend
        │
        ▼
User
```

### Processing Steps

1. User opens the application.
2. User authenticates using Google OAuth.
3. User selects or follows a stock.
4. User asks a financial question.
5. Backend validates authentication.
6. LangGraph loads investor memory.
7. Retriever searches the vector database.
8. Company fundamentals are retrieved.
9. Financial news is retrieved.
10. Context is assembled.
11. Prompt is generated.
12. GPT generates a response.
13. Citation service attaches supporting evidence.
14. Response is returned to the frontend.

---

## 7. Authentication Flow

Authentication uses Google OAuth 2.0.

```
User

↓

Google OAuth

↓

Authorization Code

↓

FastAPI Backend

↓

Token Validation

↓

User Lookup

↓

Create User (First Login)

↓

Generate Session

↓

Frontend Dashboard
```

### Authentication Steps

1. User clicks Login.
2. Google authenticates the user.
3. Authorization code is returned.
4. Backend validates the code.
5. Existing user is located.
6. New user profile is created if required.
7. Session token is generated.
8. Frontend stores the secure session.
9. Authenticated requests include the access token.

Security Measures

- OAuth 2.0
- HTTPS
- Secure session tokens
- Environment variable protection
- Backend token validation

---

## 8. Data Ingestion Pipeline

Whenever a user follows a stock, the ingestion pipeline automatically collects financial information and prepares it for Retrieval-Augmented Generation.

```
User Follows Stock
        │
        ▼
Fetch Company Fundamentals
        │
        ▼
Fetch Financial News
        │
        ▼
Duplicate Detection
        │
        ▼
HTML Cleaning
        │
        ▼
Text Normalization
        │
        ▼
Chunk Documents
        │
        ▼
Generate Embeddings
        │
        ▼
Extract Metadata
        │
        ▼
Sentiment Analysis
        │
        ▼
Stock Entity Recognition
        │
        ▼
Store Embeddings
        │
        ▼
Update Stock Metadata
        │
        ▼
Pipeline Complete
```

### Data Processing Steps

The ingestion service performs several preprocessing operations before storing information.

These include:

- HTML cleaning
- Text normalization
- Duplicate removal
- Metadata extraction
- Chunk generation
- Embedding generation
- Sentiment tagging
- Stock entity extraction
- Vector indexing

These preprocessing steps improve retrieval accuracy while reducing duplicate embeddings and unnecessary computation.

---

### Ingestion Features

The ingestion pipeline supports:

- Automatic document chunking
- Automatic embedding generation
- Company metadata extraction
- News sentiment tagging
- Stock entity extraction
- Duplicate prevention
- Idempotent processing
- Concurrent-safe ingestion

Running the ingestion process multiple times with the same source data will not create duplicate records or inconsistent vector indexes.

---

## 9. Retrieval-Augmented Generation (RAG) Pipeline

The RAG pipeline ensures every AI response is grounded in retrieved financial information rather than relying only on the language model.

```
User Question
        │
        ▼
Investor Memory Lookup
        │
        ▼
Vector Search
        │
        ▼
Relevant News Retrieval
        │
        ▼
Relevant Fundamentals Retrieval
        │
        ▼
Context Builder
        │
        ▼
Prompt Construction
        │
        ▼
OpenAI GPT-5.5
        │
        ▼
Grounding Validation
        │
        ▼
Citation Generator
        │
        ▼
Final Response
```

### RAG Workflow

1. User submits a question.
2. Investor memory is retrieved.
3. Vector search retrieves relevant news.
4. Company fundamentals are retrieved.
5. Retrieved context is ranked by relevance.
6. Prompt is assembled.
7. GPT generates the response.
8. Citations are attached.
9. Grounding is verified.
10. Response is returned to the user.

---

### Anti-Hallucination Strategy

The AI assistant follows strict grounding rules.

- Every recommendation must reference retrieved evidence.
- Every numerical value must originate from retrieved data.
- Every recommendation must include supporting citations.
- Unsupported information must never be fabricated.
- If evidence is unavailable, the system responds:

> "I don't have sufficient information in the retrieved data to answer this question."

This approach minimizes hallucinations while improving transparency and user trust.

---

### Citation Strategy

Every generated response contains references to:

- Company fundamentals
- Financial news articles
- Retrieved metadata
- Supporting evidence

This enables users to verify every recommendation generated by the AI assistant.

## 10. Memory Architecture

The memory architecture enables the AI assistant to learn and retain user-specific investment preferences across multiple conversations. Instead of treating every interaction independently, the system builds a long-term investor profile that evolves over time.

### Memory Types

#### 1. Short-Term Memory

Purpose:

Maintain the current conversation context.

Stores:

- Recent user messages
- Recent AI responses
- Active stock ticker
- Current discussion topic

Lifetime:

Current chat session.

---

#### 2. Long-Term Memory

Purpose:

Maintain investor preferences across future sessions.

Stores:

- Risk appetite
- Investment horizon
- Preferred sectors
- Dividend preference
- Growth preference
- Value investing preference
- Companies to avoid
- User-defined investment rules

Examples

"I prefer dividend stocks."

"I avoid companies with high debt."

"I invest for the long term."

---

#### 3. Stock Memory

Stores information related to each followed stock.

Examples

- Recent sentiment
- Important events
- Earnings reports
- Fundamental changes
- News summaries

---

### Memory Workflow

```

User Message

↓

Memory Extractor

↓

Memory Classification

↓

Store Memory

↓

Update Investor Persona

↓

Future Retrieval

```

---

### Memory Update Rules

The system updates memory only when new information provides meaningful investor preferences.

Examples:

- Risk profile changes
- Investment strategy changes
- Sector preferences
- New investment rules

Duplicate memories are ignored.

Contradictory memories replace outdated information.

---

## 11. Recommendation Engine

The recommendation engine combines investor preferences with retrieved financial information to generate personalized stock recommendations.

### Recommendation Inputs

- Investor Persona
- Company Fundamentals
- Financial News
- Market Sentiment
- Risk Profile
- Sector Preference
- Conversation Context

---

### Recommendation Workflow

```

Investor Persona

↓

Retrieve Stocks

↓

Retrieve News

↓

Retrieve Fundamentals

↓

Ranking Algorithm

↓

Business Rules

↓

LLM Explanation

↓

Citations

↓

Recommendation

```

---

### Recommendation Factors

The engine evaluates:

- Company quality
- Revenue growth
- Profitability
- Debt levels
- Dividend history
- Recent news sentiment
- Investor preferences
- Market sector
- Financial stability

---

### Recommendation Rules

The recommendation engine follows deterministic rules before using the language model.

Examples

If user avoids debt

↓

Remove high-debt companies

If user prefers dividends

↓

Increase ranking of dividend-paying companies

If user prefers technology

↓

Prioritize technology stocks

Only after filtering and ranking does the AI generate a natural language explanation.

---

## 12. Database Communication

The backend communicates with PostgreSQL using SQLAlchemy.

### Responsibilities

- User management
- Stock storage
- News storage
- Chat history
- Embeddings
- Memory
- Metadata

---

### Vector Search

The AI layer performs similarity search using pgvector.

The search retrieves:

- Relevant news
- Relevant fundamentals
- Investor memories

Only highly relevant information is sent to the language model.

---

### Database Communication Flow

```

FastAPI

↓

SQLAlchemy

↓

PostgreSQL

↓

pgvector

↓

Retrieved Documents

↓

AI Layer

```

---

## 13. External Integrations

The application integrates with several external services.

### Financial Data

- Screener.in
- NSE India
- yfinance

Purpose

Company fundamentals and historical prices.

---

### Financial News

- Economic Times RSS
- Moneycontrol RSS
- LiveMint RSS
- Business Standard RSS

Purpose

Recent financial news and market sentiment.

---

### AI Services

- OpenAI GPT-5.5
- OpenAI Embeddings

Purpose

Reasoning and semantic retrieval.

---

### Authentication

Google OAuth 2.0

Purpose

Secure user login.

---

## 14. Deployment Architecture

The application is deployed as a cloud-native containerized system.

```

Developer

↓

GitHub

↓

GitHub Actions

↓

Docker Build

↓

Amazon ECR

↓

Terraform

↓

AWS ECS Fargate

↓

Application Load Balancer

↓

FastAPI + Next.js

↓

Amazon RDS PostgreSQL

↓

CloudWatch

```

---

### Deployment Flow

1. Developer pushes code.
2. GitHub Actions starts automatically.
3. Tests are executed.
4. Docker images are built.
5. Images are pushed to Amazon ECR.
6. Terraform provisions infrastructure.
7. ECS updates running containers.
8. CloudWatch collects logs.
9. Application becomes available.

---

## 15. Folder Structure

```

sentinel-ai/

│

├── frontend/

│

├── backend/

│

├── infrastructure/

│

├── docs/

│

├── .github/

│

│ └── workflows/

│

├── docker/

│

├── scripts/

│

├── README.md

│

└── .gitignore

```

### Folder Responsibilities

frontend/

Next.js application.

backend/

FastAPI application.

infrastructure/

Terraform configuration.

docs/

Architecture and design documents.

.github/

CI/CD pipelines.

docker/

Dockerfiles and Compose configuration.

scripts/

Automation scripts.

## 16. Scalability Strategy

The Sentinel AI platform is designed using a horizontally scalable, cloud-native architecture. Each major component can scale independently based on workload.

### Frontend Scalability

The frontend is stateless, allowing multiple application instances to run behind an Application Load Balancer (ALB). Static assets can be cached through a Content Delivery Network (CDN) to reduce latency and improve user experience.

### Backend Scalability

The FastAPI backend is containerized and deployed on AWS ECS Fargate. Since the backend is stateless, additional containers can be launched automatically based on CPU or memory utilization.

### AI Scalability

The AI layer minimizes unnecessary language model calls by:

- Performing vector retrieval before prompt generation.
- Sending only relevant context to the LLM.
- Reusing cached embeddings.
- Reusing stored investor memories.
- Ranking retrieved documents before prompt construction.

### Database Scalability

PostgreSQL stores structured application data, while pgvector enables semantic similarity search.

Scaling strategies include:

- Database indexing
- Read replicas
- Connection pooling
- Optimized SQL queries
- Efficient vector indexes

### Infrastructure Scalability

Infrastructure is managed using Terraform, allowing resources to scale consistently across environments.

The deployment supports:

- Horizontal container scaling
- Auto-scaling policies
- Infrastructure versioning
- Repeatable deployments

---

## 17. Security Architecture

Security is integrated into every layer of the system.

### Authentication Security

- Google OAuth 2.0
- Secure session tokens
- HTTPS communication
- Backend token validation

### API Security

- Authentication required for protected endpoints
- Input validation
- Request validation
- Structured error responses

### Database Security

- Parameterized SQL queries
- Principle of least privilege
- Encrypted database connections
- Regular backups

### Infrastructure Security

- IAM roles with minimal permissions
- Secrets stored securely
- Environment variables for sensitive configuration
- Network isolation using AWS security groups

### AI Security

The AI system never trusts user input directly.

Before processing a request:

- User input is validated.
- Context is retrieved from trusted sources.
- Retrieved information is verified.
- Unsupported claims are rejected.

---

## 18. Error Handling Strategy

The application is designed to fail gracefully while providing meaningful feedback to users.

### API Errors

Examples:

- Invalid authentication
- Missing stock ticker
- Invalid request format
- Unauthorized access

Each API returns:

- HTTP status code
- Error message
- Error identifier
- Timestamp

---

### AI Errors

Possible scenarios include:

- No relevant documents retrieved
- OpenAI API unavailable
- Empty context
- Prompt generation failure

Fallback behavior:

- Inform the user when sufficient information is unavailable.
- Retry transient failures where appropriate.
- Log unexpected errors for investigation.

---

### Data Ingestion Errors

Potential issues:

- Duplicate articles
- Missing metadata
- RSS feed unavailable
- API rate limits

Mitigation strategies:

- Deduplication checks
- Retry policies
- Logging
- Scheduled synchronization jobs

---

### Database Errors

Potential issues:

- Connection failures
- Transaction failures
- Constraint violations

Mitigation strategies:

- Automatic rollback
- Connection pooling
- Health checks
- Monitoring and alerts

---

### Infrastructure Errors

Potential issues:

- Container crash
- Service restart
- Deployment failure

Mitigation strategies:

- Health checks
- Automatic container replacement
- Rolling deployments
- CloudWatch monitoring

---

## 19. Design Decisions

The architecture includes several deliberate design decisions to improve maintainability, scalability, and reliability.

### Decision 1: Next.js + FastAPI

Reason:

Separating the frontend and backend enables independent development, testing, deployment, and scaling.

---

### Decision 2: PostgreSQL + pgvector

Reason:

Using a single database for both relational and vector data simplifies operations while supporting efficient semantic retrieval.

---

### Decision 3: LangGraph

Reason:

LangGraph provides structured AI workflows, memory handling, and multi-step reasoning, making it well-suited for agentic AI applications.

---

### Decision 4: Retrieval-Augmented Generation (RAG)

Reason:

Grounding responses in retrieved financial information reduces hallucinations and improves transparency.

---

### Decision 5: Docker

Reason:

Containerization ensures consistent behavior across development, testing, and production environments.

---

### Decision 6: Terraform

Reason:

Infrastructure as Code enables repeatable, version-controlled cloud deployments.

---

### Decision 7: GitHub Actions

Reason:

Automated testing and deployment reduce manual effort and improve deployment reliability.

---

### Decision 8: Google OAuth

Reason:

Using a trusted identity provider simplifies authentication and improves user security.

---

## 20. Future Improvements

The current architecture provides a strong production-ready foundation while allowing future enhancements.

Potential improvements include:

- Multi-agent collaboration for specialized financial analysis.
- Real-time market data streaming.
- Portfolio optimization algorithms.
- Advanced financial visualization dashboards.
- Voice-enabled AI assistant.
- Mobile application support.
- Multi-language support.
- Notification and alert system.
- Additional financial data providers.
- Explainable AI visualizations.
- User-configurable recommendation strategies.
- Enhanced caching and performance optimization.

---

## 21. Architecture Summary

The Sentinel AI platform follows a modular, cloud-native architecture that combines a modern web frontend, scalable backend services, Retrieval-Augmented Generation (RAG), dynamic investor memory, and production-grade cloud infrastructure.

The design prioritizes:

- Modularity
- Scalability
- Maintainability
- Security
- Reliability
- Personalization
- Grounded AI responses
- Automated deployment

By separating concerns across the frontend, backend, AI orchestration, data storage, and infrastructure layers, the system remains flexible for future enhancements while meeting the requirements of a production-ready AI-powered stock analysis platform.

### User Login

```text
User            Frontend         Google OAuth      Backend         Database
 |                  |                  |               |               |
 | Click Login      |                  |               |               |
 |----------------->|                  |               |               |
 |                  | Redirect         |               |               |
 |                  |----------------->|               |               |
 |                  |                  | Authenticate  |               |
 |                  |                  |-------------->|               |
 |                  |                  |<--------------|               |
 |                  | Authorization Code              |               |
 |                  |<-----------------|               |               |
 |                  |------------------------------->| Validate Token |
 |                  |                                |--------------->|
 |                  |                                | User Lookup    |
 |                  |                                |<---------------|
 |                  |<-------------------------------| Session Token  |
 | Dashboard        |                  |               |               |
```

### AI Stock Analysis Request

```text
User
   |
   | Ask Question
   v
Frontend
   |
   v
FastAPI
   |
   | Validate User
   v
LangGraph
   |
   | Load Memory
   v
Memory Store
   |
   v
Retriever
   |
   | Similarity Search
   v
pgvector
   |
   v
Relevant Documents
   |
   v
Prompt Builder
   |
   v
GPT-5.5
   |
   v
Citation Generator
   |
   v
FastAPI
   |
   v
Frontend
   |
   v
User
```

### Stock Follow Pipeline

```text
User
   |
Follow Stock
   |
   v
Backend
   |
Fetch Fundamentals
   |
Fetch News
   |
Clean Documents
   |
Chunk Documents
   |
Generate Embeddings
   |
Store in pgvector
   |
Update Metadata
   |
Ready for RAG
```

## 23. Non-Functional Requirement Mapping

| Quality Attribute | Architecture Support |
|-------------------|----------------------|
| Scalability | AWS ECS Fargate, Application Load Balancer, Stateless Backend |
| Performance | pgvector Similarity Search, Database Indexing, Efficient Retrieval |
| Reliability | Retry Policies, Health Checks, CloudWatch Monitoring |
| Availability | Auto-Recovery, Managed Cloud Infrastructure |
| Security | Google OAuth, HTTPS, IAM Roles, Secure Environment Variables |
| Maintainability | Modular Layered Architecture |
| Extensibility | LangGraph Workflows, Service-Oriented Design |
| Portability | Docker Containers |
| Observability | CloudWatch Logs and Metrics |
| Cost Optimization | Container Scaling, Infrastructure as Code |
```

## 24. API Request Lifecycle

Every client request passes through a consistent processing pipeline before a response is returned.

```text
Browser

↓

Application Load Balancer

↓

FastAPI

↓

Authentication

↓

Business Logic

↓

AI Services

↓

Database

↓

Response Builder

↓

Frontend
```

### Lifecycle Steps

1. Request reaches the load balancer.
2. Backend authenticates the request.
3. Input is validated.
4. Business logic is executed.
5. AI retrieval is performed if required.
6. Database operations are completed.
7. Response is formatted.
8. JSON response is returned.

## 25. Background Scheduler

The application includes scheduled background jobs to keep financial data fresh and maintain system health.

### Scheduled Tasks

- Refresh company fundamentals
- Refresh financial news
- Remove duplicate documents
- Update embeddings when required
- Clean expired cache
- Archive historical logs
- Health monitoring
- Database maintenance

### Benefits

- Fresh financial information
- Reduced API latency
- Improved retrieval quality
- Better recommendation accuracy

## 26. Logging and Monitoring

System observability is achieved through centralized logging and cloud monitoring.

### Application Logs

- User login events
- API requests
- AI requests
- Retrieval latency
- Database queries
- Recommendation generation
- Failed ingestion jobs

### Infrastructure Logs

- Container health
- ECS deployment events
- Terraform deployments
- CPU utilization
- Memory utilization
- Network traffic

### Monitoring

CloudWatch monitors:

- Service availability
- Error rates
- Response time
- Infrastructure health
- Resource utilization

Alerts can be configured for critical failures to ensure rapid incident response.

## 27. Caching Strategy

Caching reduces unnecessary database access and repeated AI computations.

### Cached Data

- Company fundamentals
- Frequently accessed news
- Embeddings
- Investor profile lookups
- Stock metadata

### Benefits

- Lower latency
- Reduced API calls
- Faster AI responses
- Lower operational cost

### Cache Refresh

Cached data is refreshed automatically based on scheduled ingestion jobs and data update frequency.

## 28. Architecture Constraints and Assumptions

The architecture is designed with the following assumptions.

### Assumptions

- Internet connectivity is available.
- External financial data providers are operational.
- Google OAuth service is available.
- OpenAI services are reachable.
- AWS infrastructure is provisioned correctly.

### Constraints

- Financial APIs may enforce rate limits.
- Market data availability depends on external providers.
- AI responses are limited to retrieved knowledge.
- Embedding quality depends on document quality.
- Infrastructure costs increase with application scale.

These assumptions help define the operational boundaries of the system and guide future enhancements.