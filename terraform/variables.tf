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

variable "private_subnet_cidrs" {
  description = "CIDR blocks for private subnets (must be two, in different AZs for RDS)."
  type        = list(string)
  default     = ["10.0.10.0/24", "10.0.11.0/24"]

  validation {
    condition     = length(var.private_subnet_cidrs) == 2
    error_message = "private_subnet_cidrs must contain exactly two CIDR blocks."
  }
}

variable "private_subnet_azs" {
  description = "Availability zones for the private subnets (paired with private_subnet_cidrs)."
  type        = list(string)
  default     = ["ap-south-1a", "ap-south-1b"]

  validation {
    condition     = length(var.private_subnet_azs) == 2 && var.private_subnet_azs[0] != var.private_subnet_azs[1]
    error_message = "private_subnet_azs must contain exactly two different Availability Zones."
  }
}

variable "instance_type" {
  description = "EC2 instance type for the Sentellent application host."
  type        = string
  default     = "t3.micro"
}

variable "key_pair_name" {
  description = "Name of an existing EC2 key pair in the target account/region (e.g. sentellent-key). Terraform does not create the key pair."
  type        = string
  default     = "sentellent-key"

  validation {
    condition     = length(var.key_pair_name) > 0
    error_message = "key_pair_name must reference an existing EC2 key pair name."
  }
}

# ---------------------------------------------------------------------------
# Database — identifiers via variables; password via TF_VAR_db_password or
# auto-generated (never hardcode secrets in .tf / committed tfvars).
# ---------------------------------------------------------------------------

variable "db_name" {
  description = "Initial PostgreSQL database name."
  type        = string
  default     = "sentellent"
}

variable "db_username" {
  description = "Master database username (non-secret identifier only)."
  type        = string
  default     = "sentellent_admin"
}

variable "db_password" {
  description = "Master database password. Set with TF_VAR_db_password or leave null to auto-generate (stored in state only)."
  type        = string
  sensitive   = true
  default     = null

  validation {
    condition = (
      var.db_password == null ||
      (length(var.db_password) >= 8 && length(var.db_password) <= 128)
    )
    error_message = "db_password must be null (auto-generate) or 8–128 characters."
  }
}

variable "db_engine_version" {
  description = "PostgreSQL engine version (major or major.minor)."
  type        = string
  default     = "16"
}

variable "db_instance_class" {
  description = "RDS instance class."
  type        = string
  default     = "db.t4g.micro"
}

variable "db_allocated_storage" {
  description = "Allocated storage in GiB."
  type        = number
  default     = 20

  validation {
    condition     = var.db_allocated_storage >= 20
    error_message = "db_allocated_storage must be at least 20 GiB."
  }
}

variable "db_max_allocated_storage" {
  description = "Upper limit for storage autoscaling in GiB. Set equal to allocated storage (or 0) to disable autoscaling — recommended for Free Tier accounts."
  type        = number
  default     = 20
}

variable "db_storage_type" {
  description = "RDS storage type (gp3 is Free Tier eligible General Purpose SSD)."
  type        = string
  default     = "gp3"

  validation {
    condition     = contains(["gp2", "gp3"], var.db_storage_type)
    error_message = "db_storage_type must be gp2 or gp3 for this academic Free Tier–compatible setup."
  }
}

variable "db_backup_retention_period" {
  description = "Automated backup retention in days (1–35). This AWS Free Tier account allows a maximum of 1 day — raise only after leaving Free Tier restrictions."
  type        = number
  default     = 1

  validation {
    condition     = var.db_backup_retention_period >= 1 && var.db_backup_retention_period <= 35
    error_message = "db_backup_retention_period must be between 1 and 35 days."
  }
}

variable "db_backup_window" {
  description = "Preferred daily backup window (UTC)."
  type        = string
  default     = "03:00-04:00"
}

variable "db_maintenance_window" {
  description = "Preferred weekly maintenance window (UTC)."
  type        = string
  default     = "sun:04:00-sun:05:00"
}

variable "db_multi_az" {
  description = "Enable Multi-AZ. Default false for academic cost; set true for higher availability."
  type        = bool
  default     = false
}

variable "db_deletion_protection" {
  description = "Prevent accidental RDS deletion."
  type        = bool
  default     = false
}

variable "db_skip_final_snapshot" {
  description = "Skip final snapshot on destroy (convenient for academic/dev)."
  type        = bool
  default     = true
}

variable "tags" {
  description = "Additional tags merged into provider default_tags."
  type        = map(string)
  default     = {}
}
