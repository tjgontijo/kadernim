-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('user', 'subscriber', 'editor', 'manager', 'admin');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'OVERDUE', 'CANCELED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('PENDING', 'CONFIRMED', 'RECEIVED', 'OVERDUE', 'REFUNDED', 'REFUND_REQUESTED', 'CHARGEBACK_REQUESTED', 'CHARGEBACK_DISPUTE', 'AWAITING_CHARGEBACK_REVERSAL', 'DUNNING_REQUESTED', 'DUNNING_RECEIVED', 'AWAITING_RISK_ANALYSIS');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CREDIT_CARD', 'PIX', 'PIX_AUTOMATIC', 'BOLETO');

-- CreateEnum
CREATE TYPE "BillingPlanCode" AS ENUM ('monthly', 'annual');

-- CreateEnum
CREATE TYPE "BillingCycle" AS ENUM ('MONTHLY', 'YEARLY');

-- CreateEnum
CREATE TYPE "SplitType" AS ENUM ('PERCENTAGE', 'FIXED');

-- CreateEnum
CREATE TYPE "AuditActor" AS ENUM ('USER', 'ADMIN', 'SYSTEM');

-- CreateEnum
CREATE TYPE "ConfigType" AS ENUM ('string', 'number', 'boolean', 'json');

-- CreateTable
CREATE TABLE "education_level" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "education_level_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grade" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "educationLevelId" UUID NOT NULL,

    CONSTRAINT "grade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subject" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,

    CONSTRAINT "subject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grade_subject" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "gradeId" UUID NOT NULL,
    "subjectId" UUID NOT NULL,

    CONSTRAINT "grade_subject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'user',
    "banned" BOOLEAN NOT NULL DEFAULT false,
    "asaasCustomerId" TEXT,
    "asaasWalletId" TEXT,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" UUID NOT NULL,
    "impersonatedBy" TEXT,
    "activeOrganizationId" TEXT,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "slug" TEXT,
    "logo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "metadata" TEXT,

    CONSTRAINT "organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscription" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "offerId" UUID,
    "asaasId" TEXT,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'INACTIVE',
    "paymentMethod" "PaymentMethod",
    "pixAutomaticAuthId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "purchaseDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "canceledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "billing_plan" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "code" "BillingPlanCode" NOT NULL,
    "name" TEXT NOT NULL,
    "cycle" "BillingCycle" NOT NULL,
    "accessDays" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "billing_plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "billing_offer" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "code" TEXT NOT NULL,
    "planId" UUID NOT NULL,
    "paymentMethod" "PaymentMethod" NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'BRL',
    "maxInstallments" INTEGER NOT NULL DEFAULT 1,
    "installmentRate" DECIMAL(6,4),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "validFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "billing_offer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoice" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "subscriptionId" UUID,
    "offerId" UUID,
    "asaasId" TEXT NOT NULL,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'PENDING',
    "paymentMethod" "PaymentMethod" NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "netValue" DOUBLE PRECISION,
    "description" TEXT,
    "billingType" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "paidAt" TIMESTAMP(3),
    "refundedAt" TIMESTAMP(3),
    "invoiceUrl" TEXT,
    "bankSlipUrl" TEXT,
    "pixQrCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "split_config" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "companyName" TEXT NOT NULL,
    "cnpj" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "splitType" "SplitType" NOT NULL DEFAULT 'PERCENTAGE',
    "percentualValue" DOUBLE PRECISION,
    "fixedValue" DOUBLE PRECISION,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "split_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "billing_audit_log" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID,
    "actor" "AuditActor" NOT NULL DEFAULT 'SYSTEM',
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "asaasEventId" TEXT,
    "asaasPaymentId" TEXT,
    "previousState" JSONB,
    "newState" JSONB,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "billing_audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resource_grade" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "resourceId" UUID NOT NULL,
    "gradeId" UUID NOT NULL,

    CONSTRAINT "resource_grade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resource_image" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "resourceId" UUID NOT NULL,
    "cloudinaryPublicId" TEXT NOT NULL,
    "url" TEXT,
    "alt" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "resource_image_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resource_file" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "resourceId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "cloudinaryPublicId" TEXT NOT NULL,
    "url" TEXT,
    "fileType" TEXT,
    "sizeBytes" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "resource_file_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resource_video" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "resourceId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "cloudinaryPublicId" TEXT NOT NULL,
    "url" TEXT,
    "thumbnail" TEXT,
    "duration" INTEGER,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "resource_video_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resource_user_access" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "resourceId" UUID NOT NULL,
    "source" TEXT,
    "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "resource_user_access_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resource" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" TEXT NOT NULL,
    "description" TEXT,
    "educationLevelId" UUID NOT NULL,
    "subjectId" UUID NOT NULL,
    "externalId" INTEGER,
    "isFree" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "originRequestId" TEXT,

    CONSTRAINT "resource_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "education_level_name_key" ON "education_level"("name");

-- CreateIndex
CREATE UNIQUE INDEX "education_level_slug_key" ON "education_level"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "grade_slug_key" ON "grade"("slug");

-- CreateIndex
CREATE INDEX "grade_educationLevelId_idx" ON "grade"("educationLevelId");

-- CreateIndex
CREATE UNIQUE INDEX "subject_name_key" ON "subject"("name");

-- CreateIndex
CREATE UNIQUE INDEX "subject_slug_key" ON "subject"("slug");

-- CreateIndex
CREATE INDEX "grade_subject_gradeId_idx" ON "grade_subject"("gradeId");

-- CreateIndex
CREATE INDEX "grade_subject_subjectId_idx" ON "grade_subject"("subjectId");

-- CreateIndex
CREATE UNIQUE INDEX "grade_subject_gradeId_subjectId_key" ON "grade_subject"("gradeId", "subjectId");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_asaasCustomerId_key" ON "user"("asaasCustomerId");

-- CreateIndex
CREATE INDEX "account_userId_providerId_idx" ON "account"("userId", "providerId");

-- CreateIndex
CREATE UNIQUE INDEX "account_providerId_accountId_key" ON "account"("providerId", "accountId");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- CreateIndex
CREATE INDEX "session_userId_idx" ON "session"("userId");

-- CreateIndex
CREATE INDEX "session_expiresAt_idx" ON "session"("expiresAt");

-- CreateIndex
CREATE INDEX "verification_identifier_idx" ON "verification"("identifier");

-- CreateIndex
CREATE UNIQUE INDEX "organization_slug_key" ON "organization"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "subscription_userId_key" ON "subscription"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "subscription_asaasId_key" ON "subscription"("asaasId");

-- CreateIndex
CREATE UNIQUE INDEX "subscription_pixAutomaticAuthId_key" ON "subscription"("pixAutomaticAuthId");

-- CreateIndex
CREATE INDEX "subscription_userId_idx" ON "subscription"("userId");

-- CreateIndex
CREATE INDEX "subscription_offerId_idx" ON "subscription"("offerId");

-- CreateIndex
CREATE INDEX "subscription_asaasId_idx" ON "subscription"("asaasId");

-- CreateIndex
CREATE INDEX "subscription_status_idx" ON "subscription"("status");

-- CreateIndex
CREATE INDEX "subscription_isActive_idx" ON "subscription"("isActive");

-- CreateIndex
CREATE INDEX "subscription_expiresAt_idx" ON "subscription"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "billing_plan_code_key" ON "billing_plan"("code");

-- CreateIndex
CREATE INDEX "billing_plan_isActive_idx" ON "billing_plan"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "billing_offer_code_key" ON "billing_offer"("code");

-- CreateIndex
CREATE INDEX "billing_offer_planId_idx" ON "billing_offer"("planId");

-- CreateIndex
CREATE INDEX "billing_offer_planId_paymentMethod_isActive_idx" ON "billing_offer"("planId", "paymentMethod", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "invoice_asaasId_key" ON "invoice"("asaasId");

-- CreateIndex
CREATE INDEX "invoice_userId_idx" ON "invoice"("userId");

-- CreateIndex
CREATE INDEX "invoice_subscriptionId_idx" ON "invoice"("subscriptionId");

-- CreateIndex
CREATE INDEX "invoice_offerId_idx" ON "invoice"("offerId");

-- CreateIndex
CREATE INDEX "invoice_asaasId_idx" ON "invoice"("asaasId");

-- CreateIndex
CREATE INDEX "invoice_status_idx" ON "invoice"("status");

-- CreateIndex
CREATE UNIQUE INDEX "split_config_walletId_key" ON "split_config"("walletId");

-- CreateIndex
CREATE UNIQUE INDEX "billing_audit_log_asaasEventId_key" ON "billing_audit_log"("asaasEventId");

-- CreateIndex
CREATE INDEX "billing_audit_log_userId_idx" ON "billing_audit_log"("userId");

-- CreateIndex
CREATE INDEX "billing_audit_log_action_idx" ON "billing_audit_log"("action");

-- CreateIndex
CREATE INDEX "billing_audit_log_entity_entityId_idx" ON "billing_audit_log"("entity", "entityId");

-- CreateIndex
CREATE INDEX "billing_audit_log_asaasEventId_idx" ON "billing_audit_log"("asaasEventId");

-- CreateIndex
CREATE INDEX "resource_grade_resourceId_idx" ON "resource_grade"("resourceId");

-- CreateIndex
CREATE INDEX "resource_grade_gradeId_idx" ON "resource_grade"("gradeId");

-- CreateIndex
CREATE UNIQUE INDEX "resource_grade_resourceId_gradeId_key" ON "resource_grade"("resourceId", "gradeId");

-- CreateIndex
CREATE INDEX "resource_image_resourceId_order_idx" ON "resource_image"("resourceId", "order");

-- CreateIndex
CREATE INDEX "resource_file_resourceId_idx" ON "resource_file"("resourceId");

-- CreateIndex
CREATE INDEX "resource_video_resourceId_order_idx" ON "resource_video"("resourceId", "order");

-- CreateIndex
CREATE INDEX "resource_user_access_userId_resourceId_idx" ON "resource_user_access"("userId", "resourceId");

-- CreateIndex
CREATE UNIQUE INDEX "resource_user_access_userId_resourceId_key" ON "resource_user_access"("userId", "resourceId");

-- CreateIndex
CREATE UNIQUE INDEX "resource_externalId_key" ON "resource"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "resource_originRequestId_key" ON "resource"("originRequestId");

-- CreateIndex
CREATE INDEX "resource_educationLevelId_idx" ON "resource"("educationLevelId");

-- CreateIndex
CREATE INDEX "resource_subjectId_idx" ON "resource"("subjectId");

-- CreateIndex
CREATE INDEX "resource_title_id_idx" ON "resource"("title", "id");

-- AddForeignKey
ALTER TABLE "grade" ADD CONSTRAINT "grade_educationLevelId_fkey" FOREIGN KEY ("educationLevelId") REFERENCES "education_level"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grade_subject" ADD CONSTRAINT "grade_subject_gradeId_fkey" FOREIGN KEY ("gradeId") REFERENCES "grade"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grade_subject" ADD CONSTRAINT "grade_subject_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription" ADD CONSTRAINT "subscription_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "billing_offer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription" ADD CONSTRAINT "subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billing_offer" ADD CONSTRAINT "billing_offer_planId_fkey" FOREIGN KEY ("planId") REFERENCES "billing_plan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice" ADD CONSTRAINT "invoice_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "billing_offer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice" ADD CONSTRAINT "invoice_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "subscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice" ADD CONSTRAINT "invoice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billing_audit_log" ADD CONSTRAINT "billing_audit_log_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_grade" ADD CONSTRAINT "resource_grade_gradeId_fkey" FOREIGN KEY ("gradeId") REFERENCES "grade"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_grade" ADD CONSTRAINT "resource_grade_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "resource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_image" ADD CONSTRAINT "resource_image_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "resource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_file" ADD CONSTRAINT "resource_file_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "resource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_video" ADD CONSTRAINT "resource_video_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "resource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_user_access" ADD CONSTRAINT "resource_user_access_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "resource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_user_access" ADD CONSTRAINT "resource_user_access_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource" ADD CONSTRAINT "resource_educationLevelId_fkey" FOREIGN KEY ("educationLevelId") REFERENCES "education_level"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource" ADD CONSTRAINT "resource_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
