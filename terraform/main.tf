# =============================================================================
# Sentellent — shared locals
#
# Networking: networking.tf · Compute: compute.tf
# Keep secrets out of Terraform source (TF_VAR_*, Secrets Manager, or
# gitignored terraform.tfvars).
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
# - module "database" { ... }  # RDS PostgreSQL + pgvector
# - Route53, NAT Gateway, Load Balancer, Auto Scaling, CloudFront
