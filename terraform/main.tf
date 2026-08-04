# =============================================================================
# Sentellent — shared locals
#
# Networking: networking.tf · Compute: compute.tf · Database: database.tf
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

  # Prefer an explicitly supplied password; otherwise use the generated one.
  db_password = var.db_password != null ? var.db_password : random_password.db[0].result
}

# Out of scope for now: Route53, NAT Gateway, Load Balancer, ECS/EKS,
# Auto Scaling, CloudFront.
