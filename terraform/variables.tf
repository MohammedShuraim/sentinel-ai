variable "project_name" {
  description = "Short project identifier used for naming and default tags."
  type        = string
  default     = "sentellent"

  validation {
    condition     = can(regex("^[a-z0-9-]+$", var.project_name))
    error_message = "project_name must be lowercase alphanumeric with hyphens only."
  }
}

variable "environment" {
  description = "Deployment environment label (e.g. dev, staging, prod)."
  type        = string
  default     = "dev"

  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "environment must be one of: dev, staging, prod."
  }
}

variable "aws_region" {
  description = "AWS region for all resources."
  type        = string
  default     = "ap-south-1"
}

# ---------------------------------------------------------------------------
# Networking
# ---------------------------------------------------------------------------

variable "vpc_cidr" {
  description = "CIDR block for the Sentellent VPC."
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidr" {
  description = "CIDR block for the public subnet."
  type        = string
  default     = "10.0.1.0/24"
}

variable "public_subnet_az" {
  description = "Availability zone for the public subnet."
  type        = string
  default     = "ap-south-1a"
}

variable "ssh_ingress_cidr" {
  description = "IPv4 CIDR allowed to SSH (port 22). Must be set explicitly — do not use 0.0.0.0/0 in production."
  type        = string
  default     = "127.0.0.1/32"

  validation {
    condition     = can(cidrhost(var.ssh_ingress_cidr, 0))
    error_message = "ssh_ingress_cidr must be a valid IPv4 CIDR (e.g. 203.0.113.10/32)."
  }
}

variable "instance_type" {
  description = "Default EC2 instance type for future compute resources."
  type        = string
  default     = "t3.micro"
}

variable "key_pair_name" {
  description = "Name of an existing EC2 key pair in the target account/region. Do not put private key material here."
  type        = string
  default     = ""
}

# ---------------------------------------------------------------------------
# Database settings (non-secret). Passwords and connection secrets belong in
# environment variables, AWS Secrets Manager, or a gitignored tfvars file —
# never commit real credentials.
# ---------------------------------------------------------------------------

variable "db_name" {
  description = "Application database name."
  type        = string
  default     = "sentellent"
}

variable "db_username" {
  description = "Master database username (non-secret identifier only)."
  type        = string
  default     = "sentellent_admin"
}

variable "db_engine_version" {
  description = "Preferred PostgreSQL major/minor version for future RDS."
  type        = string
  default     = "16.4"
}

variable "db_instance_class" {
  description = "Preferred RDS instance class for future database resources."
  type        = string
  default     = "db.t4g.micro"
}

variable "db_allocated_storage" {
  description = "Allocated storage in GiB for future RDS."
  type        = number
  default     = 20

  validation {
    condition     = var.db_allocated_storage >= 20
    error_message = "db_allocated_storage must be at least 20 GiB."
  }
}

variable "tags" {
  description = "Additional tags merged into provider default_tags."
  type        = map(string)
  default     = {}
}
