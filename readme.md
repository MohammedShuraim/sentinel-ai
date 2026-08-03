# Sentellent — AI-Powered Indian Stock Analyst

Sentellent is a full-stack fintech application that acts as a personal AI analyst
for the Indian stock market (NSE). It combines a premium dark-mode web experience
with a production-grade AI backend: personalized recommendations, portfolio
management, a real-time streaming chat with source-backed answers, and a
multi-provider LLM layer with automatic failover.

## Features

- **Dashboard** — portfolio KPIs, daily AI market insight, market news, watchlist,
  recent transactions and recommendation previews.
- **Stocks Explorer** — searchable/filterable/sortable NSE universe with market
  snapshot, detailed stock drawer, news and fundamentals, one-click AI analysis.
- **Portfolio** — holdings, animated allocation, transaction timeline, and
  buy/sell trade flows with live totals.
- **AI Recommendations** — scored, confidence-rated picks with explanations and
  supporting evidence, filterable by label/sector/confidence.
- **AI Chat** — ChatGPT-style streaming (SSE) financial analyst with markdown,
  source cards, follow-up suggestions, conversation memory and regeneration.
- **Auth** — email/password (JWT) and Google OAuth with CSRF-safe state cookies.

## Architecture

```
frontend/   Next.js 16 (App Router, Turbopack) · React 19 · Tailwind CSS 4 · Framer Motion
backend/    FastAPI · SQLAlchemy 2 · PostgreSQL + pgvector · LangGraph agent
            Multi-provider LLM layer: Gemini (primary) -> Groq (fallback), streaming + failover
postgres    pgvector/pgvector:pg16 (embeddings for RAG retrieval)
```

Request flow for chat:
`Next.js UI → /chat/stream (SSE) → ConversationService → AgentGraph (intent router →
conditional RAG via pgvector → prompt builder) → FailoverProvider (Gemini ⇢ Groq) → token stream`

Detailed design docs live in [`docs/`](docs/) (requirements, tech stack,
architecture, database, API design, AI design, infrastructure, roadmap).

## Tech Stack

| Layer     | Technology |
|-----------|------------|
| Frontend  | Next.js 16, React 19, TypeScript, Tailwind CSS 4, Framer Motion |
| Backend   | Python 3.13, FastAPI, LangGraph, SQLAlchemy 2, Alembic |
| AI        | Google Gemini, Groq (Llama 3.3 70B), sentence-transformers embeddings |
| Database  | PostgreSQL 16 + pgvector |
| Auth      | JWT (python-jose), Google OAuth (Authlib), bcrypt |
| DevOps    | Docker, docker-compose |

## Quick Start (local development)

Prerequisites: Python 3.13, Node 22, PostgreSQL 16 with the pgvector extension.

```bash
# 1. Backend
cd backend
python -m venv .venv && .venv\Scripts\activate   # Windows
pip install -r requirements.txt
copy .env.example .env                            # then fill in values
alembic upgrade head
uvicorn app.main:app --reload

# 2. Frontend (new terminal)
cd frontend
npm ci
npm run dev        # http://localhost:3000
```

The frontend expects the backend at `NEXT_PUBLIC_API_URL` (default
`http://localhost:8000`).

## Docker Deployment (everything, one command)

```bash
cd backend
copy .env.example .env   # fill in values (DB password, SECRET_KEY, API keys, OAuth)
docker compose up --build
```

Services started:

| Service   | URL                     | Notes |
|-----------|-------------------------|-------|
| frontend  | http://localhost:3000   | Next.js standalone build, non-root user |
| backend   | http://localhost:8000   | FastAPI, health-checked via `/health` |
| postgres  | localhost:5432          | pgvector, persistent volume, health-checked |

Compose wires `DATABASE_URL` to the internal `postgres` hostname automatically;
the browser reaches the backend through the host-mapped port 8000.

## Environment Variables

Backend (`backend/.env`, see `backend/.env.example`):

- `DATABASE_URL`, `POSTGRES_*` — database connection (compose overrides the host)
- `SECRET_KEY` — JWT signing key (`openssl rand -hex 32`)
- `GOOGLE_CLIENT_ID/SECRET/REDIRECT_URI` — Google OAuth
- `GEMINI_API_KEY` / `GROQ_API_KEY` — AI providers (`PRIMARY_PROVIDER`, `FALLBACK_PROVIDER`, `GROQ_MODEL`)
- `FINNHUB_API_KEY`, `MARKETAUX_API_KEY` — market/news data (optional)
- `CORS_ORIGINS`, `FRONTEND_URL` — comma-separated allowed origins / post-login redirect

Frontend (build-time, public):

- `NEXT_PUBLIC_API_URL` — backend base URL
- `NEXT_PUBLIC_SITE_URL` — canonical origin for metadata/OG/sitemap

**Never commit real `.env` files** — the repo `.gitignore` excludes them.

## API Overview

| Area | Endpoints |
|------|-----------|
| Auth | `POST /auth/register`, `POST /auth/login`, `GET /auth/google/login`, `GET /auth/google/callback` |
| Chat | `POST /chat`, `POST /chat/stream` (SSE), conversation CRUD |
| Stocks | `GET /stocks`, `GET /stock/{ticker}`, news, fundamentals |
| Portfolio | holdings CRUD, summary |
| Transactions | `POST /transactions/buy`, `POST /transactions/sell`, history |
| Recommendations | `GET /recommendations` |
| Ops | `GET /health`, `GET /db-test` |

Interactive docs: `http://localhost:8000/docs` (Swagger UI).

## Security Notes

- Passwords hashed with bcrypt; JWTs are short-lived (30 min default).
- Google OAuth uses an `HttpOnly` state cookie validated with constant-time comparison; `Secure` is enabled automatically for HTTPS redirect URIs.
- CORS is restricted to configured origins; credentials supported.
- The frontend sends security headers (`X-Frame-Options`, `nosniff`, Referrer-Policy, Permissions-Policy) and hides the `X-Powered-By` header.
- `/db-test` never exposes internal error details to clients.

## Project Structure

```
├── frontend/
│   ├── app/                 # App Router pages (landing, auth, dashboard, stocks,
│   │                        #   portfolio, recommendations, chat), sitemap, robots
│   ├── components/          # ui/ layout/ dashboard/ stocks/ portfolio/
│   │                        #   recommendations/ chat/ common/ brand/
│   ├── hooks/               # data hooks (useChat, usePortfolio, useStocks, ...)
│   └── lib/                 # api client, motion presets, formatters, scoring
├── backend/
│   ├── app/
│   │   ├── api/             # FastAPI routers
│   │   ├── core/            # config (pydantic-settings), dependencies (DI)
│   │   ├── graph/           # LangGraph agent: intent router, prompts, RAG
│   │   ├── services/        # providers (Gemini/Groq/failover), RAG, conversations
│   │   ├── db/              # engine, models, session
│   │   └── schemas/         # Pydantic contracts
│   ├── alembic/             # migrations
│   ├── Dockerfile
│   └── docker-compose.yml   # postgres + backend + frontend
├── docs/                    # full design documentation
└── README.md
```
