#!/bin/bash
set -e

echo "Running Prisma migrations..."

if [ -z "$DATABASE_URL" ]; then
  echo "Warning: DATABASE_URL not set, skipping migrations"
  exit 0
fi

prisma migrate deploy

echo "Migrations completed successfully"