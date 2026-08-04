# =============================================================================
# Placeholder outputs — no resources exist yet in this foundation sprint.
# Uncomment / replace these once real resources are defined.
# =============================================================================

output "aws_region" {
  description = "AWS region configured for this stack."
  value       = var.aws_region
}

output "project_name" {
  description = "Project name used for naming and tags."
  value       = var.project_name
}

output "environment" {
  description = "Deployment environment label."
  value       = var.environment
}

output "name_prefix" {
  description = "Standardized name prefix for future resources."
  value       = local.name_prefix
}

# Placeholder: VPC ID once a network module exists.
# output "vpc_id" {
#   description = "ID of the Sentellent VPC."
#   value       = module.network.vpc_id
# }

# Placeholder: public subnet IDs once networking is provisioned.
# output "public_subnet_ids" {
#   description = "Public subnet IDs for load balancers / bastion hosts."
#   value       = module.network.public_subnet_ids
# }

# Placeholder: EC2 / compute instance ID once compute is provisioned.
# output "instance_id" {
#   description = "Primary application EC2 instance ID."
#   value       = aws_instance.app.id
# }

# Placeholder: RDS endpoint once the database is provisioned.
# output "db_endpoint" {
#   description = "RDS PostgreSQL endpoint hostname."
#   value       = aws_db_instance.main.address
#   # sensitive = true  # enable if endpoint should be treated as sensitive
# }
