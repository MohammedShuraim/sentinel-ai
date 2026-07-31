# 04 - Database Design

## 1. Database Overview

The Sentinel AI platform relies on a relational database combined with vector search capabilities to support structured financial data, Retrieval-Augmented Generation (RAG), investor memory, and personalized recommendations.

The database serves as the central source of truth for all application data, including user information, stock metadata, financial news, vector embeddings, conversations, investor preferences, and AI-generated recommendations.

To support semantic search, PostgreSQL is extended using the **pgvector** extension, allowing the system to store vector embeddings alongside traditional relational data. This hybrid design simplifies application development while providing efficient retrieval for AI workflows.

The database architecture is designed with the following objectives:

- Maintain data consistency
- Support efficient semantic retrieval
- Enable personalized investor memory
- Store historical conversations
- Support scalable recommendation generation
- Optimize query performance
- Ensure secure data storage
- Support production-ready cloud deployment

---

## 2. Design Goals

The database has been designed according to the following principles.

### Functional Goals

- Store all application data reliably
- Support Retrieval-Augmented Generation (RAG)
- Maintain investor preferences
- Store conversation history
- Manage watchlists
- Store company fundamentals
- Store financial news
- Store AI-generated recommendations

### Non-Functional Goals

- High performance
- Scalability
- Reliability
- Security
- Data integrity
- Maintainability
- Extensibility
- Fault tolerance

### AI-Specific Goals

- Efficient vector similarity search
- Fast embedding retrieval
- Memory persistence
- Context-aware retrieval
- Metadata filtering
- Citation support

---

## 3. Database Technology

The platform uses PostgreSQL as the primary relational database with the pgvector extension for semantic search.

### Core Technologies

| Technology | Purpose |
|------------|---------|
| PostgreSQL | Relational database |
| pgvector | Vector similarity search |
| SQLAlchemy | ORM |
| Alembic | Database migrations |

### Why PostgreSQL?

PostgreSQL was selected because it provides:

- ACID compliance
- Excellent indexing support
- Strong relational modeling
- JSON support
- Full-text search capabilities
- Mature ecosystem
- Native compatibility with pgvector

### Why pgvector?

The application requires semantic retrieval for Retrieval-Augmented Generation (RAG).

pgvector enables:

- Storage of embedding vectors
- Similarity search
- Efficient nearest-neighbor retrieval
- Integration with SQL queries
- Unified relational and vector storage

---

## 4. Entity Relationship Diagram (ERD)

The database consists of several interconnected entities.

```text
Users
│
├── User Preferences
│
├── Watchlist
│
├── Conversations
│     │
│     └── Messages
│
├── Investor Memory
│
└── Recommendations

Stocks
│
├── Company Fundamentals
│
├── Financial News
│
├── Document Chunks
│      │
│      └── Embeddings
│
└── Recommendations

System Jobs
```

### Relationship Summary

- One user can have multiple watchlist entries.
- One user can have multiple conversations.
- One conversation contains multiple messages.
- One stock can have multiple news articles.
- One news article can generate multiple document chunks.
- One document chunk has one embedding.
- One user can have multiple investor memories.
- One recommendation belongs to one user and one stock.

---

## 5. Database Schema Overview

The database is organized into logical domains to separate responsibilities and simplify maintenance.

### User Domain

Stores:

- User accounts
- Authentication details
- Preferences
- Watchlists

### Financial Data Domain

Stores:

- Company information
- Company fundamentals
- Financial news
- Market metadata

### AI Domain

Stores:

- Document chunks
- Vector embeddings
- Investor memory
- Conversation history
- AI recommendations

### System Domain

Stores:

- Scheduled job metadata
- Processing status
- Synchronization history
- Background task information

This domain-driven organization improves maintainability and enables independent evolution of different parts of the application.

## 6. Database Tables

The Sentinel AI database is organized into multiple relational tables that support authentication, financial data management, Retrieval-Augmented Generation (RAG), investor memory, and recommendation generation.

---

# 6.1 Users

### Purpose

Stores registered user information.

### Columns

| Column | Data Type | Constraints | Description |
|----------|----------|------------|-------------|
| id | UUID | Primary Key | Unique user identifier |
| name | VARCHAR(100) | NOT NULL | Full name |
| email | VARCHAR(255) | UNIQUE, NOT NULL | User email |
| profile_picture | TEXT | NULL | Google profile image |
| auth_provider | VARCHAR(30) | NOT NULL | OAuth provider |
| created_at | TIMESTAMP | NOT NULL | Creation timestamp |
| updated_at | TIMESTAMP | NOT NULL | Last update timestamp |

---

# 6.2 User Preferences

### Purpose

Stores long-term investment preferences.

### Columns

| Column | Data Type | Constraints |
|----------|----------|------------|
| id | UUID | Primary Key |
| user_id | UUID | FK Users(id) |
| risk_profile | VARCHAR(30) | NOT NULL |
| investment_horizon | VARCHAR(30) | NOT NULL |
| preferred_sectors | JSONB | NULL |
| dividend_preference | BOOLEAN | Default FALSE |
| growth_preference | BOOLEAN | Default FALSE |
| value_preference | BOOLEAN | Default FALSE |
| avoid_high_debt | BOOLEAN | Default FALSE |
| updated_at | TIMESTAMP | NOT NULL |

---

# 6.3 Stocks

### Purpose

Stores master stock information.

### Columns

| Column | Data Type | Constraints |
|----------|----------|------------|
| id | UUID | Primary Key |
| ticker | VARCHAR(20) | UNIQUE |
| company_name | VARCHAR(255) | NOT NULL |
| sector | VARCHAR(100) | NOT NULL |
| industry | VARCHAR(150) | NULL |
| exchange | VARCHAR(20) | NOT NULL |
| isin | VARCHAR(20) | NULL |
| created_at | TIMESTAMP | NOT NULL |

---

# 6.4 Watchlist

### Purpose

Stores stocks followed by users.

### Columns

| Column | Data Type | Constraints |
|----------|----------|------------|
| id | UUID | Primary Key |
| user_id | UUID | FK Users(id) |
| stock_id | UUID | FK Stocks(id) |
| followed_at | TIMESTAMP | NOT NULL |

Each user can follow multiple stocks.

---

# 6.5 Company Fundamentals

### Purpose

Stores structured financial metrics.

### Columns

| Column | Data Type |
|----------|----------|
| id | UUID |
| stock_id | UUID |
| market_cap | DECIMAL |
| pe_ratio | DECIMAL |
| pb_ratio | DECIMAL |
| eps | DECIMAL |
| roe | DECIMAL |
| debt_to_equity | DECIMAL |
| dividend_yield | DECIMAL |
| revenue_growth | DECIMAL |
| profit_growth | DECIMAL |
| updated_at | TIMESTAMP |

---

# 6.6 Financial News

### Purpose

Stores news articles.

### Columns

| Column | Data Type |
|----------|----------|
| id | UUID |
| stock_id | UUID |
| title | TEXT |
| source | VARCHAR |
| url | TEXT |
| author | VARCHAR |
| published_at | TIMESTAMP |
| article_text | TEXT |
| sentiment | VARCHAR |
| created_at | TIMESTAMP |

---

# 6.7 Document Chunks

### Purpose

Stores chunks generated from long financial documents.

### Columns

| Column | Data Type |
|----------|----------|
| id | UUID |
| news_id | UUID |
| chunk_number | INTEGER |
| chunk_text | TEXT |
| token_count | INTEGER |
| metadata | JSONB |
| created_at | TIMESTAMP |

Large news articles are divided into multiple chunks before embedding generation.

---

# 6.8 Embeddings

### Purpose

Stores vector embeddings for semantic retrieval.

### Columns

| Column | Data Type |
|----------|----------|
| id | UUID |
| chunk_id | UUID |
| embedding | VECTOR |
| embedding_model | VARCHAR |
| created_at | TIMESTAMP |

Each document chunk has one embedding.

---

# 6.9 Conversations

### Purpose

Stores AI chat sessions.

### Columns

| Column | Data Type |
|----------|----------|
| id | UUID |
| user_id | UUID |
| title | VARCHAR |
| started_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

# 6.10 Messages

### Purpose

Stores every message exchanged between the user and the AI assistant.

### Columns

| Column | Data Type |
|----------|----------|
| id | UUID |
| conversation_id | UUID |
| sender | VARCHAR |
| message | TEXT |
| citations | JSONB |
| created_at | TIMESTAMP |

---

# 6.11 Investor Memory

### Purpose

Stores long-term investor knowledge extracted from conversations.

### Columns

| Column | Data Type |
|----------|----------|
| id | UUID |
| user_id | UUID |
| memory_type | VARCHAR |
| memory_key | VARCHAR |
| memory_value | TEXT |
| confidence_score | DECIMAL |
| source_message | UUID |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

Examples:

- Risk Profile
- Preferred Sector
- Avoid High Debt
- Dividend Preference
- Long-Term Investing

---

# 6.12 Recommendations

### Purpose

Stores AI-generated recommendations.

### Columns

| Column | Data Type |
|----------|----------|
| id | UUID |
| user_id | UUID |
| stock_id | UUID |
| recommendation_type | VARCHAR |
| confidence | DECIMAL |
| explanation | TEXT |
| citations | JSONB |
| generated_at | TIMESTAMP |

---

# 6.13 System Jobs

### Purpose

Tracks scheduled background jobs.

### Columns

| Column | Data Type |
|----------|----------|
| id | UUID |
| job_name | VARCHAR |
| job_type | VARCHAR |
| status | VARCHAR |
| started_at | TIMESTAMP |
| completed_at | TIMESTAMP |
| error_message | TEXT |
| created_at | TIMESTAMP |

Examples:

- Refresh News
- Refresh Fundamentals
- Generate Embeddings
- Cleanup Old Data
- Health Check

---

## Table Design Principles

The database follows these design principles:

- Every table has a UUID primary key.
- Every table includes timestamps where appropriate.
- Foreign key relationships enforce referential integrity.
- JSONB is used only for semi-structured data.
- Frequently queried data is normalized.
- Vector embeddings are stored separately from document content.
- Investor memory is isolated from conversation history.
- Recommendations are stored independently for auditing and future analysis.

## 7. Table Relationships

The Sentinel AI database follows a normalized relational design to maintain data integrity while supporting efficient queries.

### Relationship Diagram

```text
Users
│
├── User Preferences (1:1)
│
├── Watchlist (1:N)
│       │
│       └── Stocks (N:1)
│
├── Conversations (1:N)
│       │
│       └── Messages (1:N)
│
├── Investor Memory (1:N)
│
└── Recommendations (1:N)
        │
        └── Stocks (N:1)

Stocks
│
├── Company Fundamentals (1:1)
│
├── Financial News (1:N)
│       │
│       └── Document Chunks (1:N)
│               │
│               └── Embeddings (1:1)
│
└── Recommendations (1:N)

System Jobs
```

### Relationship Summary

| Parent Table | Child Table | Relationship |
|---------------|------------|--------------|
| Users | User Preferences | One-to-One |
| Users | Watchlist | One-to-Many |
| Users | Conversations | One-to-Many |
| Conversations | Messages | One-to-Many |
| Users | Investor Memory | One-to-Many |
| Users | Recommendations | One-to-Many |
| Stocks | Company Fundamentals | One-to-One |
| Stocks | Financial News | One-to-Many |
| Financial News | Document Chunks | One-to-Many |
| Document Chunks | Embeddings | One-to-One |
| Stocks | Recommendations | One-to-Many |

---

## 8. Constraints & Data Integrity

To maintain consistency and prevent invalid data, the database enforces several integrity constraints.

### Primary Keys

Every table uses a UUID as its primary key.

Benefits:

- Globally unique identifiers
- Easy distributed systems support
- No collision risk
- Better API security compared to sequential IDs

---

### Foreign Keys

Foreign keys maintain relationships between tables.

Examples:

- Watchlist.user_id → Users.id
- Watchlist.stock_id → Stocks.id
- Messages.conversation_id → Conversations.id
- CompanyFundamentals.stock_id → Stocks.id
- Embeddings.chunk_id → DocumentChunks.id

---

### Unique Constraints

Examples:

- Users.email
- Stocks.ticker
- Watchlist(user_id, stock_id)

These constraints prevent duplicate records.

---

### NOT NULL Constraints

Critical fields cannot be empty.

Examples:

- User email
- Company name
- Stock ticker
- News title
- Embedding vector

---

### Check Constraints

Business rules enforced at the database level.

Examples:

- confidence_score BETWEEN 0 AND 1
- dividend_yield >= 0
- pe_ratio >= 0
- token_count > 0

---

### Cascading Rules

The database uses cascading actions carefully.

Examples:

- Delete conversation → delete messages.
- Delete stock → preserve historical recommendations.
- Delete user → remove watchlist and investor memory.

---

## 9. Indexing Strategy

Indexes improve query performance and reduce lookup time.

### Primary Indexes

Automatically created for:

- Users.id
- Stocks.id
- Conversations.id
- Messages.id

---

### Secondary Indexes

The following columns are indexed.

| Table | Indexed Column |
|---------|---------------|
| Users | email |
| Stocks | ticker |
| Stocks | company_name |
| Watchlist | user_id |
| Financial News | published_at |
| Financial News | stock_id |
| Conversations | user_id |
| Messages | conversation_id |
| Investor Memory | user_id |
| Recommendations | user_id |

---

### Composite Indexes

Composite indexes optimize common queries.

Examples:

(user_id, stock_id)

(stock_id, published_at)

(user_id, created_at)

---

### Full-Text Search Indexes

Used for:

- News titles
- Article content
- Company descriptions

Benefits:

- Faster keyword search
- Better filtering before vector retrieval

---

## 10. pgvector Design

The application uses pgvector to enable semantic search for Retrieval-Augmented Generation (RAG).

### Vector Storage Workflow

```text
Financial News

↓

Document Chunking

↓

Embedding Generation

↓

Store Vector

↓

Similarity Search

↓

Relevant Context

↓

LLM Response
```

---

### Vector Table Structure

Each vector record contains:

- Chunk ID
- Embedding Vector
- Embedding Model
- Metadata
- Creation Timestamp

---

### Similarity Search Process

When a user asks a question:

1. Generate query embedding.
2. Compare against stored vectors.
3. Rank documents by similarity.
4. Retrieve top matching chunks.
5. Send retrieved context to GPT.

---

### Metadata Filtering

Before vector search results are returned, metadata filters may be applied.

Examples:

- Stock ticker
- Sector
- News source
- Publication date
- Sentiment

This improves retrieval precision.

---

### Vector Index

The embedding column should use a vector index suitable for similarity search (such as HNSW or IVFFlat, depending on deployment and performance requirements).

Benefits:

- Fast nearest-neighbor search
- Lower retrieval latency
- Better scalability

---

## 11. Memory Storage Design

Investor memory is stored independently from conversation history.

This separation allows the AI assistant to retain long-term preferences without repeatedly processing historical chats.

### Memory Categories

- Risk Profile
- Investment Horizon
- Preferred Sectors
- Dividend Preference
- Growth Preference
- Value Preference
- Companies to Avoid
- Custom Investment Rules

---

### Memory Lifecycle

```text
User Conversation

↓

Memory Extraction

↓

Validation

↓

Duplicate Check

↓

Store Memory

↓

Update Investor Profile

↓

Future Retrieval
```

---

### Memory Confidence

Each memory includes a confidence score.

Examples:

0.95 → Explicit statement

0.75 → Strong inference

0.50 → Weak inference

Low-confidence memories can be reviewed or replaced by stronger evidence.

---

### Duplicate Detection

Before storing a new memory:

- Compare with existing memories.
- Ignore identical values.
- Replace outdated information.
- Preserve change history where appropriate.

This prevents redundant or conflicting investor profiles.


## 12. Data Lifecycle

The Sentinel AI platform follows a structured data lifecycle to ensure data remains accurate, relevant, and efficiently managed throughout its lifetime.

### Data Lifecycle Stages

```text
Data Collection
        │
        ▼
Validation
        │
        ▼
Storage
        │
        ▼
Processing
        │
        ▼
Retrieval
        │
        ▼
Update
        │
        ▼
Archive
        │
        ▼
Deletion
```

---

### Stage 1 – Data Collection

Data enters the system from multiple sources:

- Google OAuth
- User interactions
- Stock watchlists
- Financial APIs
- News providers
- AI-generated memories

---

### Stage 2 – Validation

Incoming data is validated before storage.

Validation includes:

- Required field validation
- Data type validation
- Duplicate detection
- Foreign key validation
- Business rule validation

---

### Stage 3 – Storage

Validated data is stored in PostgreSQL.

Storage categories include:

- Relational data
- Vector embeddings
- JSON metadata
- Conversation history

---

### Stage 4 – Processing

Stored data is processed to improve retrieval quality.

Examples:

- News chunking
- Embedding generation
- Sentiment analysis
- Metadata extraction
- Memory extraction

---

### Stage 5 – Retrieval

The system retrieves data for:

- AI conversations
- Stock recommendations
- Watchlists
- Dashboard analytics
- Semantic search

---

### Stage 6 – Updates

Existing records are updated when:

- Company fundamentals change
- New financial news arrives
- Investor preferences change
- AI memory evolves

---

### Stage 7 – Archival

Historical information can be archived for future analysis.

Examples:

- Old conversations
- Historical recommendations
- Outdated news
- Completed system jobs

---

### Stage 8 – Deletion

Data is removed only when necessary.

Examples:

- User account deletion
- Expired temporary data
- Invalid embeddings
- Corrupted records

Deletion follows referential integrity rules.

---

## 13. Backup & Recovery

The database is designed with a disaster recovery strategy to minimize downtime and data loss.

### Backup Strategy

Backups include:

- Full database backups
- Incremental backups
- Automated scheduled backups
- Manual backups before major deployments

---

### Backup Frequency

| Backup Type | Frequency |
|--------------|-----------|
| Full Backup | Daily |
| Incremental Backup | Hourly |
| Transaction Logs | Continuous |

---

### Recovery Objectives

Recovery Point Objective (RPO)

- Minimize acceptable data loss.

Recovery Time Objective (RTO)

- Restore service as quickly as possible after failures.

---

### Recovery Process

```text
Failure

↓

Detect Issue

↓

Restore Backup

↓

Apply Transaction Logs

↓

Validate Data

↓

Resume Service
```

---

### Backup Best Practices

- Encrypt backup files
- Store backups separately from production
- Verify backup integrity
- Regularly test recovery procedures

---

## 14. Security Considerations

Protecting financial and personal data is a primary design objective.

### Data Encryption

Sensitive data is protected through:

- Encryption in transit (TLS/HTTPS)
- Encryption at rest
- Secure backup encryption

---

### Authentication

Database access is restricted using:

- IAM roles
- Least privilege
- Secure credentials
- Role-based permissions

---

### Query Security

All database operations should use parameterized queries to prevent SQL injection.

Benefits include:

- Prevent SQL injection
- Improve query safety
- Better maintainability

---

### Audit Logging

Important events should be logged.

Examples:

- User login
- Profile updates
- Recommendation generation
- Database failures
- Administrative actions

---

### Data Privacy

Sensitive information is protected using:

- Secure environment variables
- Restricted database permissions
- Minimal data exposure
- Secure API communication

---

## 15. Performance Optimization

Performance is critical for AI-powered applications.

### Query Optimization

Strategies include:

- Efficient joins
- Proper indexing
- Query planning
- Limiting returned rows

---

### Connection Management

Database performance is improved using:

- Connection pooling
- Prepared statements
- Transaction management

---

### Batch Processing

Bulk operations should use:

- Batch inserts
- Batch updates
- Bulk embedding generation

Benefits:

- Lower latency
- Reduced database load
- Improved throughput

---

### Pagination

Large datasets are retrieved using pagination instead of loading all records simultaneously.

Examples:

- Financial news
- Conversations
- Messages
- Recommendations

---

### AI Optimization

To reduce AI processing costs:

- Retrieve only relevant document chunks
- Cache frequently accessed data
- Avoid unnecessary embedding regeneration
- Minimize repeated LLM requests

---

## 16. Future Database Enhancements

The database architecture is designed to support future growth.

Potential enhancements include:

- Multi-region database replication
- Read replicas
- Advanced partitioning
- Real-time market data storage
- Portfolio analytics tables
- Financial statement history
- Additional vector indexes
- Hybrid semantic and keyword search
- Event-driven ingestion pipelines
- Automated data quality monitoring

---

## 17. Database Summary

The Sentinel AI database combines a robust relational model with vector search capabilities to support a production-ready AI-powered investment platform.

Key characteristics include:

- PostgreSQL as the primary relational database
- pgvector for semantic retrieval
- Normalized relational schema
- Structured investor memory
- Efficient Retrieval-Augmented Generation (RAG)
- Strong referential integrity
- Secure authentication and authorization
- Optimized indexing strategy
- Scalable cloud deployment
- Production-ready backup and recovery

This design provides a reliable foundation for user management, financial data processing, AI memory, semantic search, and personalized stock recommendations while remaining maintainable and extensible for future enhancements.

---

# Appendix A – Sample SQL Queries

### Find User Watchlist

```sql
SELECT s.company_name, s.ticker
FROM watchlist w
JOIN stocks s ON w.stock_id = s.id
WHERE w.user_id = :user_id;
```

---

### Retrieve Recent News

```sql
SELECT title, source, published_at
FROM financial_news
WHERE stock_id = :stock_id
ORDER BY published_at DESC
LIMIT 10;
```

---

### Retrieve Investor Memory

```sql
SELECT memory_key, memory_value
FROM investor_memory
WHERE user_id = :user_id;
```

---

# Appendix B – Naming Conventions

The following conventions are used throughout the database design:

- Table names use `snake_case` and plural nouns.
- Column names use `snake_case`.
- Primary keys use `id`.
- Foreign keys use `<table>_id`.
- Timestamp fields use `_at` suffix (e.g., `created_at`, `updated_at`).
- Boolean fields begin with descriptive names (e.g., `is_active`, `avoid_high_debt`).

Consistent naming improves readability, maintainability, and collaboration across development teams.

---

# Appendix C – Database Best Practices

The following best practices guide implementation and maintenance:

- Use database migrations for all schema changes.
- Avoid storing duplicate data unless justified for performance.
- Enforce referential integrity through foreign keys.
- Keep transactions short to reduce lock contention.
- Monitor slow queries and optimize indexes regularly.
- Validate backups through periodic recovery testing.
- Use parameterized queries to prevent SQL injection.
- Document schema changes and version database migrations.
- Regularly review indexes to balance query performance and write overhead.