# =============================================================================
# Sentellent — shared locals
#
# Networking lives in networking.tf. Later sprints may add compute / database
# modules. Keep secrets out of Terraform source (TF_VAR_*, Secrets Manager,
# or gitignored terraform.tfvars).
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

# Future resources (not in this sprint):
# - module "compute" { ... }   # EC2 / ECS / ALB
# - module "database" { ... }  # RDS PostgreSQL + pgvector
# - IAM roles, Elastic IPs, Route53, NAT Gateway
