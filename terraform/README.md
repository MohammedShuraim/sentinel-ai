# Sentellent Terraform

Production-oriented Terraform for Sentellent. Current scope:

- **Networking** — VPC, public subnet, IGW, route table, app security group
- **Compute** — Amazon Linux 2023 EC2, IAM instance profile (SSM), Elastic IP
- **Database** — private subnets, DB subnet group, RDS PostgreSQL (encrypted, private)

## Prerequisites

- [Terraform](https://developer.hashicorp.com/terraform/install) `>= 1.6`
- AWS credentials for the target account (`aws configure`, env vars, or IAM role)
- An existing EC2 key pair named `sentellent-key` in `ap-south-1` (not created by Terraform)

```bash
cp terraform.tfvars.example terraform.tfvars
```

Set `ssh_ingress_cidr` to your public IP `/32` before relying on SSH.

For the RDS master password, either:

```bash
# PowerShell
$env:TF_VAR_db_password = "your-strong-password"

# bash
export TF_VAR_db_password='your-strong-password'
```

…or leave it unset so Terraform auto-generates one (stored in state only).

Do **not** commit `terraform.tfvars` if it contains real values or secrets.

## Commands

From this directory (`terraform/`):

```bash
terraform fmt
terraform init
terraform validate
terraform plan
```

## Layout

| File | Purpose |
|------|---------|
| `versions.tf` | Pins Terraform, AWS, and random provider versions |
| `provider.tf` | AWS provider for `ap-south-1` with default tags |
| `variables.tf` | Project, networking, compute, database, tags |
| `main.tf` | Shared locals (`name_prefix`, `common_tags`, `db_password`) |
| `networking.tf` | VPC, public subnet, IGW, routes, app security group |
| `compute.tf` | EC2, IAM role/profile, Elastic IP |
| `database.tf` | Private subnets, DB subnet group, RDS SG, PostgreSQL |
| `outputs.tf` | Networking, compute, and database outputs |
| `terraform.tfvars.example` | Safe example variable values (no secrets) |
| `user_data.sh` | EC2 bootstrap placeholder |
| `README.md` | This guide |

## Secrets policy

- Never hardcode API keys, DB passwords, or JWT secrets in `.tf` files.
- Prefer `TF_VAR_db_password`, AWS Secrets Manager / SSM, or gitignored tfvars.
- Keep real `terraform.tfvars` out of git.

## Out of scope (for now)

Route53, NAT Gateway, Load Balancer, ECS, EKS, Auto Scaling, CloudFront.
