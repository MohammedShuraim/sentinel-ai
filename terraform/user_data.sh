#!/bin/bash
# =============================================================================
# Sentellent EC2 user-data (Amazon Linux 2023)
#
# Referenced by aws_instance.app in compute.tf. Currently a lightweight
# placeholder — extend in a later sprint for Docker / app bootstrap.
#
# Future responsibilities (outline only):
#   1. Update OS packages (dnf)
#   2. Install Docker Engine + Docker Compose plugin
#   3. Configure the Docker daemon / log rotation
#   4. Authenticate to a container registry if needed
#   5. Start backend + frontend via docker-compose.prod.yml (RDS, no local Postgres)
#   6. Write health-check / cloud-init completion markers
# =============================================================================

set -euo pipefail

echo "[sentellent] user-data placeholder starting on $(hostname) at $(date -u +%Y-%m-%dT%H:%M:%SZ)"

# --- Package refresh (future) ------------------------------------------------
# dnf update -y

# --- Docker installation (future) --------------------------------------------
# dnf install -y docker
# systemctl enable --now docker
# usermod -aG docker ec2-user

# --- Application bootstrap (future) ------------------------------------------
# mkdir -p /opt/sentellent/backend
# # Place .env with DATABASE_URL → Amazon RDS (never override in compose.prod)
# cd /opt/sentellent/backend
# docker compose -f docker-compose.prod.yml --env-file .env up -d --build

echo "[sentellent] user-data placeholder complete — no packages installed"
