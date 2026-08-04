#!/bin/bash
# =============================================================================
# Sentellent EC2 user-data placeholder
#
# This script is intentionally a no-op foundation. Wire it into an
# aws_instance (or launch template) in a later sprint once compute exists.
#
# Future responsibilities (outline only — do not implement here yet):
#   1. Update OS packages
#   2. Install Docker Engine + Docker Compose plugin
#   3. Configure the Docker daemon / log rotation
#   4. Authenticate to a container registry if needed
#   5. Pull and start Sentellent backend / frontend / postgres stack
#   6. Write health-check / cloud-init completion markers
# =============================================================================

set -euo pipefail

echo "[sentellent] user-data placeholder starting on $(hostname) at $(date -u +%Y-%m-%dT%H:%M:%SZ)"

# --- Package refresh (future) ------------------------------------------------
# apt-get update -y
# apt-get upgrade -y

# --- Docker installation (future) --------------------------------------------
# curl -fsSL https://get.docker.com | sh
# systemctl enable --now docker
# usermod -aG docker ubuntu   # or the AMI default user

# --- Application bootstrap (future) ------------------------------------------
# mkdir -p /opt/sentellent
# # render compose file / env from SSM or Secrets Manager
# docker compose -f /opt/sentellent/docker-compose.yml up -d

echo "[sentellent] user-data placeholder complete — no packages installed"
