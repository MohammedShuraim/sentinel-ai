# Sentellent Terraform Foundation

Production-oriented Terraform baseline for Sentellent. This sprint configures
providers, variables, and placeholders only — **no AWS resources are created**.

## Prerequisites

- [Terraform](https://developer.hashicorp.com/terraform/install) `>= 1.6`
- AWS credentials configured for the target account (`aws configure`, env vars,
  or an IAM role). Region defaults to `ap-south-1`.
- Optional: copy example variables before planning:

```bash
cp terraform.tfvars.example terraform.tfvars
```

Do **not** commit `terraform.tfvars` if it contains real values or secrets.

## Commands

From this directory (`terraform/`):

```bash
# Format configuration to canonical style
terraform fmt

# Download providers (AWS ~> 5.80) into .terraform/
terraform init

# Static validation of configuration
terraform validate

# Preview changes — should show no resources to add in this sprint
terraform plan
```

## Layout

| File | Purpose |
|------|---------|
| `versions.tf` | Pins Terraform and AWS provider versions |
| `provider.tf` | AWS provider for `ap-south-1` with default tags |
| `variables.tf` | Project, region, instance, key pair, DB, tags |
| `main.tf` | Locals / comments; no resources yet |
| `outputs.tf` | Current metadata outputs + commented placeholders |
| `terraform.tfvars.example` | Safe example variable values |
| `user_data.sh` | Placeholder bootstrap script for future EC2 |
| `README.md` | This guide |

## Secrets policy

- Never hardcode API keys, DB passwords, or JWT secrets in `.tf` files.
- Prefer AWS Secrets Manager / SSM, or `TF_VAR_*` environment variables.
- Keep real `terraform.tfvars` out of git.

## Next sprints

Expect modules for VPC/networking, security groups, IAM, EC2/ECS compute, and
RDS PostgreSQL (+ pgvector) once this foundation is reviewed.
