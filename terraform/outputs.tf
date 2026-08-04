# =============================================================================
# Stack outputs — networking layer + metadata
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
  description = "Standardized name prefix for resources."
  value       = local.name_prefix
}

output "vpc_id" {
  description = "ID of the Sentellent VPC."
  value       = aws_vpc.main.id
}

output "public_subnet_id" {
  description = "ID of the public subnet."
  value       = aws_subnet.public.id
}

output "internet_gateway_id" {
  description = "ID of the Internet Gateway."
  value       = aws_internet_gateway.main.id
}

output "public_route_table_id" {
  description = "ID of the public route table."
  value       = aws_route_table.public.id
}

output "security_group_id" {
  description = "ID of the application security group."
  value       = aws_security_group.app.id
}

# Placeholder: EC2 / compute instance ID once compute is provisioned.
# output "instance_id" {
#   description = "Primary application EC2 instance ID."
#   value       = aws_instance.app.id
# }

# Placeholder: RDS endpoint once the database is provisioned.
# output "db_endpoint" {
#   description = "RDS PostgreSQL endpoint hostname."
#   value       = aws_db_instance.main.address
# }
