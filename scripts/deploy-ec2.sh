#!/usr/bin/env bash
# =============================================================================
# Sentellent — EC2 deploy helper (run ON the instance via GitHub Actions SSH)
#
# Required env:
#   ECR_REGISTRY    e.g. 549596002797.dkr.ecr.ap-south-1.amazonaws.com
#   ECR_PASSWORD    output of: aws ecr get-login-password (from CI, not stored on disk)
#   APP_DIR         absolute path to backend/ on the instance
#   IMAGE_TAG       immutable tag to deploy (GitHub commit SHA)
#
# Optional env (set explicitly by CI for clarity; derived from IMAGE_TAG if omitted):
#   BACKEND_IMAGE   full ECR ref for backend
#   FRONTEND_IMAGE  full ECR ref for frontend
#   HEALTH_RETRIES / HEALTH_SLEEP
#
# Rollback: re-run deploy with IMAGE_TAG=<previous-commit-sha> (images must exist in ECR).
# =============================================================================
set -euo pipefail

: "${ECR_REGISTRY:?ECR_REGISTRY is required}"
: "${ECR_PASSWORD:?ECR_PASSWORD is required}"
: "${APP_DIR:?APP_DIR is required}"
: "${IMAGE_TAG:?IMAGE_TAG is required (use git commit SHA for immutable deploys)}"

BACKEND_IMAGE="${BACKEND_IMAGE:-${ECR_REGISTRY}/sentellent-backend:${IMAGE_TAG}}"
FRONTEND_IMAGE="${FRONTEND_IMAGE:-${ECR_REGISTRY}/sentellent-frontend:${IMAGE_TAG}}"
HEALTH_RETRIES="${HEALTH_RETRIES:-36}"
HEALTH_SLEEP="${HEALTH_SLEEP:-5}"

export IMAGE_TAG
export ECR_REGISTRY
export BACKEND_IMAGE
export FRONTEND_IMAGE

echo "==> Logging into Amazon ECR: ${ECR_REGISTRY}"
echo "${ECR_PASSWORD}" | docker login --username AWS --password-stdin "${ECR_REGISTRY}"

echo "==> Deploy directory: ${APP_DIR}"
cd "${APP_DIR}"

if [[ ! -f docker-compose.prod.yml ]]; then
  echo "ERROR: docker-compose.prod.yml not found in ${APP_DIR}" >&2
  exit 1
fi

if [[ ! -f .env ]]; then
  echo "ERROR: .env not found in ${APP_DIR} (required for RDS / secrets)" >&2
  exit 1
fi

echo "==> Immutable deployment"
echo "    IMAGE_TAG=${IMAGE_TAG}"
echo "    BACKEND_IMAGE=${BACKEND_IMAGE}"
echo "    FRONTEND_IMAGE=${FRONTEND_IMAGE}"

echo "==> Pulling images"
docker compose -f docker-compose.prod.yml pull

echo "==> Starting / updating containers"
docker compose -f docker-compose.prod.yml up -d --remove-orphans

echo "==> Waiting for backend health (/health)"
backend_ok=0
for ((i = 1; i <= HEALTH_RETRIES; i++)); do
  if curl -fsS "http://127.0.0.1:8000/health" >/dev/null 2>&1; then
    echo "Backend healthy on attempt ${i}"
    backend_ok=1
    break
  fi
  echo "Waiting for backend... (${i}/${HEALTH_RETRIES})"
  sleep "${HEALTH_SLEEP}"
done

if [[ "${backend_ok}" -ne 1 ]]; then
  echo "ERROR: backend failed health check" >&2
  docker compose -f docker-compose.prod.yml ps >&2 || true
  docker compose -f docker-compose.prod.yml logs --tail=80 backend >&2 || true
  exit 1
fi

echo "==> Waiting for frontend health (:3000)"
frontend_ok=0
for ((i = 1; i <= HEALTH_RETRIES; i++)); do
  code="$(curl -sS -o /dev/null -w "%{http_code}" "http://127.0.0.1:3000/" || true)"
  if [[ "${code}" =~ ^(200|301|302|307|308)$ ]]; then
    echo "Frontend healthy on attempt ${i} (HTTP ${code})"
    frontend_ok=1
    break
  fi
  echo "Waiting for frontend... (${i}/${HEALTH_RETRIES}, last HTTP ${code:-none})"
  sleep "${HEALTH_SLEEP}"
done

if [[ "${frontend_ok}" -ne 1 ]]; then
  echo "ERROR: frontend failed health check" >&2
  docker compose -f docker-compose.prod.yml ps >&2 || true
  docker compose -f docker-compose.prod.yml logs --tail=80 frontend >&2 || true
  exit 1
fi

echo "==> Deployment succeeded (immutable tag ${IMAGE_TAG})"
docker compose -f docker-compose.prod.yml ps
