-- CreateEnum
CREATE TYPE "SubscriptionFailureReason" AS ENUM ('EXPIRED', 'DENIED', 'CANCELED_BY_USER', 'FAILED_DEBIT', 'OTHER');

-- AlterEnum
ALTER TYPE "SubscriptionStatus" ADD VALUE 'FAILED';

-- AlterTable
ALTER TABLE "subscription" ADD COLUMN     "failureCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "failureNotificationSentAt" TIMESTAMP(3),
ADD COLUMN     "failureReason" "SubscriptionFailureReason",
ADD COLUMN     "lastFailureAt" TIMESTAMP(3),
ADD COLUMN     "lastFailureMessage" TEXT,
ADD COLUMN     "lastRetryAt" TIMESTAMP(3),
ADD COLUMN     "nextRetryAt" TIMESTAMP(3);
