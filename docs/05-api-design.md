# 1. API Overview

The API layer provides a secure and standardized interface between the frontend application, backend services, AI components, and the database. It enables authentication, user management, watchlist management, AI-powered conversations, financial data retrieval, investor memory management, and personalized investment recommendations.

The API is implemented using **FastAPI** and follows REST architectural principles with JSON-based communication. All endpoints are secured using Google OAuth 2.0 and JWT authentication while maintaining stateless request processing.

### Primary Responsibilities

- Authenticate users using Google OAuth 2.0.
- Manage user profiles and investment preferences.
- Support AI-powered financial conversations.
- Provide company fundamentals and financial news.
- Manage personalized watchlists.
- Generate personalized investment recommendations.
- Store and retrieve investor memory.
- Return standardized JSON responses.

---

# 2. API Design Goals

The API has been designed to achieve the following objectives.

## Functional Goals

- Provide secure authentication and authorization.
- Support AI-powered financial conversations.
- Enable watchlist management.
- Deliver company fundamentals and financial news.
- Store and retrieve investor memory.
- Generate grounded AI recommendations.
- Support future API expansion.

## Non-Functional Goals

- High performance and low latency.
- Stateless request processing.
- Horizontal scalability.
- High availability.
- Consistent response formats.
- Comprehensive API documentation.
- Secure communication over HTTPS.
- Easy maintainability and extensibility.

---

# 3. API Architecture

The API follows a layered architecture to separate responsibilities and improve maintainability.

```text
Client
   │
   ▼
Authentication Middleware
   │
   ▼
FastAPI Router
   │
   ▼
Business Service Layer
   │
   ├──────────────┐
   ▼              ▼
Database      LangGraph AI
   │              │
   └──────┬───────┘
          ▼
Business Logic
          │
          ▼
JSON Response
```

Each layer performs a dedicated responsibility.

- Authentication validates user identity.
- API Router maps incoming requests.
- Business Services implement application logic.
- LangGraph orchestrates AI workflows.
- PostgreSQL stores structured and vector data.
- JSON responses provide consistent communication with clients.

---

# 4. API Characteristics

The API follows modern REST API best practices.

| Characteristic | Description |
|---------------|-------------|
| API Style | RESTful |
| Communication | HTTPS |
| Data Format | JSON |
| Authentication | Google OAuth 2.0 + JWT |
| Framework | FastAPI |
| Database | PostgreSQL + pgvector |
| AI Framework | LangGraph |
| LLM | OpenAI GPT-5.5 |
| Documentation | OpenAPI (Swagger) |
| Response Format | JSON |

---

# 5. API Consumers

The API is designed to support multiple clients.

- Next.js Web Application
- Administrative Dashboard
- AI Services
- Background Processing Jobs
- Future Mobile Applications
- Future Third-Party Integrations

---

# 6. API Design Principles

The following principles guide the API design.

- Follow RESTful architecture.
- Keep endpoints resource-oriented.
- Use stateless request processing.
- Return consistent JSON responses.
- Validate all incoming requests.
- Separate routing from business logic.
- Centralize exception handling.
- Secure endpoints using JWT authentication.
- Support API versioning.
- Maintain backward compatibility.
- Design for scalability and extensibility.

# 7. Authentication & Authorization

The API uses **Google OAuth 2.0** for user authentication and **JSON Web Tokens (JWT)** for session management. All protected endpoints require a valid JWT access token in the request header.

## Authentication Flow

1. User authenticates using Google OAuth.
2. Google returns an authorization code.
3. Backend validates the authorization code.
4. User information is retrieved from Google.
5. A new user is created if one does not already exist.
6. Backend generates a JWT access token.
7. JWT is returned to the client.
8. Client includes the JWT in subsequent requests.

## Authorization Strategy

- Public endpoints require no authentication.
- Protected endpoints require a valid JWT.
- User-specific resources are accessible only by their owner.
- Administrative endpoints are restricted to authorized roles.
- Unauthorized requests return HTTP 401.
- Forbidden requests return HTTP 403.

## Authorization Header

```http
Authorization: Bearer <jwt_access_token>
```

---

# 8. API Standards

The API follows consistent standards across all endpoints.

## URL Structure

```
/api/v1/<resource>
```

Examples

```
/api/v1/auth/login
/api/v1/chat
/api/v1/watchlist
/api/v1/stocks
/api/v1/recommendations
```

## HTTP Methods

| Method | Purpose |
|---------|---------|
| GET | Retrieve resources |
| POST | Create resources |
| PUT | Replace existing resources |
| PATCH | Partially update resources |
| DELETE | Remove resources |

## Content Type

Request

```http
Content-Type: application/json
```

Response

```http
Content-Type: application/json
```

## Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Resource Created |
| 204 | Resource Deleted |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Resource Not Found |
| 409 | Conflict |
| 422 | Validation Error |
| 429 | Rate Limit Exceeded |
| 500 | Internal Server Error |

---

# 9. REST API Endpoints

The API is organized into logical resource groups.

## Authentication

| Endpoint | Method | Description |
|----------|--------|-------------|
| /api/v1/auth/google | POST | Authenticate using Google OAuth |
| /api/v1/auth/refresh | POST | Refresh JWT token |
| /api/v1/auth/logout | POST | Logout current user |

---

## User

| Endpoint | Method | Description |
|----------|--------|-------------|
| /api/v1/users/me | GET | Retrieve current user profile |
| /api/v1/users/me | PATCH | Update user profile |
| /api/v1/users/preferences | GET | Retrieve investment preferences |
| /api/v1/users/preferences | PUT | Update investment preferences |

---

## Watchlist

| Endpoint | Method | Description |
|----------|--------|-------------|
| /api/v1/watchlist | GET | Retrieve watchlist |
| /api/v1/watchlist | POST | Add stock to watchlist |
| /api/v1/watchlist/{stock_id} | DELETE | Remove stock from watchlist |

---

## Stocks

| Endpoint | Method | Description |
|----------|--------|-------------|
| /api/v1/stocks | GET | Retrieve available stocks |
| /api/v1/stocks/{ticker} | GET | Retrieve company information |
| /api/v1/stocks/{ticker}/news | GET | Retrieve financial news |
| /api/v1/stocks/{ticker}/fundamentals | GET | Retrieve company fundamentals |

---

## AI Chat

| Endpoint | Method | Description |
|----------|--------|-------------|
| /api/v1/chat | POST | Send message to AI assistant |
| /api/v1/chat/history | GET | Retrieve conversation history |

---

## Recommendations

| Endpoint | Method | Description |
|----------|--------|-------------|
| /api/v1/recommendations | GET | Retrieve personalized recommendations |
| /api/v1/recommendations/{ticker} | GET | Retrieve recommendation details |

---

## Health

| Endpoint | Method | Description |
|----------|--------|-------------|
| /api/v1/health | GET | Service health check |
| /api/v1/ready | GET | Readiness probe |
| /api/v1/live | GET | Liveness probe |

# 10. Request & Response Models

The API uses standardized JSON request and response models to ensure consistency across all endpoints. Request validation is performed using Pydantic models, and all responses follow a common response structure.

---

## Standard Request Format

All API requests use the following structure where applicable.

```json
{
  "field": "value"
}
```

Request bodies are validated before business logic execution. Invalid requests return a validation error with detailed field information.

---

## Standard Success Response

Successful API responses follow a consistent format.

```json
{
  "success": true,
  "message": "Request completed successfully.",
  "data": {}
}
```

### Response Fields

| Field | Description |
|--------|-------------|
| success | Indicates whether the request succeeded |
| message | Human-readable response message |
| data | Requested or generated resource |

---

## Standard Error Response

Failed requests return a standardized error response.

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request payload."
  }
}
```

### Error Fields

| Field | Description |
|--------|-------------|
| success | Always false |
| error.code | Machine-readable error code |
| error.message | Human-readable error description |

---

## Authentication Request

Example request for Google OAuth authentication.

```json
{
  "authorization_code": "google_oauth_code"
}
```

Example response.

```json
{
  "success": true,
  "message": "Authentication successful.",
  "data": {
    "access_token": "<jwt_token>",
    "token_type": "Bearer"
  }
}
```

---

## Chat Request

Example request sent by the frontend.

```json
{
  "message": "Should I invest in NVIDIA?",
  "conversation_id": "conversation_uuid"
}
```

Example response.

```json
{
  "success": true,
  "message": "Response generated successfully.",
  "data": {
    "response": "NVIDIA demonstrates strong revenue growth...",
    "citations": [],
    "conversation_id": "conversation_uuid"
  }
}
```

---

## Watchlist Request

Example request.

```json
{
  "ticker": "NVDA"
}
```

Example response.

```json
{
  "success": true,
  "message": "Stock added successfully.",
  "data": {
    "ticker": "NVDA"
  }
}
```

---

## Recommendation Response

Example recommendation.

```json
{
  "success": true,
  "data": {
    "ticker": "NVDA",
    "recommendation": "Buy",
    "confidence": 0.93,
    "reason": "Strong fundamentals and positive earnings outlook."
  }
}
```

---

# 11. Validation Strategy

All incoming requests are validated before reaching the business logic layer.

## Validation Rules

- Validate request schema using Pydantic.
- Reject malformed JSON payloads.
- Validate required fields.
- Validate supported data types.
- Validate enum values.
- Validate UUID formats.
- Validate ticker symbol formats.
- Reject unsupported request parameters.
- Sanitize user input where applicable.

## Business Validation

The API also performs business-level validation.

- Verify authenticated user ownership.
- Verify stock exists.
- Prevent duplicate watchlist entries.
- Validate conversation ownership.
- Validate recommendation eligibility.
- Ensure referenced resources exist.

Validation failures return HTTP 422 or HTTP 400 with descriptive error messages.

---

# 12. Error Handling

The API implements centralized exception handling to provide consistent error responses.

## Error Categories

| Error Type | HTTP Status |
|------------|-------------|
| Validation Error | 422 |
| Authentication Error | 401 |
| Authorization Error | 403 |
| Resource Not Found | 404 |
| Conflict | 409 |
| Rate Limit | 429 |
| Internal Server Error | 500 |

## Error Handling Principles

- Return meaningful error messages.
- Avoid exposing internal implementation details.
- Log unexpected exceptions.
- Include appropriate HTTP status codes.
- Maintain consistent response format.
- Support frontend-friendly error handling.

---

# 13. Pagination, Filtering & Sorting

Collection endpoints support pagination, filtering, and sorting to improve scalability.

## Pagination Parameters

| Parameter | Description |
|-----------|-------------|
| page | Page number |
| limit | Number of records per page |

## Filtering

Supported filtering examples include:

- Sector
- Industry
- Recommendation Type
- Watchlist Status
- Date Range

## Sorting

Supported sorting options include:

- Company Name
- Market Capitalization
- Recommendation Score
- Publication Date
- Confidence Score

Pagination responses include metadata for client-side navigation.

# 14. Rate Limiting & Security

The API implements multiple security mechanisms to protect application resources and ensure reliable service availability.

## Rate Limiting

Rate limiting prevents abuse and ensures fair resource usage.

- Apply request limits per user and IP address.
- Limit authentication requests to prevent brute-force attacks.
- Apply stricter limits to AI-powered endpoints.
- Return HTTP 429 when limits are exceeded.
- Include retry information in rate-limited responses.

## Security Measures

The API follows industry-standard security practices.

- Enforce HTTPS for all communications.
- Use Google OAuth 2.0 for authentication.
- Secure endpoints using JWT access tokens.
- Validate all incoming requests.
- Sanitize user input.
- Prevent SQL Injection using parameterized queries.
- Prevent Cross-Site Scripting (XSS).
- Implement Cross-Origin Resource Sharing (CORS) policies.
- Store sensitive secrets using environment variables.
- Log security-related events for auditing.

---

# 15. API Versioning

API versioning enables backward compatibility while supporting future enhancements.

## Versioning Strategy

The API uses URL-based versioning.

Example

```
/api/v1/chat
/api/v1/watchlist
/api/v1/stocks
```

## Versioning Principles

- Introduce breaking changes only in new API versions.
- Maintain backward compatibility whenever possible.
- Clearly document deprecated endpoints.
- Provide migration guidance for future versions.

---

# 16. OpenAPI & Swagger Documentation

FastAPI automatically generates interactive API documentation using the OpenAPI specification.

## Documentation Features

- Interactive Swagger UI.
- OpenAPI specification generation.
- Request and response schemas.
- Authentication support.
- Parameter documentation.
- Response status documentation.
- Example request payloads.
- Example response payloads.

## Documentation Endpoints

| Endpoint | Purpose |
|----------|---------|
| /docs | Swagger UI |
| /redoc | ReDoc Documentation |
| /openapi.json | OpenAPI Specification |

---

# 17. API Testing Strategy

The API is tested to ensure correctness, reliability, security, and performance.

## Unit Testing

- Validate request models.
- Test business services.
- Test authentication logic.
- Test utility functions.

## Integration Testing

- Verify endpoint behavior.
- Test database interactions.
- Test AI service integration.
- Validate authentication workflow.

## Performance Testing

- Measure API response times.
- Evaluate concurrent request handling.
- Test rate limiting.
- Assess scalability under load.

## Security Testing

- Authentication testing.
- Authorization testing.
- Input validation testing.
- SQL Injection testing.
- XSS testing.
- JWT validation testing.

---

# 18. Future API Enhancements

The API has been designed for future extensibility.

Potential improvements include:

- GraphQL support.
- WebSocket-based real-time updates.
- Streaming AI responses.
- Batch processing endpoints.
- Public developer API.
- API usage analytics.
- Multi-language support.
- Fine-grained role-based access control.
- AI model version selection.
- Multi-tenant architecture.

---

# 19. API Summary

The API provides a secure, scalable, and maintainable interface for the Sentellent platform.

Key characteristics include:

- RESTful architecture.
- FastAPI implementation.
- Google OAuth 2.0 authentication.
- JWT-based authorization.
- Standardized JSON responses.
- AI-powered conversational endpoints.
- Retrieval-Augmented Generation (RAG) integration.
- PostgreSQL and pgvector support.
- Comprehensive OpenAPI documentation.
- Scalable and extensible design.

---

# Appendix A – API Naming Conventions

The following conventions are used throughout the API.

- Endpoint names use lowercase and plural resource names.
- URLs use `kebab-case` where applicable.
- Path parameters use descriptive names (e.g., `{ticker}`, `{user_id}`).
- Query parameters use `snake_case`.
- JSON request and response fields use `snake_case`.
- Boolean fields begin with descriptive prefixes (e.g., `is_active`, `has_access`).
- API versions use the `/api/v1/` prefix.

Consistent naming improves readability, maintainability, and developer experience.

---

# Appendix B – API Best Practices

The following best practices guide API implementation and maintenance.

- Follow RESTful design principles.
- Keep endpoints resource-oriented.
- Validate all incoming requests.
- Return consistent JSON responses.
- Use appropriate HTTP status codes.
- Avoid exposing internal implementation details.
- Implement centralized exception handling.
- Use pagination for large datasets.
- Apply rate limiting to prevent abuse.
- Document all public endpoints using OpenAPI.
- Version APIs before introducing breaking changes.
- Monitor API performance and error rates.
- Log requests and critical application events.
- Secure sensitive endpoints using JWT authentication.
- Regularly review and update API security policies.

# 10. API Workflow Mapping

The API is organized around the core workflows defined by the Sentellent platform. Each workflow consists of one or more REST endpoints that collectively support authentication, data ingestion, AI-powered analysis, investor memory, and personalized recommendations.

| Workflow | Primary Endpoints |
|----------|-------------------|
| User Authentication | `/api/v1/auth/google`, `/api/v1/auth/refresh`, `/api/v1/auth/logout` |
| User Profile | `/api/v1/users/me`, `/api/v1/users/preferences` |
| Stock Following | `/api/v1/watchlist` |
| Stock Data Ingestion | `/api/v1/ingest/{ticker}` |
| AI Chat | `/api/v1/chat` |
| Document Retrieval | `/api/v1/retrieve` |
| Investor Memory | `/api/v1/memory` |
| Recommendations | `/api/v1/recommendations/generate` |
| Background Jobs | `/api/v1/jobs` |
| System Monitoring | `/api/v1/health`, `/api/v1/live`, `/api/v1/ready` |

Each workflow follows a secure, stateless request lifecycle while integrating with the LangGraph agent, PostgreSQL database, and vector store.

---

## Stock Ingestion

| Endpoint | Method | Description |
|----------|--------|-------------|
| /api/v1/ingest/{ticker} | POST | Ingest company fundamentals and recent financial news |
| /api/v1/ingest/refresh/{ticker} | POST | Refresh stock data and embeddings |
| /api/v1/ingest/status/{job_id} | GET | Retrieve ingestion job status |

---

## Document Retrieval

| Endpoint | Method | Description |
|----------|--------|-------------|
| /api/v1/retrieve | POST | Retrieve relevant documents from the vector store |
| /api/v1/sources/{message_id} | GET | Retrieve cited sources for an AI response |

---

## Investor Memory

| Endpoint | Method | Description |
|----------|--------|-------------|
| /api/v1/memory | GET | Retrieve investor memory |
| /api/v1/memory | POST | Create investor memory |
| /api/v1/memory | PATCH | Update investor memory |
| /api/v1/memory | DELETE | Remove investor memory |

---

## Background Jobs

| Endpoint | Method | Description |
|----------|--------|-------------|
| /api/v1/jobs | GET | Retrieve scheduled ingestion jobs |
| /api/v1/jobs/refresh | POST | Schedule stock data refresh |
| /api/v1/jobs/{job_id} | GET | Retrieve job execution status |

## Chat Response

Example response.

```json
{
  "success": true,
  "message": "Response generated successfully.",
  "data": {
    "response": "Based on the retrieved company fundamentals and recent financial news, TCS demonstrates stable earnings growth with positive market sentiment.",
    "sources": [
      {
        "title": "Q1 Financial Results",
        "type": "Fundamentals"
      },
      {
        "title": "Economic Times - TCS Earnings",
        "type": "News"
      }
    ],
    "confidence": 0.94,
    "memory_updated": true,
    "conversation_id": "conversation_uuid"
  }
}
```

## Retrieval Response

Example response.

```json
{
  "success": true,
  "data": {
    "documents": [
      {
        "title": "Annual Report",
        "relevance_score": 0.96
      },
      {
        "title": "Economic Times News",
        "relevance_score": 0.91
      }
    ]
  }
}
```

## AI Validation

The API performs additional validation for AI workflows.

- Validate ticker availability before retrieval.
- Validate document existence before citation.
- Verify investor memory ownership.
- Prevent duplicate ingestion requests.
- Validate vector embeddings before indexing.
- Reject unsupported financial queries.

| Error Type | HTTP Status |
|------------|-------------|
| Duplicate Ingestion | 409 |
| Retrieval Failure | 503 |
| Vector Store Error | 500 |
| AI Generation Failure | 500 |
| Memory Update Failure | 500 |

## AI Security

- Prevent prompt injection attacks.
- Validate retrieved documents before generation.
- Prevent unauthorized access to investor memory.
- Restrict access to user-specific conversations.
- Ensure AI responses reference only retrieved data.
- Reject unsupported or unverifiable financial claims.

## AI Workflow Testing

- Verify Retrieval-Augmented Generation (RAG).
- Validate citation generation.
- Test investor memory updates.
- Verify recommendation generation.
- Test concurrent ingestion jobs.
- Validate idempotent ingestion behavior.
- Verify duplicate news detection.
- Test vector similarity retrieval accuracy.

# 18. Future API Enhancements

Potential future enhancements include:

- Streaming AI responses using Server-Sent Events.
- Real-time portfolio monitoring.
- Portfolio analytics APIs.
- Market alert notifications.
- Multi-language financial assistance.
- Multi-agent collaboration using LangGraph.
- Support for additional stock exchanges.
- Explainable AI recommendations.
- GraphQL API support.
- Public developer API.

# Appendix B – API Best Practices

The following best practices guide API implementation and maintenance.

- Follow RESTful design principles.
- Keep endpoints resource-oriented.
- Validate all incoming requests.
- Return consistent JSON responses.
- Use appropriate HTTP status codes.
- Implement centralized exception handling.
- Use pagination for large datasets.
- Apply rate limiting to prevent abuse.
- Secure endpoints using JWT authentication.
- Use parameterized database queries.
- Design ingestion endpoints to be idempotent.
- Prevent duplicate indexing during concurrent ingestion.
- Validate retrieved documents before AI response generation.
- Ensure every AI response includes supporting citations.
- Monitor API latency, error rates, and throughput.
- Document all public endpoints using OpenAPI.
- Version APIs before introducing breaking changes.
- Regularly review API security policies and access controls.