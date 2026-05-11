DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'FollowUpStatus') THEN
-- CreateEnum
    CREATE TYPE "FollowUpStatus" AS ENUM ('PENDING', 'REMINDED', 'COMPLETED', 'SNOOZED', 'CANCELLED');
  END IF;
END
$$;


-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT IF EXISTS "User_adminId_fkey";

-- DropForeignKey
ALTER TABLE "Lead" DROP CONSTRAINT IF EXISTS "Lead_clientId_fkey";

-- DropIndex
DROP INDEX IF EXISTS "User_adminId_idx";

-- DropIndex
DROP INDEX IF EXISTS "Lead_clientId_idx";

-- DropIndex
DROP INDEX IF EXISTS "Lead_followUpDate_idx";

-- DropIndex
DROP INDEX IF EXISTS "Lead_clientId_phone_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN IF EXISTS "adminId",
DROP COLUMN IF EXISTS "settings",
ALTER COLUMN "role" SET DEFAULT 'ADMIN';

-- AlterTable
ALTER TABLE "Lead" DROP COLUMN IF EXISTS "clientId",
DROP COLUMN IF EXISTS "followUpDate",
DROP COLUMN IF EXISTS "reminderSent",
ADD COLUMN IF NOT EXISTS "adminId" TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS "initialQuestionResponses" JSONB;

-- CreateTable
CREATE TABLE IF NOT EXISTS "AdminSettings" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "whatsappToken" TEXT,
    "whatsappPhoneNumberId" TEXT,
    "whatsappWebhookSecret" TEXT,
    "smtpHost" TEXT,
    "smtpPort" INTEGER,
    "smtpUser" TEXT,
    "smtpPass" TEXT,
    "emailFrom" TEXT,
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    "reminderLeadTime" INTEGER NOT NULL DEFAULT 30,
    "initialLeadQuestions" JSONB,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminSettings_pkey" PRIMARY KEY ("id")
);

-- DropTable
DROP TABLE IF EXISTS "SystemSettings";

-- CreateTable
CREATE TABLE IF NOT EXISTS "SystemSettings" (
    "id" TEXT NOT NULL,
    "settings" JSONB,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "SystemSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "FollowUp" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "status" "FollowUpStatus" NOT NULL DEFAULT 'PENDING',
    "reminderSentAt" TIMESTAMP(3),
    "reminderChannel" TEXT,
    "completedAt" TIMESTAMP(3),
    "snoozedUntil" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FollowUp_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "AdminSettings_adminId_key" ON "AdminSettings"("adminId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Lead_adminId_idx" ON "Lead"("adminId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Lead_createdAt_idx" ON "Lead"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Lead_adminId_phone_key" ON "Lead"("adminId", "phone");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "FollowUp_leadId_idx" ON "FollowUp"("leadId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "FollowUp_adminId_idx" ON "FollowUp"("adminId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "FollowUp_scheduledAt_idx" ON "FollowUp"("scheduledAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "FollowUp_status_idx" ON "FollowUp"("status");

-- AddForeignKey
ALTER TABLE "AdminSettings" DROP CONSTRAINT IF EXISTS "AdminSettings_adminId_fkey";
ALTER TABLE "AdminSettings" ADD CONSTRAINT "AdminSettings_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" DROP CONSTRAINT IF EXISTS "Lead_adminId_fkey";
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FollowUp" DROP CONSTRAINT IF EXISTS "FollowUp_leadId_fkey";
ALTER TABLE "FollowUp" ADD CONSTRAINT "FollowUp_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FollowUp" DROP CONSTRAINT IF EXISTS "FollowUp_adminId_fkey";
ALTER TABLE "FollowUp" ADD CONSTRAINT "FollowUp_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
