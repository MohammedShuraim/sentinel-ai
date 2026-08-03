#!/bin/sh
set -eu

echo "Running database migrations..."
alembic upgrade head

echo "Starting Sentellent API..."
exec "$@"
