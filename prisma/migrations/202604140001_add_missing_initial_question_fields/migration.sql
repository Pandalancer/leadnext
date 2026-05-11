-- Backfill migration for environments that were created before these JSON columns existed.
-- Safe to run on existing databases.

ALTER TABLE "AdminSettings"
  ADD COLUMN IF NOT EXISTS "initialLeadQuestions" JSONB;

ALTER TABLE "Lead"
  ADD COLUMN IF NOT EXISTS "initialQuestionResponses" JSONB;
