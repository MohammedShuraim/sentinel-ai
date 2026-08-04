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

output "ec2_instance_id" {
  description = "ID of the Sentellent EC2 instance."
  value       = aws_instance.app.id
}

output "ec2_public_ip" {
  description = "Public IPv4 address of the EC2 instance (after EIP association this matches the Elastic IP)."
  value       = aws_instance.app.public_ip
}

output "ec2_public_dns" {
  description = "Public DNS name of the EC2 instance."
  value       = aws_instance.app.public_dns
}

output "elastic_ip" {
  description = "Elastic IP address associated with the EC2 instance."
  value       = aws_eip.app.public_ip
}

output "iam_role_name" {
  description = "Name of the IAM role attached to the EC2 instance."
  value       = aws_iam_role.ec2.name
}

# Placeholder: RDS endpoint once the database is provisioned.
# output "db_endpoint" {
#   description = "RDS PostgreSQL endpoint hostname."
#   value       = aws_db_instance.main.address
# }
