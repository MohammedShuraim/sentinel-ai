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
#   5. Pull and start Sentellent backend / frontend / postgres stack
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
# mkdir -p /opt/sentellent
# # render compose file / env from SSM or Secrets Manager
# docker compose -f /opt/sentellent/docker-compose.yml up -d

echo "[sentellent] user-data placeholder complete — no packages installed"
