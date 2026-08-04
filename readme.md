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

## Docker — local development

Keeps the existing pgvector PostgreSQL container. Unchanged behavior:

```bash
cd backend
copy .env.example .env   # fill in values (DB password, SECRET_KEY, API keys, OAuth)
docker compose up --build
# frontend (optional profile):
docker compose --profile web up --build
```

| Service   | URL                   | Notes |
|-----------|-----------------------|-------|
| frontend  | http://localhost:3000 | profile `web` |
| backend   | http://localhost:8000 | FastAPI + Alembic on start |
| postgres  | compose network only  | pgvector; `DATABASE_URL` overridden to `@postgres:5432` |

## Docker — production on EC2 (Amazon RDS)

EC2 runs **backend + frontend only**. PostgreSQL is Amazon RDS — no `postgres`
container, and production Compose does **not** override `DATABASE_URL`.

```bash
cd backend
copy .env.prod.example .env
# Edit .env: RDS DATABASE_URL, SECRET_KEY, OAuth, AI keys,
# NEXT_PUBLIC_API_URL / NEXT_PUBLIC_SITE_URL = http://<elastic-ip>:8000 / :3000

docker compose -f docker-compose.prod.yml --env-file .env up -d --build
```

Useful checks:

```bash
docker compose -f docker-compose.prod.yml ps
curl http://127.0.0.1:8000/health
curl http://127.0.0.1:8000/db-test
curl http://127.0.0.1:3000/
```

Ensure the RDS security group allows TCP 5432 from the EC2 app security group,
and EC2 security group allows 22 / 80 / 443 / 3000 / 8000 as configured in Terraform.

## Environment Variables

Backend (`backend/.env`):

- Local template: `backend/.env.example`
- Production template: `backend/.env.prod.example`
- `DATABASE_URL` — local compose overrides to `postgres`; prod uses RDS as-is
- `SECRET_KEY` — JWT signing key (`openssl rand -hex 32`)
- `GOOGLE_CLIENT_ID/SECRET/REDIRECT_URI` — Google OAuth
- `GEMINI_API_KEY` / `GROQ_API_KEY` — AI providers
- `CORS_ORIGINS`, `FRONTEND_URL` — allowed origins / post-login redirect

Frontend (build-time, public — set in `.env` for Compose build args):

- `NEXT_PUBLIC_API_URL` — backend base URL reachable from the browser
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
│   ├── docker-compose.yml        # local: postgres + backend (+ frontend profile)
│   ├── docker-compose.prod.yml   # EC2: backend + frontend → Amazon RDS
│   └── .env.prod.example
├── docs/                    # full design documentation
└── README.md
```
