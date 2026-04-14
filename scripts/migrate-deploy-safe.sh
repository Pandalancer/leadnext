#!/usr/bin/env bash
set -euo pipefail

PRISMA_BIN="./node_modules/.bin/prisma"
SCHEMA_PATH="prisma/schema.prisma"
BASELINE_MIGRATION="0_init"
ALLOW_PRISMA_BASELINE="${ALLOW_PRISMA_BASELINE:-0}"

if [[ ! -x "$PRISMA_BIN" ]]; then
  echo "ERROR: Prisma CLI not found at $PRISMA_BIN. Run npm install first."
  exit 1
fi

if [[ ! -f "prisma/migrations/$BASELINE_MIGRATION/migration.sql" ]]; then
  echo "ERROR: Baseline migration prisma/migrations/$BASELINE_MIGRATION/migration.sql not found."
  exit 1
fi

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "ERROR: DATABASE_URL is not set."
  exit 1
fi

if [[ -z "${DIRECT_URL:-}" ]]; then
  echo "WARN: DIRECT_URL is not set."
fi

echo "==> Running prisma migrate deploy"
set +e
MIGRATE_OUTPUT=$($PRISMA_BIN migrate deploy --schema "$SCHEMA_PATH" 2>&1)
MIGRATE_EXIT=$?
set -e

echo "$MIGRATE_OUTPUT"

if [[ $MIGRATE_EXIT -eq 0 ]]; then
  echo "==> Migrations applied successfully"
  exit 0
fi

# P3005: The database schema is not empty and cannot be baselined automatically.
if echo "$MIGRATE_OUTPUT" | grep -q "P3005"; then
  if [[ "$ALLOW_PRISMA_BASELINE" != "1" ]]; then
    echo "ERROR: Prisma returned P3005 but automatic baseline is disabled."
    echo "Set ALLOW_PRISMA_BASELINE=1 to allow resolving '$BASELINE_MIGRATION' and retry."
    exit "$MIGRATE_EXIT"
  fi

  echo "==> Detected non-empty schema (P3005). Marking baseline migration as applied: $BASELINE_MIGRATION"
  $PRISMA_BIN migrate resolve --applied "$BASELINE_MIGRATION" --schema "$SCHEMA_PATH"

  echo "==> Re-running prisma migrate deploy after baseline resolve"
  $PRISMA_BIN migrate deploy --schema "$SCHEMA_PATH"
  exit 0
fi

echo "ERROR: prisma migrate deploy failed for an unexpected reason."
exit $MIGRATE_EXIT
