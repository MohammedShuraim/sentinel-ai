# Sentellent Terraform

Production-oriented Terraform for Sentellent. Current scope:

- **Networking** — VPC, public subnet, IGW, route table, app security group
- **Compute** — Amazon Linux 2023 EC2, IAM instance profile (SSM), Elastic IP

## Prerequisites

- [Terraform](https://developer.hashicorp.com/terraform/install) `>= 1.6`
- AWS credentials for the target account (`aws configure`, env vars, or IAM role)
- An existing EC2 key pair named `sentellent-key` in `ap-south-1` (not created by Terraform)

```bash
cp terraform.tfvars.example terraform.tfvars
```

Set `ssh_ingress_cidr` to your public IP `/32` before relying on SSH. Do
**not** commit `terraform.tfvars` if it contains real values or secrets.

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
| `versions.tf` | Pins Terraform and AWS provider versions |
| `provider.tf` | AWS provider for `ap-south-1` with default tags |
| `variables.tf` | Project, region, networking, instance, key pair, DB, tags |
| `main.tf` | Shared locals (`name_prefix`, `common_tags`) |
| `networking.tf` | VPC, subnet, IGW, routes, security group |
| `compute.tf` | EC2, IAM role/profile, Elastic IP, AL2023 AMI data source |
| `outputs.tf` | Networking + compute outputs |
| `terraform.tfvars.example` | Safe example variable values |
| `user_data.sh` | EC2 bootstrap placeholder (wired to the instance) |
| `README.md` | This guide |

## Secrets policy

- Never hardcode API keys, DB passwords, or JWT secrets in `.tf` files.
- Prefer AWS Secrets Manager / SSM, or `TF_VAR_*` environment variables.
- Keep real `terraform.tfvars` out of git.

## Out of scope (for now)

RDS, Route53, NAT Gateway, Load Balancer, Auto Scaling, CloudFront.
