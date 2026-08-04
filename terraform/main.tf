# =============================================================================
# Sentellent — Terraform foundation
#
# This sprint intentionally defines NO AWS resources (no VPC, EC2, RDS,
# security groups, IAM, etc.). Variables, provider config, and placeholders
# below establish a consistent baseline for later infrastructure sprints.
# =============================================================================

locals {
  name_prefix = "${var.project_name}-${var.environment}"

  common_tags = merge(
    {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "terraform"
    },
    var.tags,
  )
}

# Future resources will be added in subsequent sprints, for example:
# - module "network" { ... }   # VPC, subnets, NAT
# - module "compute" { ... }   # EC2 / ECS / ALB
# - module "database" { ... }  # RDS PostgreSQL + pgvector
# - module "security" { ... }  # Security groups, IAM roles
#
# Keep secrets out of Terraform source. Prefer:
# - TF_VAR_* environment variables
# - AWS Secrets Manager / SSM Parameter Store
# - gitignored terraform.tfvars (never commit real secrets)
