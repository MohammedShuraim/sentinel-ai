# Sentellent Terraform

Production-oriented Terraform for Sentellent. Current scope: **networking layer
only** (VPC, public subnet, IGW, route table, application security group).

## Prerequisites

- [Terraform](https://developer.hashicorp.com/terraform/install) `>= 1.6`
- AWS credentials configured for the target account (`aws configure`, env vars,
  or an IAM role). Region defaults to `ap-south-1`.
- Optional: copy example variables before planning:

```bash
cp terraform.tfvars.example terraform.tfvars
```

Set `ssh_ingress_cidr` to your public IP `/32` before relying on SSH. Do
**not** commit `terraform.tfvars` if it contains real values or secrets.

## Commands

From this directory (`terraform/`):

```bash
# Format configuration to canonical style
terraform fmt

# Download providers (AWS ~> 5.80) into .terraform/
terraform init

# Static validation of configuration
terraform validate

# Preview networking changes (does not create resources)
terraform plan
```

## Layout

| File | Purpose |
|------|---------|
| `versions.tf` | Pins Terraform and AWS provider versions |
| `provider.tf` | AWS provider for `ap-south-1` with default tags |
| `variables.tf` | Project, region, networking, instance, key pair, DB, tags |
| `main.tf` | Shared locals (`name_prefix`, `common_tags`) |
| `networking.tf` | VPC, subnet, IGW, routes, security group |
| `outputs.tf` | VPC / subnet / IGW / route table / SG IDs |
| `terraform.tfvars.example` | Safe example variable values |
| `user_data.sh` | Placeholder bootstrap script for future EC2 |
| `README.md` | This guide |

## Secrets policy

- Never hardcode API keys, DB passwords, or JWT secrets in `.tf` files.
- Prefer AWS Secrets Manager / SSM, or `TF_VAR_*` environment variables.
- Keep real `terraform.tfvars` out of git.

## Next sprints

Expect compute (EC2/ECS), IAM, and RDS PostgreSQL (+ pgvector). NAT Gateway,
Elastic IP, Route53, and load balancers are intentionally out of scope for now.
