# 1. Infrastructure Overview

The infrastructure layer provides a secure, scalable, and reliable foundation for deploying and operating the Sentellent platform. It supports the frontend application, backend services, AI workflows, databases, vector storage, and background processing while ensuring high availability, security, and maintainability.

The infrastructure is designed using cloud-native principles and Infrastructure as Code (IaC), enabling automated deployment, monitoring, and scaling. AWS serves as the primary cloud platform, with Docker containers, Terraform, and GitHub Actions forming the deployment pipeline.

### Primary Responsibilities

- Host frontend and backend applications.
- Deploy AI services and background workers.
- Manage PostgreSQL and pgvector databases.
- Secure application communication.
- Automate infrastructure provisioning.
- Enable continuous integration and deployment.
- Support monitoring and centralized logging.
- Provide scalable and fault-tolerant services.

---

# 2. Design Goals

The infrastructure is designed to achieve the following objectives.

## Functional Goals

- Deploy applications in the cloud.
- Support AI-powered workflows.
- Enable automated deployments.
- Provide secure database connectivity.
- Support scheduled ingestion jobs.
- Enable centralized monitoring and logging.
- Automate infrastructure provisioning.

## Non-Functional Goals

- High availability.
- Horizontal scalability.
- Fault tolerance.
- Low operational overhead.
- Secure communication.
- Disaster recovery.
- Cost efficiency.
- Easy maintainability.

---

# 3. Infrastructure Architecture

The infrastructure follows a modular cloud architecture where each service performs a dedicated responsibility.

```text
                    Internet
                        │
                        ▼
                 CloudFront / CDN
                        │
                        ▼
              Application Load Balancer
                        │
        ┌───────────────┴───────────────┐
        ▼                               ▼
 Next.js Frontend               FastAPI Backend
                                        │
                 ┌──────────────────────┼─────────────────────┐
                 ▼                      ▼                     ▼
          LangGraph AI          PostgreSQL + pgvector   Background Workers
                 │                      │                     │
                 └──────────────┬───────┴─────────────────────┘
                                ▼
                         External Data Sources
```

### Core Components

- Next.js Frontend
- FastAPI Backend
- LangGraph AI Engine
- PostgreSQL Database
- pgvector Extension
- Background Workers
- Cloud Storage
- Monitoring Services
- CI/CD Pipeline

---

# 4. Cloud Architecture (AWS)

The platform is deployed using AWS cloud services to provide scalability, security, and operational reliability.

## AWS Services

| Service | Purpose |
|----------|---------|
| Amazon ECS Fargate | Run containerized applications |
| Amazon RDS PostgreSQL | Relational database |
| pgvector | Vector similarity search |
| Application Load Balancer | Traffic distribution |
| Amazon CloudFront | Content delivery |
| Amazon ECR | Container image repository |
| AWS Secrets Manager | Secret storage |
| Amazon CloudWatch | Monitoring and logging |
| AWS IAM | Identity and access management |
| Amazon S3 | Static assets and backups |

## Cloud Design Principles

- Managed cloud services where possible.
- Stateless application containers.
- Infrastructure automation.
- High availability.
- Secure networking.
- Elastic scaling.
- Operational simplicity.

# 5. Networking Architecture

The networking layer provides secure communication between application components while isolating critical infrastructure from public access.

## Network Components

| Component | Purpose |
|-----------|---------|
| Virtual Private Cloud (VPC) | Isolated cloud network |
| Public Subnets | Load Balancer and public services |
| Private Subnets | Backend services and databases |
| Internet Gateway | Internet connectivity |
| NAT Gateway | Outbound internet access for private resources |
| Security Groups | Instance-level firewall rules |
| Network ACLs | Subnet-level traffic filtering |

## Network Design Principles

- Isolate application and database layers.
- Restrict database access to private networks.
- Allow only HTTPS traffic from the internet.
- Encrypt all network communication.
- Minimize publicly accessible resources.
- Follow the principle of least privilege.

---

# 6. Containerization Strategy

The platform uses Docker containers to provide consistent application environments across development, testing, and production.

## Container Components

| Container | Purpose |
|-----------|---------|
| Frontend Container | Hosts the Next.js application |
| Backend Container | Hosts the FastAPI application |
| AI Worker Container | Executes LangGraph workflows |
| Background Worker | Handles scheduled ingestion and processing |

## Container Design Principles

- Package each service independently.
- Keep container images lightweight.
- Use multi-stage Docker builds.
- Store configuration externally.
- Run one primary process per container.
- Restart failed containers automatically.
- Ensure immutable deployments.

## Container Benefits

- Consistent deployment.
- Environment isolation.
- Faster application delivery.
- Simplified scaling.
- Improved portability.

---

# 7. Infrastructure as Code (Terraform)

Infrastructure resources are provisioned and managed using Terraform to ensure consistency, repeatability, and version control.

## Managed Resources

- Virtual Private Cloud (VPC).
- Subnets.
- Internet Gateway.
- NAT Gateway.
- Security Groups.
- ECS Cluster.
- ECS Services.
- Amazon RDS PostgreSQL.
- Amazon ECR.
- CloudFront Distribution.
- Application Load Balancer.
- IAM Roles and Policies.
- CloudWatch Resources.
- S3 Buckets.

## Terraform Design Principles

- Store infrastructure as code.
- Use reusable Terraform modules.
- Maintain environment-specific configurations.
- Version infrastructure changes.
- Automate infrastructure deployment.
- Review infrastructure changes before applying.

## Terraform Workflow

1. Initialize Terraform.
2. Validate configuration.
3. Generate execution plan.
4. Review planned changes.
5. Apply infrastructure.
6. Verify deployment.

---

# 8. CI/CD Pipeline

Continuous Integration and Continuous Deployment automate the build, testing, and deployment process.

## CI/CD Workflow

1. Developer pushes code to GitHub.
2. GitHub Actions pipeline starts.
3. Install project dependencies.
4. Execute automated tests.
5. Perform code quality checks.
6. Build Docker images.
7. Push images to Amazon ECR.
8. Apply Terraform changes.
9. Deploy updated containers.
10. Perform deployment verification.

## CI Pipeline

- Dependency installation.
- Static code analysis.
- Unit testing.
- Integration testing.
- Build verification.

## CD Pipeline

- Build Docker images.
- Push container images.
- Provision infrastructure.
- Deploy application.
- Validate deployment.
- Roll back on failure.

## CI/CD Design Principles

- Automate deployments.
- Fail fast on errors.
- Maintain deployment history.
- Support rollback strategies.
- Minimize deployment downtime.
- Secure deployment credentials.

# 9. Secrets & Configuration Management

The platform securely manages application secrets and environment-specific configurations to protect sensitive information and support multiple deployment environments.

## Managed Secrets

- Database credentials.
- JWT signing keys.
- Google OAuth client credentials.
- OpenAI API keys.
- AWS access credentials.
- Third-party API keys.
- Encryption keys.

## Configuration Sources

| Configuration | Source |
|--------------|--------|
| Environment Variables | Runtime Configuration |
| AWS Secrets Manager | Sensitive Secrets |
| Terraform Variables | Infrastructure Configuration |
| GitHub Secrets | CI/CD Pipeline |

## Configuration Principles

- Never store secrets in source code.
- Encrypt sensitive credentials.
- Rotate secrets periodically.
- Restrict access using IAM policies.
- Separate development, staging, and production configurations.
- Audit secret access regularly.

---

# 10. Database Deployment

The platform uses Amazon RDS PostgreSQL with the pgvector extension to store structured application data and vector embeddings for Retrieval-Augmented Generation (RAG).

## Database Components

| Component | Purpose |
|-----------|---------|
| Amazon RDS PostgreSQL | Relational Database |
| pgvector | Vector Similarity Search |
| Alembic | Database Migrations |
| Automated Backups | Data Recovery |
| Read Replicas (Future) | Read Scalability |

## Deployment Strategy

- Deploy PostgreSQL using Amazon RDS.
- Enable pgvector extension.
- Execute database migrations automatically.
- Store backups securely.
- Restrict public database access.
- Encrypt data at rest and in transit.

## Database Design Principles

- High availability.
- Automated backups.
- Transactional consistency.
- Secure connectivity.
- Scalable storage.
- Continuous monitoring.

---

# 11. AI Infrastructure

The AI infrastructure supports LangGraph orchestration, Retrieval-Augmented Generation (RAG), vector search, and personalized recommendation workflows.

## AI Components

| Component | Purpose |
|-----------|---------|
| LangGraph | Workflow Orchestration |
| OpenAI GPT-5.5 | Response Generation |
| Embedding Model | Vector Generation |
| pgvector | Semantic Search |
| Memory Store | Investor Memory |
| Recommendation Engine | Personalized Recommendations |

## AI Infrastructure Responsibilities

- Execute AI workflows.
- Generate embeddings.
- Retrieve contextual documents.
- Manage investor memory.
- Generate grounded responses.
- Produce citation-aware recommendations.

## AI Infrastructure Principles

- Modular architecture.
- Stateless processing.
- Efficient vector retrieval.
- Cached embeddings.
- Scalable AI services.
- Reliable workflow execution.

---

# 12. Background Jobs & Scheduling

Background workers automate periodic data ingestion, document processing, and system maintenance without affecting user-facing services.

## Scheduled Jobs

| Job | Purpose |
|-----|---------|
| News Refresh | Retrieve latest financial news |
| Fundamentals Refresh | Update company fundamentals |
| Embedding Generation | Generate vector embeddings |
| Sentiment Analysis | Analyze newly ingested articles |
| Memory Optimization | Optimize investor memory |
| Cleanup Tasks | Remove expired or duplicate data |

## Scheduling Strategy

- Execute scheduled jobs automatically.
- Support manual job execution.
- Retry failed jobs.
- Log job execution history.
- Prevent duplicate executions.
- Support concurrent processing.

## Background Processing Principles

- Idempotent job execution.
- Concurrent processing support.
- Automatic retry policies.
- Failure isolation.
- Job monitoring.
- Audit logging.


# 13. Monitoring & Logging

The platform implements centralized monitoring and logging to ensure operational visibility, rapid issue detection, and efficient troubleshooting.

## Monitoring Components

| Component | Purpose |
|-----------|---------|
| Amazon CloudWatch | Infrastructure and application monitoring |
| ECS Metrics | Container health and resource utilization |
| RDS Monitoring | Database performance metrics |
| Application Logs | Backend and AI service logs |
| GitHub Actions | Deployment monitoring |

## Monitoring Metrics

- CPU utilization.
- Memory utilization.
- API response latency.
- Error rates.
- AI response latency.
- Database performance.
- Background job execution.
- Container health status.

## Logging Principles

- Centralize application logs.
- Log infrastructure events.
- Record deployment history.
- Capture application errors.
- Monitor scheduled jobs.
- Retain logs for auditing.

---

# 14. Security Architecture

The infrastructure follows a defense-in-depth approach to protect application resources, user data, and AI services.

## Security Controls

- HTTPS for all external communication.
- Google OAuth 2.0 authentication.
- JWT-based authorization.
- IAM role-based access control.
- Security Groups and Network ACLs.
- Encryption at rest.
- Encryption in transit.
- Secure secret management.
- Database access restricted to private networks.
- Regular dependency updates.

## Security Principles

- Least privilege access.
- Zero hardcoded secrets.
- Network isolation.
- Continuous security monitoring.
- Secure infrastructure provisioning.
- Regular vulnerability assessments.

---

# 15. Scalability Strategy

The infrastructure is designed to support increasing workloads while maintaining performance and reliability.

## Scalability Features

- Stateless application containers.
- Horizontal service scaling.
- Load-balanced traffic distribution.
- Managed database scaling.
- Independent AI worker scaling.
- Background worker scaling.
- CDN for static content delivery.
- Modular service architecture.

## Scaling Principles

- Scale services independently.
- Avoid single points of failure.
- Support increasing user traffic.
- Optimize resource utilization.
- Maintain consistent performance.

---

# 16. Backup & Disaster Recovery

The infrastructure includes backup and recovery mechanisms to minimize data loss and reduce service downtime.

## Backup Strategy

- Automated database backups.
- Infrastructure version control.
- Container image versioning.
- Configuration backups.
- Log retention.
- Scheduled backup verification.

## Recovery Strategy

- Restore database from automated backups.
- Redeploy infrastructure using Terraform.
- Redeploy containers from Amazon ECR.
- Restore application configuration.
- Validate application functionality after recovery.

## Recovery Objectives

- Minimize Recovery Time Objective (RTO).
- Minimize Recovery Point Objective (RPO).
- Protect critical business data.
- Ensure reliable service restoration.

---

# 17. Cost Optimization

The infrastructure is designed to balance performance, reliability, and operational cost.

## Cost Optimization Strategies

- Use managed cloud services.
- Scale services based on demand.
- Optimize container resource allocation.
- Remove unused cloud resources.
- Use lightweight container images.
- Cache reusable AI resources.
- Monitor infrastructure utilization.
- Optimize storage lifecycle policies.

---

# 18. Future Infrastructure Enhancements

Potential future improvements include:

- Multi-region deployment.
- Kubernetes orchestration.
- Auto-scaling AI workers.
- Dedicated vector database cluster.
- CDN optimization.
- Multi-cloud deployment.
- Service mesh architecture.
- Distributed caching.
- Event-driven processing.
- Advanced observability platform.

---

# 19. Infrastructure Summary

The infrastructure provides a secure, scalable, and automated foundation for deploying and operating the Sentellent platform.

Key characteristics include:

- Cloud-native architecture.
- Docker containerization.
- AWS deployment.
- Terraform-based infrastructure.
- Automated CI/CD pipelines.
- Secure secret management.
- AI-ready infrastructure.
- High availability.
- Scalable services.
- Comprehensive monitoring.

---

# Appendix A – Infrastructure Naming Conventions

The following conventions are used throughout the infrastructure.

- Terraform resources use `snake_case`.
- Docker images use lowercase names.
- AWS resources include environment prefixes.
- Environment variables use `UPPER_SNAKE_CASE`.
- GitHub Actions workflows use descriptive names.
- Infrastructure modules follow functional grouping.
- Cloud resources use consistent naming across environments.

Consistent naming improves maintainability, automation, and operational visibility.

---

# Appendix B – Infrastructure Best Practices

The following best practices guide infrastructure implementation and maintenance.

- Manage infrastructure using Terraform.
- Store infrastructure in version control.
- Automate deployments through CI/CD.
- Use Docker for application packaging.
- Store secrets securely using AWS Secrets Manager.
- Enforce HTTPS for all communications.
- Restrict database access to private networks.
- Monitor infrastructure continuously.
- Enable automated backups.
- Design services for horizontal scalability.
- Implement idempotent background jobs.
- Maintain immutable deployments.
- Regularly review security configurations.
- Optimize infrastructure costs.
- Continuously validate disaster recovery procedures.

## Deployment Flow

The production deployment follows the sequence below.

```
Developer
      │
      ▼
GitHub
      │
      ▼
GitHub Actions
      │
      ▼
Amazon ECR
      │
      ▼
Amazon ECS Fargate
      │
      ▼
Application Load Balancer
      │
      ▼
Frontend / Backend
      │
      ▼
PostgreSQL + pgvector
```

# Environment Strategy

The infrastructure supports separate deployment environments.

| Environment | Purpose |
|-------------|---------|
| Development | Local development |
| Staging | Integration testing |
| Production | Live deployment |

Each environment maintains independent infrastructure, configuration, and secrets.

# Deployment Strategy

Application deployments follow an automated CI/CD workflow.

## Deployment Principles

- Zero manual deployment.
- Immutable Docker images.
- Automatic rollback on failure.
- Infrastructure validation.
- Database migration before application deployment.
- Health check verification.

# Health Checks

Infrastructure continuously validates application health.

## Health Endpoints

- /health
- /ready
- /live

Health checks verify:

- API availability.
- Database connectivity.
- AI service availability.
- Background worker status.

## Worker Deployment

Background workers execute independently from API services.

Responsibilities include:

- News ingestion.
- Fundamentals refresh.
- Embedding generation.
- Sentiment analysis.
- Memory optimization.

Independent workers improve scalability and fault isolation.

# Infrastructure Validation

Infrastructure changes are validated before deployment.

Validation includes:

- Terraform validation.
- Docker image build verification.
- Security scanning.
- Infrastructure plan review.
- Automated testing.

# Production Readiness Checklist

- Dockerized application.
- Automated CI/CD.
- Infrastructure as Code.
- Secure secret management.
- Monitoring enabled.
- Automated backups.
- Health checks configured.
- Logging enabled.
- HTTPS enforced.
- Database migrations automated.

# Appendix C – DevOps Best Practices

The following best practices guide infrastructure operations.

- Automate infrastructure provisioning.
- Store infrastructure as code.
- Deploy immutable Docker images.
- Automate database migrations.
- Validate infrastructure before deployment.
- Use least-privilege IAM roles.
- Enable centralized logging.
- Monitor infrastructure continuously.
- Configure automated backups.
- Design services for horizontal scaling.
- Secure secrets outside source code.
- Test disaster recovery procedures regularly.