#!/bin/bash
set -e

# Wait for Postgres to be ready
echo "Waiting for PostgreSQL to be ready..."
while ! nc -z $DB_HOST $DB_PORT; do
  sleep 0.1
done
echo "PostgreSQL is ready!"

# Run migrations
echo "Running database migrations..."
poetry run alembic upgrade head

# Execute the main command
exec "$@"