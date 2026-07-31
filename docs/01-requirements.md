# 01 - Requirements

## 1. Project Overview

Sentinel AI is a cloud-based Agentic AI platform that acts as a personal Indian Stock Market Research Assistant for investors. The application is designed to help users research, analyze, and track Indian equities listed on the National Stock Exchange (NSE) and Bombay Stock Exchange (BSE).

The platform combines Retrieval-Augmented Generation (RAG), contextual memory, and AI reasoning to provide personalized investment insights based on company fundamentals, financial news, and user preferences. Users can follow stock tickers, chat with an AI assistant, and receive grounded recommendations with proper citations instead of generic AI-generated responses.

The application is designed as a production-ready full-stack cloud solution with a strong focus on scalability, deployment automation, Infrastructure as Code (Terraform), containerization using Docker, CI/CD pipelines using GitHub Actions, and deployment on AWS.

---

## 2. Problem Statement

Investors often spend significant time collecting financial information from multiple websites, comparing company fundamentals, reading financial news, and understanding market sentiment before making investment decisions.

Traditional AI chatbots usually provide generic responses without understanding the investor's preferences, maintaining long-term memory, or citing reliable financial sources. This increases the possibility of incorrect or hallucinated recommendations.

There is a need for an intelligent research assistant that continuously learns user preferences, automatically gathers financial information, retrieves trustworthy evidence, and generates personalized recommendations that are transparent, explainable, and supported by citations.

---

## 3. Objectives

The primary objective of this project is to build a production-ready AI-powered Indian Stock Research Assistant that combines modern software engineering practices with Retrieval-Augmented Generation (RAG) and contextual memory.

The project aims to:

- Develop a cloud-based AI research assistant for Indian stock market analysis.
- Support natural language conversations for investment research.
- Automatically ingest company fundamentals and financial news.
- Store financial documents inside a vector database.
- Generate grounded responses using Retrieval-Augmented Generation (RAG).
- Learn and remember investor preferences using long-term memory.
- Provide personalized stock recommendations with proper citations.
- Reduce AI hallucinations by answering only from retrieved information.
- Deploy the application using Docker, Terraform, GitHub Actions, and AWS.
- Demonstrate production-ready software engineering practices.

---

## 4. Functional Requirements

The application shall provide the following functionality:

### User Management

- User authentication using Google OAuth.
- Secure user session management.
- Personalized user profile.

### Stock Management

- Search Indian stock tickers.
- Follow and unfollow stocks.
- Maintain a personalized watchlist.

### Data Ingestion

- Fetch company fundamentals.
- Fetch recent financial news.
- Store retrieved documents.
- Chunk and embed documents.
- Store embeddings inside a vector database.
- Prevent duplicate document ingestion.

### AI Assistant

- Answer user questions using RAG.
- Generate responses with citations.
- Recommend stocks based on investor preferences.
- Maintain contextual conversation history.
- Remember investor profile across conversations.

### Memory Management

- Store investor preferences.
- Update investor persona automatically.
- Retrieve relevant memories during conversations.

### Recommendation Engine

- Match stocks against investor profile.
- Filter unsuitable stocks.
- Rank suitable stocks.
- Generate personalized recommendations.

### Administration

- Health monitoring endpoint.
- Logging and diagnostics.
- Scheduled data refresh jobs.

---

## 5. Non-Functional Requirements

The system shall satisfy the following quality attributes:

### Performance

- Fast API response time.
- Efficient vector retrieval.
- Minimize unnecessary LLM calls.
- Cache reusable data whenever possible.

### Scalability

- Support multiple users.
- Support increasing numbers of stocks.
- Support large document collections.

### Reliability

- Prevent duplicate ingestion.
- Handle concurrent ingestion safely.
- Ensure data consistency.
- Recover gracefully from failures.

### Security

- Secure authentication.
- HTTPS communication.
- Environment variable protection.
- Secure API communication.

### Maintainability

- Modular architecture.
- Clean code.
- Proper documentation.
- Easy deployment.

### Usability

- Simple user interface.
- Responsive design.
- Easy navigation.
- Clear citations for every response.

---

## 6. AI Requirements

The AI system shall include:

### Retrieval-Augmented Generation (RAG)

- Retrieve relevant financial documents.
- Use retrieved documents for every response.
- Avoid generating unsupported information.

### Long-Term Memory

- Learn investor preferences.
- Remember user investment strategy.
- Maintain conversation context.
- Update investor persona over time.

### Grounded Responses

- Every recommendation must reference retrieved evidence.
- Display citations for news and company fundamentals.
- Respond honestly when sufficient data is unavailable.

### Recommendation Logic

- Consider investor risk profile.
- Consider company fundamentals.
- Consider recent market sentiment.
- Rank stocks based on relevance.

---

## 7. Infrastructure Requirements

The application shall use modern cloud-native architecture.

Infrastructure shall include:

- Docker containers.
- Terraform Infrastructure as Code.
- GitHub Actions CI/CD.
- AWS Cloud deployment.
- PostgreSQL database.
- pgvector extension.
- Secure environment variables.
- Automated deployment pipeline.
- Cloud monitoring and logging.

---

## 8. Deployment Requirements

The final application shall satisfy the following deployment requirements:

- Deploy frontend to the cloud.
- Deploy backend API.
- Deploy PostgreSQL database.
- Configure vector database.
- Configure Docker containers.
- Provision infrastructure using Terraform.
- Configure CI/CD using GitHub Actions.
- Support automatic deployment after push to main branch.
- Provide publicly accessible application URL.
- Demonstrate successful cloud deployment.

---

## 9. Assumptions

The following assumptions are made during development:

- Financial data sources remain available.
- Users have internet connectivity.
- AWS services are available.
- OpenAI API is accessible.
- Users authenticate using Google OAuth.
- Financial news sources provide sufficient data.
- External APIs respect expected rate limits.

---

## 10. Risks

Potential project risks include:

- Financial API rate limiting.
- Changes in external websites.
- AWS service configuration errors.
- Increased LLM API costs.
- Large embedding storage requirements.
- Deployment failures.
- Authentication configuration issues.
- Network failures.
- Hallucinated AI responses if retrieval fails.
- Limited free-tier cloud resources.

---

## 11. Success Criteria

The project will be considered successful if:

- Users can authenticate successfully.
- Users can follow Indian stock tickers.
- Company fundamentals are ingested correctly.
- Financial news is indexed successfully.
- Documents are embedded into the vector database.
- AI generates grounded responses using RAG.
- Every response contains valid citations.
- Investor memory works correctly.
- Personalized recommendations are generated.
- Docker containers run successfully.
- Terraform provisions infrastructure successfully.
- CI/CD pipeline deploys automatically.
- Application is publicly accessible.
- AWS deployment is operational.
- Documentation is complete and professional.