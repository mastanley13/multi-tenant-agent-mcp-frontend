#!/usr/bin/env bash
set -euo pipefail

COMPOSE_FILE="$(dirname "$0")/../deploy/docker-compose.prod.yml"

# Bring up the stack
DOCKER_HOST=${DOCKER_HOST:-} docker compose -f "$COMPOSE_FILE" pull --quiet || true
DOCKER_HOST=${DOCKER_HOST:-} docker compose -f "$COMPOSE_FILE" up -d

echo "Waiting for backend health..."
for i in {1..30}; do
  if curl -fs http://localhost:3001/health >/dev/null; then
    echo "Backend healthy ✅"
    exit 0
  fi
  sleep 2
done

echo "Backend failed health check ❌"
exit 1 