#!/usr/bin/env bash
set -euo pipefail

PRISMA_BIN="./node_modules/.bin/prisma"
if [[ ! -x "$PRISMA_BIN" ]]; then
  echo "ERROR: Prisma CLI not found at $PRISMA_BIN. Run npm install first."
  exit 1
fi

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "ERROR: DATABASE_URL is not set."
  echo "Tip: pull Vercel env vars first (for example: vercel env pull .env.vercel)."
  exit 1
fi

if [[ -z "${DIRECT_URL:-}" ]]; then
  echo "WARN: DIRECT_URL is not set. Prisma migrate may still work with DATABASE_URL only."
fi

echo "==> Checking migration status"
"$PRISMA_BIN" migrate status --schema prisma/schema.prisma

echo "==> Verifying required columns exist in production database"
SQL=$(cat <<'SQL'
WITH required_columns AS (
  SELECT * FROM (VALUES
    ('AdminSettings', 'initialLeadQuestions'),
    ('Lead', 'initialQuestionResponses')
  ) AS t(table_name, column_name)
)
SELECT
  rc.table_name,
  rc.column_name,
  CASE WHEN c.column_name IS NULL THEN 'missing' ELSE 'present' END AS status
FROM required_columns rc
LEFT JOIN information_schema.columns c
  ON c.table_schema = 'public'
 AND c.table_name = rc.table_name
 AND c.column_name = rc.column_name
ORDER BY rc.table_name, rc.column_name;
SQL
)

RESULT=$(printf '%s\n' "$SQL" | "$PRISMA_BIN" db execute --schema prisma/schema.prisma --stdin)
echo "$RESULT"

if echo "$RESULT" | grep -q "missing"; then
  echo "ERROR: One or more required columns are missing in the target database."
  exit 2
fi

echo "==> Schema verification passed"
