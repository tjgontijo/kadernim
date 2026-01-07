-- AlterTable: Add eventType column to notification_template
ALTER TABLE "notification_template" ADD COLUMN "eventType" TEXT NOT NULL DEFAULT 'user.login';

-- CreateIndex: Add index on eventType
CREATE INDEX "notification_template_eventType_idx" ON "notification_template"("eventType");

-- Remove default after adding the column (for future inserts to require explicit value)
ALTER TABLE "notification_template" ALTER COLUMN "eventType" DROP DEFAULT;
