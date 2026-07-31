# 02 - Technology Stack

## Document Purpose

This document defines the technology stack selected for the Sentinel AI platform. Each technology has been selected based on scalability, maintainability, cloud readiness, AI integration, and alignment with the Sentellent Full Stack AI SDE Hiring Challenge.

---

# 1. Frontend

## Selected Technology

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- shadcn/ui
- React Query (TanStack Query)

## Reason

Next.js provides a production-ready React framework with server-side rendering, routing, API integration, and excellent performance. TypeScript improves code quality and maintainability. Tailwind CSS enables rapid UI development, while shadcn/ui provides accessible and reusable components.

---

# 2. Backend

## Selected Technology

- Python 3.13
- FastAPI
- Uvicorn
- Pydantic
- SQLAlchemy
- Alembic

## Reason

FastAPI is designed for high-performance API development and integrates naturally with AI applications. SQLAlchemy provides ORM capabilities, while Alembic manages database migrations.

Alternative Considered

- Flask

Reason Not Selected

FastAPI provides better async support, automatic OpenAPI documentation, and superior performance.

---

# 3. AI Framework

## Selected Technology

- LangGraph
- LangChain

## Reason

LangGraph enables stateful AI workflows with long-term memory.

LangChain simplifies:

- Prompt management
- RAG
- Retrieval
- Tool calling
- LLM integration

This combination is recommended in the assignment.

---

# 4. MCP Integration

## Selected Technology

Model Context Protocol (MCP)

## Purpose

Provides standardized communication between the AI agent and external tools.

Potential MCP Servers

- Financial Data
- News Retrieval
- Database Retrieval
- Future Extensions

---

# 5. Large Language Model

## Selected Technology

OpenAI GPT-5.5

## Reason

Provides advanced reasoning, summarization, structured output generation, and conversational capabilities required for financial research.

Future Alternatives

- AWS Bedrock Models
- Claude
- Gemini

---

# 6. Embedding Model

## Selected Technology

OpenAI text-embedding-3-small

## Reason

Produces high-quality embeddings with low latency and cost.

Purpose

- Semantic Search
- RAG
- Similarity Search
- Investor Persona Matching

---

# 7. Vector Database

## Selected Technology

PostgreSQL + pgvector

## Alternatives Considered

- Pinecone
- OpenSearch

## Reason

Using pgvector allows structured data and embeddings to remain inside one database, reducing infrastructure complexity.

---

# 8. Relational Database

## Selected Technology

PostgreSQL

## Reason

Reliable, scalable, open source, and widely used for production applications.

Stores

- Users
- Stocks
- News
- Chat History
- Investor Memory
- Metadata

---

# 9. Authentication

## Selected Technology

Google OAuth 2.0

## Reason

Required by the assignment.

Google Cloud Console will be configured with the required Sentellent test users.

---

# 10. Financial Data Sources

## Fundamentals

- Screener.in

Alternative

- NSE/BSE Fundamental Sources

## Market Data

- NSE India

- yfinance

## News Sources

- Economic Times RSS

- Moneycontrol RSS

- LiveMint RSS

- Business Standard RSS

Purpose

These sources provide company fundamentals, market prices, and Indian financial news for Retrieval-Augmented Generation.

---

# 11. AI Data Processing

Document Processing

- Chunking

- Embedding

- Metadata Extraction

- Sentiment Analysis

- Entity Recognition

Purpose

Transform raw financial documents into searchable vector representations.

---

# 12. Memory Management

Technology

LangGraph Memory

Future Enhancement

AWS AgentCore Memory

Purpose

Maintain long-term investor preferences including:

- Risk Appetite

- Preferred Sectors

- Dividend Preference

- Investment Strategy

- Conversation History

---

# 13. Cloud Platform

## Selected Platform

Amazon Web Services (AWS)

Reason

AWS is the preferred cloud platform specified in the assignment.

---

# 14. AWS Services

Selected Services

- ECS Fargate

- Amazon ECR

- RDS PostgreSQL

- CloudFront

- Application Load Balancer

- IAM

- VPC

- CloudWatch

Future Services

- Lambda

- API Gateway

- DynamoDB

Reason

Containerized architecture provides better flexibility and production readiness.

---

# 15. Google Cloud Platform

Purpose

Google OAuth only.

No Gmail API.

No Calendar API.

Used only for authentication.

---

# 16. Infrastructure as Code

Selected Technology

Terraform

Purpose

Provision

- VPC

- ECS

- RDS

- Networking

- IAM

- Security Groups

- Load Balancer

Benefits

- Version Controlled Infrastructure

- Repeatable Deployment

- Automation

---

# 17. Containerization

Selected Technology

Docker

Docker Compose

Purpose

Create identical development and production environments.

---

# 18. CI/CD

Selected Technology

GitHub Actions

Pipeline

- Build

- Test

- Docker Build

- Push Images

- Terraform Apply

- Deploy

Benefits

Automatic deployment after pushing to the main branch.

---

# 19. Monitoring & Logging

Selected Technology

AWS CloudWatch

FastAPI Logging

Application Logs

Container Logs

Purpose

Centralized monitoring and debugging.

---

# 20. API Documentation

Technology

FastAPI OpenAPI

Swagger UI

ReDoc

Purpose

Automatically generated API documentation.

---

# 21. Development Tools

| Tool | Purpose |
|--------|----------|
| Cursor | AI Assisted Development |
| Git | Version Control |
| GitHub | Source Code Hosting |
| Docker Desktop | Local Containers |
| Terraform CLI | Infrastructure |
| AWS CLI | Cloud Deployment |
| Postman | API Testing |
| PowerShell | Development Terminal |
| npm | Frontend Package Manager |
| pip | Python Package Manager |

---

# 22. Testing Tools

Backend

- Pytest

Frontend

- Playwright

API

- Postman

---

# 23. Security

Authentication

Google OAuth

Secrets

Environment Variables

Cloud

AWS IAM

Transport

HTTPS

---

# 24. Future Enhancements

- AWS AgentCore Runtime

- AWS AgentCore Memory

- Pinecone

- OpenSearch

- Redis Cache

- Kubernetes

- Multi-Agent Architecture

---

# 25. Technology Summary

| Layer | Selected Technology |
|----------|--------------------|
| Frontend | Next.js + React + TypeScript |
| Backend | FastAPI |
| AI Framework | LangGraph + LangChain |
| MCP | Model Context Protocol |
| LLM | OpenAI GPT-5.5 |
| Embeddings | text-embedding-3-small |
| Database | PostgreSQL |
| Vector Database | pgvector |
| Authentication | Google OAuth |
| Financial Data | Screener.in + RSS + NSE + yfinance |
| Cloud | AWS |
| IaC | Terraform |
| Containers | Docker |
| CI/CD | GitHub Actions |
| Monitoring | CloudWatch |
| Documentation | OpenAPI + Swagger |

---

# Conclusion

The selected technology stack satisfies the requirements of the Sentellent Hiring Challenge while providing a scalable, maintainable, cloud-native, AI-first architecture. The technologies prioritize production readiness, deployment automation, Retrieval-Augmented Generation, long-term memory, and professional software engineering practices.