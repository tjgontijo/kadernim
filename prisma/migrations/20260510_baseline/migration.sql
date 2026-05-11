-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "public"."AuditActor" AS ENUM ('USER', 'ADMIN', 'SYSTEM');

-- CreateEnum
CREATE TYPE "public"."BillingCycle" AS ENUM ('MONTHLY', 'YEARLY');

-- CreateEnum
CREATE TYPE "public"."BillingPlanCode" AS ENUM ('monthly', 'annual');

-- CreateEnum
CREATE TYPE "public"."ConfigType" AS ENUM ('string', 'number', 'boolean', 'json');

-- CreateEnum
CREATE TYPE "public"."EducationLevelType" AS ENUM ('EF', 'EM');

-- CreateEnum
CREATE TYPE "public"."InvoiceStatus" AS ENUM ('PENDING', 'CONFIRMED', 'RECEIVED', 'OVERDUE', 'REFUNDED', 'REFUND_REQUESTED', 'CHARGEBACK_REQUESTED', 'CHARGEBACK_DISPUTE', 'AWAITING_CHARGEBACK_REVERSAL', 'DUNNING_REQUESTED', 'DUNNING_RECEIVED', 'AWAITING_RISK_ANALYSIS');

-- CreateEnum
CREATE TYPE "public"."LessonPlanMode" AS ENUM ('FULL_LESSON', 'REVIEW', 'GROUP_ACTIVITY', 'DIAGNOSTIC', 'HOMEWORK');

-- CreateEnum
CREATE TYPE "public"."LessonPlanOrigin" AS ENUM ('RESOURCE', 'MANUAL');

-- CreateEnum
CREATE TYPE "public"."LessonPlanStatus" AS ENUM ('GENERATED', 'FAILED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "public"."PaymentMethod" AS ENUM ('CREDIT_CARD', 'PIX', 'PIX_AUTOMATIC', 'BOLETO');

-- CreateEnum
CREATE TYPE "public"."PdfKnowledgeSourceType" AS ENUM ('LOCAL_FILE', 'RESOURCE_FILE');

-- CreateEnum
CREATE TYPE "public"."QuestionBankDifficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- CreateEnum
CREATE TYPE "public"."QuestionBankExportFormat" AS ENUM ('DOCX', 'GOOGLE_DOCS');

-- CreateEnum
CREATE TYPE "public"."QuestionBankExportStatus" AS ENUM ('COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "public"."QuestionBankFeedbackRating" AS ENUM ('POSITIVE', 'NEGATIVE');

-- CreateEnum
CREATE TYPE "public"."QuestionBankFeedbackReason" AS ENUM ('TOO_EASY', 'TOO_HARD', 'UNCLEAR', 'CONCEPTUAL_ERROR', 'OUT_OF_BNCC', 'BAD_ANSWER_KEY', 'GRADE_MISMATCH', 'LANGUAGE_PROBLEM', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."QuestionBankRequestStatus" AS ENUM ('COMPLETED', 'PARTIAL', 'FAILED');

-- CreateEnum
CREATE TYPE "public"."QuestionBankStatus" AS ENUM ('DRAFT_AI', 'APPROVED_AI', 'APPROVED_TEACHER', 'FLAGGED', 'REJECTED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "public"."RelatedResourceType" AS ENUM ('COMPLEMENTS', 'PREREQUISITE', 'ADVANCED', 'RELATED_TOPIC');

-- CreateEnum
CREATE TYPE "public"."ResourceStepType" AS ENUM ('WARMUP', 'DISTRIBUTION', 'PRACTICE', 'CONCLUSION', 'DISCUSSION', 'ACTIVITY', 'REFLECTION');

-- CreateEnum
CREATE TYPE "public"."ResourceType" AS ENUM ('PRINTABLE_ACTIVITY', 'LESSON_PLAN', 'GAME', 'ASSESSMENT', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."ReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'FLAGGED');

-- CreateEnum
CREATE TYPE "public"."SplitType" AS ENUM ('PERCENTAGE', 'FIXED');

-- CreateEnum
CREATE TYPE "public"."SubjectComponentType" AS ENUM ('LINGUA_PORTUGUESA', 'ARTE', 'EDUCACAO_FISICA', 'LINGUA_INGLESA', 'MATEMATICA', 'CIENCIAS', 'HISTORIA', 'GEOGRAFIA', 'ENSINO_RELIGIOSO');

-- CreateEnum
CREATE TYPE "public"."SubscriptionFailureReason" AS ENUM ('EXPIRED', 'DENIED', 'CANCELED_BY_USER', 'FAILED_DEBIT', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."SubscriptionStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'OVERDUE', 'CANCELED', 'EXPIRED', 'FAILED');

-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('user', 'subscriber', 'editor', 'manager', 'admin');

-- CreateTable
CREATE TABLE "public"."account" (
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
CREATE TABLE "public"."author" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID,
    "displayName" TEXT NOT NULL,
    "displayRole" TEXT,
    "location" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "author_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."billing_audit_log" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID,
    "actor" "public"."AuditActor" NOT NULL DEFAULT 'SYSTEM',
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
CREATE TABLE "public"."billing_offer" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "code" TEXT NOT NULL,
    "planId" UUID NOT NULL,
    "paymentMethod" "public"."PaymentMethod" NOT NULL,
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
CREATE TABLE "public"."billing_plan" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "code" "public"."BillingPlanCode" NOT NULL,
    "name" TEXT NOT NULL,
    "cycle" "public"."BillingCycle" NOT NULL,
    "accessDays" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "billing_plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."bncc_skill" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "code" TEXT NOT NULL,
    "educationLevelId" UUID NOT NULL,
    "gradeId" UUID NOT NULL,
    "subjectId" UUID NOT NULL,
    "unitTheme" TEXT,
    "knowledgeObject" TEXT,
    "description" TEXT NOT NULL,
    "comments" TEXT,
    "curriculumSuggestions" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bncc_skill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."education_level" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "type" "public"."EducationLevelType",
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "education_level_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."grade" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "year" INTEGER,
    "order" INTEGER NOT NULL DEFAULT 0,
    "educationLevelId" UUID NOT NULL,

    CONSTRAINT "grade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."grade_subject" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "gradeId" UUID NOT NULL,
    "subjectId" UUID NOT NULL,

    CONSTRAINT "grade_subject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."invoice" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "subscriptionId" UUID,
    "offerId" UUID,
    "asaasId" TEXT NOT NULL,
    "status" "public"."InvoiceStatus" NOT NULL DEFAULT 'PENDING',
    "paymentMethod" "public"."PaymentMethod" NOT NULL,
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
    "pixQrCodePayload" TEXT,
    "pixQrCodeImage" TEXT,
    "pixExpirationDate" TIMESTAMP(3),
    "pixEmailSentAt" TIMESTAMP(3),
    "pixWhatsappSentAt" TIMESTAMP(3),
    "pixResendCount" INTEGER NOT NULL DEFAULT 0,
    "pixLastResendAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."knowledge_area" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "knowledge_area_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."lesson_plan" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "sourceResourceId" UUID,
    "title" TEXT NOT NULL,
    "status" "public"."LessonPlanStatus" NOT NULL DEFAULT 'GENERATED',
    "origin" "public"."LessonPlanOrigin" NOT NULL DEFAULT 'RESOURCE',
    "mode" "public"."LessonPlanMode" NOT NULL,
    "educationLevelId" UUID,
    "subjectId" UUID,
    "gradeId" UUID,
    "durationMinutes" INTEGER NOT NULL,
    "classCount" INTEGER,
    "teacherNote" TEXT,
    "content" JSONB NOT NULL,
    "sourceSnapshot" JSONB NOT NULL,
    "generationMeta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "lesson_plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."organization" (
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
CREATE TABLE "public"."pdf_knowledge_document" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "sourceType" "public"."PdfKnowledgeSourceType" NOT NULL,
    "sourceKey" TEXT NOT NULL,
    "sourcePath" TEXT,
    "resourceName" TEXT,
    "pdfName" TEXT NOT NULL,
    "resourceId" UUID,
    "resourceFileId" UUID,
    "pageCount" INTEGER NOT NULL DEFAULT 0,
    "extractorVersion" TEXT NOT NULL,
    "contentHash" TEXT NOT NULL,
    "contentMarkdown" TEXT NOT NULL,
    "contentRaw" TEXT,
    "metadata" JSONB,
    "extractedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pdf_knowledge_document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."question_bank_context" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "educationLevelId" UUID NOT NULL,
    "gradeId" UUID NOT NULL,
    "subjectId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "source" TEXT,
    "payload" JSONB,
    "fingerprint" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "question_bank_context_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."question_bank_feedback" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "questionId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "rating" "public"."QuestionBankFeedbackRating" NOT NULL,
    "reason" "public"."QuestionBankFeedbackReason",
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "question_bank_feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."question_bank_question" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "educationLevelId" UUID NOT NULL,
    "gradeId" UUID NOT NULL,
    "subjectId" UUID NOT NULL,
    "questionTypeId" UUID NOT NULL,
    "difficulty" "public"."QuestionBankDifficulty" NOT NULL,
    "status" "public"."QuestionBankStatus" NOT NULL DEFAULT 'DRAFT_AI',
    "questionSourceId" UUID NOT NULL,
    "prompt" TEXT NOT NULL,
    "instruction" TEXT,
    "payload" JSONB NOT NULL,
    "answerKey" JSONB NOT NULL,
    "explanation" TEXT,
    "rubric" JSONB,
    "contextId" UUID,
    "fingerprint" TEXT NOT NULL,
    "generatorVersion" TEXT,
    "modelName" TEXT,
    "reviewMeta" JSONB,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "positiveCount" INTEGER NOT NULL DEFAULT 0,
    "negativeCount" INTEGER NOT NULL DEFAULT 0,
    "flaggedCount" INTEGER NOT NULL DEFAULT 0,
    "createdById" UUID,
    "approvedById" UUID,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "question_bank_question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."question_bank_question_skill" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "questionId" UUID NOT NULL,
    "bnccSkillId" UUID NOT NULL,

    CONSTRAINT "question_bank_question_skill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."question_bank_question_type" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "question_bank_question_type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."question_bank_request" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "educationLevelId" UUID NOT NULL,
    "gradeId" UUID NOT NULL,
    "subjectId" UUID NOT NULL,
    "requestedCount" INTEGER NOT NULL,
    "reusedCount" INTEGER NOT NULL DEFAULT 0,
    "generatedCount" INTEGER NOT NULL DEFAULT 0,
    "returnedCount" INTEGER NOT NULL DEFAULT 0,
    "difficultyMix" JSONB,
    "typeMix" JSONB,
    "filters" JSONB NOT NULL,
    "paramsHash" TEXT NOT NULL,
    "status" "public"."QuestionBankRequestStatus" NOT NULL,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "question_bank_request_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."question_bank_request_export" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "requestId" UUID NOT NULL,
    "format" "public"."QuestionBankExportFormat" NOT NULL,
    "status" "public"."QuestionBankExportStatus" NOT NULL,
    "fileUrl" TEXT,
    "fileName" TEXT,
    "googleDocId" TEXT,
    "googleDocUrl" TEXT,
    "errorMessage" TEXT,
    "createdById" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "question_bank_request_export_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."question_bank_request_item" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "requestId" UUID NOT NULL,
    "questionId" UUID NOT NULL,
    "sourceId" UUID NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "question_bank_request_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."question_bank_source" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "appliesToQuestions" BOOLEAN NOT NULL DEFAULT true,
    "appliesToRequestItems" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "question_bank_source_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."related_resource" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "sourceResourceId" UUID NOT NULL,
    "targetResourceId" UUID NOT NULL,
    "relationType" "public"."RelatedResourceType" NOT NULL DEFAULT 'COMPLEMENTS',
    "relevanceScore" SMALLINT NOT NULL DEFAULT 3,
    "createdBy" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "related_resource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."resource" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" TEXT NOT NULL,
    "description" TEXT,
    "educationLevelId" UUID,
    "subjectId" UUID,
    "isUniversal" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "originRequestId" TEXT,
    "authorId" UUID,
    "isCurated" BOOLEAN NOT NULL DEFAULT false,
    "curatedAt" TIMESTAMP(3),
    "curatorId" UUID,
    "resourceType" "public"."ResourceType" NOT NULL DEFAULT 'OTHER',
    "pagesCount" INTEGER,
    "estimatedDurationMinutes" INTEGER,
    "slug" TEXT,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "averageRating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "thumbUrl" TEXT,
    "thumbPublicId" TEXT,
    "googleDriveUrl" TEXT,
    "externalId" INTEGER,
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "resource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."resource_bncc_skill" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "resourceId" UUID NOT NULL,
    "bnccSkillId" UUID NOT NULL,

    CONSTRAINT "resource_bncc_skill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."resource_education_level" (
    "resourceId" UUID NOT NULL,
    "educationLevelId" UUID NOT NULL,

    CONSTRAINT "resource_education_level_pkey" PRIMARY KEY ("resourceId","educationLevelId")
);

-- CreateTable
CREATE TABLE "public"."resource_file" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "resourceId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "cloudinaryPublicId" TEXT NOT NULL,
    "url" TEXT,
    "fileType" TEXT,
    "sizeBytes" INTEGER,
    "pageCount" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "resource_file_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."resource_file_image" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "fileId" UUID NOT NULL,
    "cloudinaryPublicId" TEXT NOT NULL,
    "url" TEXT,
    "alt" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "resource_file_image_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."resource_grade" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "resourceId" UUID NOT NULL,
    "gradeId" UUID NOT NULL,

    CONSTRAINT "resource_grade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."resource_image" (
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
CREATE TABLE "public"."resource_objective" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "resource_id" UUID NOT NULL,
    "text" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resource_objective_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."resource_step" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "resource_id" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "duration" TEXT,
    "content" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resource_step_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."resource_subject" (
    "resourceId" UUID NOT NULL,
    "subjectId" UUID NOT NULL,

    CONSTRAINT "resource_subject_pkey" PRIMARY KEY ("resourceId","subjectId")
);

-- CreateTable
CREATE TABLE "public"."resource_video" (
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
CREATE TABLE "public"."review" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "resourceId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "rating" SMALLINT NOT NULL,
    "comment" TEXT,
    "status" "public"."ReviewStatus" NOT NULL DEFAULT 'PENDING',
    "moderatedAt" TIMESTAMP(3),
    "moderatedBy" UUID,
    "helpfulCount" INTEGER NOT NULL DEFAULT 0,
    "unhelpfulCount" INTEGER NOT NULL DEFAULT 0,
    "flagCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."session" (
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
CREATE TABLE "public"."split_config" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "companyName" TEXT NOT NULL,
    "cnpj" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "splitType" "public"."SplitType" NOT NULL DEFAULT 'PERCENTAGE',
    "percentualValue" DOUBLE PRECISION,
    "fixedValue" DOUBLE PRECISION,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "split_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."subject" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "type" "public"."SubjectComponentType",
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "componentCode" TEXT,
    "knowledgeAreaId" UUID,
    "color" TEXT,
    "textColor" TEXT,

    CONSTRAINT "subject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."subscription" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "offerId" UUID,
    "asaasId" TEXT,
    "status" "public"."SubscriptionStatus" NOT NULL DEFAULT 'INACTIVE',
    "paymentMethod" "public"."PaymentMethod",
    "pixAutomaticAuthId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "purchaseDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "canceledAt" TIMESTAMP(3),
    "failureReason" "public"."SubscriptionFailureReason",
    "failureCount" INTEGER NOT NULL DEFAULT 0,
    "lastFailureAt" TIMESTAMP(3),
    "lastFailureMessage" TEXT,
    "nextRetryAt" TIMESTAMP(3),
    "lastRetryAt" TIMESTAMP(3),
    "failureNotificationSentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "role" "public"."UserRole" NOT NULL DEFAULT 'user',
    "banned" BOOLEAN NOT NULL DEFAULT false,
    "asaasCustomerId" TEXT,
    "asaasWalletId" TEXT,
    "roleTitle" TEXT,
    "location" TEXT,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_resource_interaction" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "resourceId" UUID NOT NULL,
    "isSaved" BOOLEAN NOT NULL DEFAULT false,
    "savedAt" TIMESTAMP(3),
    "isPlanned" BOOLEAN NOT NULL DEFAULT false,
    "plannedFor" TIMESTAMP(3),
    "hasDownloaded" BOOLEAN NOT NULL DEFAULT false,
    "downloadedAt" TIMESTAMP(3),
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "hasReviewed" BOOLEAN NOT NULL DEFAULT false,
    "reviewId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_resource_interaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."verification" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "account_providerId_accountId_key" ON "public"."account"("providerId" ASC, "accountId" ASC);

-- CreateIndex
CREATE INDEX "account_userId_providerId_idx" ON "public"."account"("userId" ASC, "providerId" ASC);

-- CreateIndex
CREATE INDEX "author_displayName_idx" ON "public"."author"("displayName" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "author_userId_key" ON "public"."author"("userId" ASC);

-- CreateIndex
CREATE INDEX "billing_audit_log_action_idx" ON "public"."billing_audit_log"("action" ASC);

-- CreateIndex
CREATE INDEX "billing_audit_log_asaasEventId_idx" ON "public"."billing_audit_log"("asaasEventId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "billing_audit_log_asaasEventId_key" ON "public"."billing_audit_log"("asaasEventId" ASC);

-- CreateIndex
CREATE INDEX "billing_audit_log_entity_entityId_idx" ON "public"."billing_audit_log"("entity" ASC, "entityId" ASC);

-- CreateIndex
CREATE INDEX "billing_audit_log_userId_idx" ON "public"."billing_audit_log"("userId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "billing_offer_code_key" ON "public"."billing_offer"("code" ASC);

-- CreateIndex
CREATE INDEX "billing_offer_planId_idx" ON "public"."billing_offer"("planId" ASC);

-- CreateIndex
CREATE INDEX "billing_offer_planId_paymentMethod_isActive_idx" ON "public"."billing_offer"("planId" ASC, "paymentMethod" ASC, "isActive" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "billing_plan_code_key" ON "public"."billing_plan"("code" ASC);

-- CreateIndex
CREATE INDEX "billing_plan_isActive_idx" ON "public"."billing_plan"("isActive" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "bncc_skill_code_gradeId_key" ON "public"."bncc_skill"("code" ASC, "gradeId" ASC);

-- CreateIndex
CREATE INDEX "bncc_skill_code_idx" ON "public"."bncc_skill"("code" ASC);

-- CreateIndex
CREATE INDEX "bncc_skill_educationLevelId_idx" ON "public"."bncc_skill"("educationLevelId" ASC);

-- CreateIndex
CREATE INDEX "bncc_skill_gradeId_idx" ON "public"."bncc_skill"("gradeId" ASC);

-- CreateIndex
CREATE INDEX "bncc_skill_subjectId_idx" ON "public"."bncc_skill"("subjectId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "education_level_name_key" ON "public"."education_level"("name" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "education_level_slug_key" ON "public"."education_level"("slug" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "education_level_type_key" ON "public"."education_level"("type" ASC);

-- CreateIndex
CREATE INDEX "grade_educationLevelId_idx" ON "public"."grade"("educationLevelId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "grade_slug_key" ON "public"."grade"("slug" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "grade_year_educationLevelId_key" ON "public"."grade"("year" ASC, "educationLevelId" ASC);

-- CreateIndex
CREATE INDEX "grade_year_idx" ON "public"."grade"("year" ASC);

-- CreateIndex
CREATE INDEX "grade_subject_gradeId_idx" ON "public"."grade_subject"("gradeId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "grade_subject_gradeId_subjectId_key" ON "public"."grade_subject"("gradeId" ASC, "subjectId" ASC);

-- CreateIndex
CREATE INDEX "grade_subject_subjectId_idx" ON "public"."grade_subject"("subjectId" ASC);

-- CreateIndex
CREATE INDEX "invoice_asaasId_idx" ON "public"."invoice"("asaasId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "invoice_asaasId_key" ON "public"."invoice"("asaasId" ASC);

-- CreateIndex
CREATE INDEX "invoice_offerId_idx" ON "public"."invoice"("offerId" ASC);

-- CreateIndex
CREATE INDEX "invoice_status_idx" ON "public"."invoice"("status" ASC);

-- CreateIndex
CREATE INDEX "invoice_subscriptionId_idx" ON "public"."invoice"("subscriptionId" ASC);

-- CreateIndex
CREATE INDEX "invoice_userId_idx" ON "public"."invoice"("userId" ASC);

-- CreateIndex
CREATE INDEX "knowledge_area_code_idx" ON "public"."knowledge_area"("code" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "knowledge_area_code_key" ON "public"."knowledge_area"("code" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "knowledge_area_name_key" ON "public"."knowledge_area"("name" ASC);

-- CreateIndex
CREATE INDEX "lesson_plan_educationLevelId_idx" ON "public"."lesson_plan"("educationLevelId" ASC);

-- CreateIndex
CREATE INDEX "lesson_plan_gradeId_idx" ON "public"."lesson_plan"("gradeId" ASC);

-- CreateIndex
CREATE INDEX "lesson_plan_sourceResourceId_idx" ON "public"."lesson_plan"("sourceResourceId" ASC);

-- CreateIndex
CREATE INDEX "lesson_plan_subjectId_idx" ON "public"."lesson_plan"("subjectId" ASC);

-- CreateIndex
CREATE INDEX "lesson_plan_userId_archivedAt_idx" ON "public"."lesson_plan"("userId" ASC, "archivedAt" ASC);

-- CreateIndex
CREATE INDEX "lesson_plan_userId_createdAt_idx" ON "public"."lesson_plan"("userId" ASC, "createdAt" ASC);

-- CreateIndex
CREATE INDEX "lesson_plan_userId_sourceResourceId_idx" ON "public"."lesson_plan"("userId" ASC, "sourceResourceId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "organization_slug_key" ON "public"."organization"("slug" ASC);

-- CreateIndex
CREATE INDEX "pdf_knowledge_document_extractedAt_idx" ON "public"."pdf_knowledge_document"("extractedAt" ASC);

-- CreateIndex
CREATE INDEX "pdf_knowledge_document_pdfName_idx" ON "public"."pdf_knowledge_document"("pdfName" ASC);

-- CreateIndex
CREATE INDEX "pdf_knowledge_document_resourceFileId_idx" ON "public"."pdf_knowledge_document"("resourceFileId" ASC);

-- CreateIndex
CREATE INDEX "pdf_knowledge_document_resourceId_idx" ON "public"."pdf_knowledge_document"("resourceId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "pdf_knowledge_document_sourceType_sourceKey_key" ON "public"."pdf_knowledge_document"("sourceType" ASC, "sourceKey" ASC);

-- CreateIndex
CREATE INDEX "question_bank_context_educationLevelId_gradeId_subjectId_idx" ON "public"."question_bank_context"("educationLevelId" ASC, "gradeId" ASC, "subjectId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "question_bank_context_fingerprint_key" ON "public"."question_bank_context"("fingerprint" ASC);

-- CreateIndex
CREATE INDEX "question_bank_feedback_questionId_createdAt_idx" ON "public"."question_bank_feedback"("questionId" ASC, "createdAt" ASC);

-- CreateIndex
CREATE INDEX "question_bank_feedback_userId_createdAt_idx" ON "public"."question_bank_feedback"("userId" ASC, "createdAt" ASC);

-- CreateIndex
CREATE INDEX "question_bank_question_contextId_idx" ON "public"."question_bank_question"("contextId" ASC);

-- CreateIndex
CREATE INDEX "question_bank_question_educationLevelId_gradeId_subjectId_s_idx" ON "public"."question_bank_question"("educationLevelId" ASC, "gradeId" ASC, "subjectId" ASC, "status" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "question_bank_question_fingerprint_key" ON "public"."question_bank_question"("fingerprint" ASC);

-- CreateIndex
CREATE INDEX "question_bank_question_questionSourceId_status_idx" ON "public"."question_bank_question"("questionSourceId" ASC, "status" ASC);

-- CreateIndex
CREATE INDEX "question_bank_question_questionTypeId_status_idx" ON "public"."question_bank_question"("questionTypeId" ASC, "status" ASC);

-- CreateIndex
CREATE INDEX "question_bank_question_status_createdAt_idx" ON "public"."question_bank_question"("status" ASC, "createdAt" ASC);

-- CreateIndex
CREATE INDEX "question_bank_question_subjectId_gradeId_difficulty_status_idx" ON "public"."question_bank_question"("subjectId" ASC, "gradeId" ASC, "difficulty" ASC, "status" ASC);

-- CreateIndex
CREATE INDEX "question_bank_question_skill_bnccSkillId_idx" ON "public"."question_bank_question_skill"("bnccSkillId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "question_bank_question_skill_questionId_bnccSkillId_key" ON "public"."question_bank_question_skill"("questionId" ASC, "bnccSkillId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "question_bank_question_type_code_key" ON "public"."question_bank_question_type"("code" ASC);

-- CreateIndex
CREATE INDEX "question_bank_question_type_isActive_sortOrder_idx" ON "public"."question_bank_question_type"("isActive" ASC, "sortOrder" ASC);

-- CreateIndex
CREATE INDEX "question_bank_request_educationLevelId_gradeId_subjectId_cr_idx" ON "public"."question_bank_request"("educationLevelId" ASC, "gradeId" ASC, "subjectId" ASC, "createdAt" ASC);

-- CreateIndex
CREATE INDEX "question_bank_request_paramsHash_idx" ON "public"."question_bank_request"("paramsHash" ASC);

-- CreateIndex
CREATE INDEX "question_bank_request_userId_createdAt_idx" ON "public"."question_bank_request"("userId" ASC, "createdAt" ASC);

-- CreateIndex
CREATE INDEX "question_bank_request_export_format_status_idx" ON "public"."question_bank_request_export"("format" ASC, "status" ASC);

-- CreateIndex
CREATE INDEX "question_bank_request_export_requestId_createdAt_idx" ON "public"."question_bank_request_export"("requestId" ASC, "createdAt" ASC);

-- CreateIndex
CREATE INDEX "question_bank_request_item_questionId_idx" ON "public"."question_bank_request_item"("questionId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "question_bank_request_item_requestId_questionId_key" ON "public"."question_bank_request_item"("requestId" ASC, "questionId" ASC);

-- CreateIndex
CREATE INDEX "question_bank_request_item_sourceId_idx" ON "public"."question_bank_request_item"("sourceId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "question_bank_source_code_key" ON "public"."question_bank_source"("code" ASC);

-- CreateIndex
CREATE INDEX "question_bank_source_isActive_sortOrder_idx" ON "public"."question_bank_source"("isActive" ASC, "sortOrder" ASC);

-- CreateIndex
CREATE INDEX "related_resource_sourceResourceId_idx" ON "public"."related_resource"("sourceResourceId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "related_resource_sourceResourceId_targetResourceId_key" ON "public"."related_resource"("sourceResourceId" ASC, "targetResourceId" ASC);

-- CreateIndex
CREATE INDEX "related_resource_targetResourceId_relationType_idx" ON "public"."related_resource"("targetResourceId" ASC, "relationType" ASC);

-- CreateIndex
CREATE INDEX "resource_archivedAt_idx" ON "public"."resource"("archivedAt" ASC);

-- CreateIndex
CREATE INDEX "resource_authorId_idx" ON "public"."resource"("authorId" ASC);

-- CreateIndex
CREATE INDEX "resource_curatorId_idx" ON "public"."resource"("curatorId" ASC);

-- CreateIndex
CREATE INDEX "resource_educationLevelId_idx" ON "public"."resource"("educationLevelId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "resource_externalId_key" ON "public"."resource"("externalId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "resource_originRequestId_key" ON "public"."resource"("originRequestId" ASC);

-- CreateIndex
CREATE INDEX "resource_slug_idx" ON "public"."resource"("slug" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "resource_slug_key" ON "public"."resource"("slug" ASC);

-- CreateIndex
CREATE INDEX "resource_subjectId_idx" ON "public"."resource"("subjectId" ASC);

-- CreateIndex
CREATE INDEX "resource_title_id_idx" ON "public"."resource"("title" ASC, "id" ASC);

-- CreateIndex
CREATE INDEX "resource_bncc_skill_bnccSkillId_idx" ON "public"."resource_bncc_skill"("bnccSkillId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "resource_bncc_skill_resourceId_bnccSkillId_key" ON "public"."resource_bncc_skill"("resourceId" ASC, "bnccSkillId" ASC);

-- CreateIndex
CREATE INDEX "resource_bncc_skill_resourceId_idx" ON "public"."resource_bncc_skill"("resourceId" ASC);

-- CreateIndex
CREATE INDEX "resource_education_level_educationLevelId_idx" ON "public"."resource_education_level"("educationLevelId" ASC);

-- CreateIndex
CREATE INDEX "resource_education_level_resourceId_idx" ON "public"."resource_education_level"("resourceId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "resource_file_cloudinaryPublicId_key" ON "public"."resource_file"("cloudinaryPublicId" ASC);

-- CreateIndex
CREATE INDEX "resource_file_resourceId_idx" ON "public"."resource_file"("resourceId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "resource_file_image_cloudinaryPublicId_key" ON "public"."resource_file_image"("cloudinaryPublicId" ASC);

-- CreateIndex
CREATE INDEX "resource_file_image_fileId_order_idx" ON "public"."resource_file_image"("fileId" ASC, "order" ASC);

-- CreateIndex
CREATE INDEX "resource_grade_gradeId_idx" ON "public"."resource_grade"("gradeId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "resource_grade_resourceId_gradeId_key" ON "public"."resource_grade"("resourceId" ASC, "gradeId" ASC);

-- CreateIndex
CREATE INDEX "resource_grade_resourceId_idx" ON "public"."resource_grade"("resourceId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "resource_image_cloudinaryPublicId_key" ON "public"."resource_image"("cloudinaryPublicId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "resource_image_resourceId_order_key" ON "public"."resource_image"("resourceId" ASC, "order" ASC);

-- CreateIndex
CREATE INDEX "resource_objective_resource_id_order_idx" ON "public"."resource_objective"("resource_id" ASC, "order" ASC);

-- CreateIndex
CREATE INDEX "resource_step_resource_id_order_idx" ON "public"."resource_step"("resource_id" ASC, "order" ASC);

-- CreateIndex
CREATE INDEX "resource_subject_resourceId_idx" ON "public"."resource_subject"("resourceId" ASC);

-- CreateIndex
CREATE INDEX "resource_subject_subjectId_idx" ON "public"."resource_subject"("subjectId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "resource_video_cloudinaryPublicId_key" ON "public"."resource_video"("cloudinaryPublicId" ASC);

-- CreateIndex
CREATE INDEX "resource_video_resourceId_order_idx" ON "public"."resource_video"("resourceId" ASC, "order" ASC);

-- CreateIndex
CREATE INDEX "review_createdAt_idx" ON "public"."review"("createdAt" ASC);

-- CreateIndex
CREATE INDEX "review_resourceId_status_idx" ON "public"."review"("resourceId" ASC, "status" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "review_resourceId_userId_key" ON "public"."review"("resourceId" ASC, "userId" ASC);

-- CreateIndex
CREATE INDEX "review_userId_status_idx" ON "public"."review"("userId" ASC, "status" ASC);

-- CreateIndex
CREATE INDEX "session_expiresAt_idx" ON "public"."session"("expiresAt" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "public"."session"("token" ASC);

-- CreateIndex
CREATE INDEX "session_userId_idx" ON "public"."session"("userId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "split_config_walletId_key" ON "public"."split_config"("walletId" ASC);

-- CreateIndex
CREATE INDEX "subject_componentCode_idx" ON "public"."subject"("componentCode" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "subject_componentCode_key" ON "public"."subject"("componentCode" ASC);

-- CreateIndex
CREATE INDEX "subject_knowledgeAreaId_idx" ON "public"."subject"("knowledgeAreaId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "subject_name_key" ON "public"."subject"("name" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "subject_slug_key" ON "public"."subject"("slug" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "subject_type_key" ON "public"."subject"("type" ASC);

-- CreateIndex
CREATE INDEX "subscription_asaasId_idx" ON "public"."subscription"("asaasId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "subscription_asaasId_key" ON "public"."subscription"("asaasId" ASC);

-- CreateIndex
CREATE INDEX "subscription_expiresAt_idx" ON "public"."subscription"("expiresAt" ASC);

-- CreateIndex
CREATE INDEX "subscription_isActive_idx" ON "public"."subscription"("isActive" ASC);

-- CreateIndex
CREATE INDEX "subscription_offerId_idx" ON "public"."subscription"("offerId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "subscription_pixAutomaticAuthId_key" ON "public"."subscription"("pixAutomaticAuthId" ASC);

-- CreateIndex
CREATE INDEX "subscription_status_idx" ON "public"."subscription"("status" ASC);

-- CreateIndex
CREATE INDEX "subscription_userId_idx" ON "public"."subscription"("userId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "subscription_userId_key" ON "public"."subscription"("userId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "user_asaasCustomerId_key" ON "public"."user"("asaasCustomerId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "public"."user"("email" ASC);

-- CreateIndex
CREATE INDEX "user_resource_interaction_resourceId_idx" ON "public"."user_resource_interaction"("resourceId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "user_resource_interaction_reviewId_key" ON "public"."user_resource_interaction"("reviewId" ASC);

-- CreateIndex
CREATE INDEX "user_resource_interaction_userId_hasDownloaded_idx" ON "public"."user_resource_interaction"("userId" ASC, "hasDownloaded" ASC);

-- CreateIndex
CREATE INDEX "user_resource_interaction_userId_isPlanned_plannedFor_idx" ON "public"."user_resource_interaction"("userId" ASC, "isPlanned" ASC, "plannedFor" ASC);

-- CreateIndex
CREATE INDEX "user_resource_interaction_userId_isSaved_idx" ON "public"."user_resource_interaction"("userId" ASC, "isSaved" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "user_resource_interaction_userId_resourceId_key" ON "public"."user_resource_interaction"("userId" ASC, "resourceId" ASC);

-- CreateIndex
CREATE INDEX "verification_identifier_idx" ON "public"."verification"("identifier" ASC);

-- AddForeignKey
ALTER TABLE "public"."account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."author" ADD CONSTRAINT "author_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."billing_audit_log" ADD CONSTRAINT "billing_audit_log_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."billing_offer" ADD CONSTRAINT "billing_offer_planId_fkey" FOREIGN KEY ("planId") REFERENCES "public"."billing_plan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."bncc_skill" ADD CONSTRAINT "bncc_skill_educationLevelId_fkey" FOREIGN KEY ("educationLevelId") REFERENCES "public"."education_level"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."bncc_skill" ADD CONSTRAINT "bncc_skill_gradeId_fkey" FOREIGN KEY ("gradeId") REFERENCES "public"."grade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."bncc_skill" ADD CONSTRAINT "bncc_skill_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "public"."subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."grade" ADD CONSTRAINT "grade_educationLevelId_fkey" FOREIGN KEY ("educationLevelId") REFERENCES "public"."education_level"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."grade_subject" ADD CONSTRAINT "grade_subject_gradeId_fkey" FOREIGN KEY ("gradeId") REFERENCES "public"."grade"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."grade_subject" ADD CONSTRAINT "grade_subject_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "public"."subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."invoice" ADD CONSTRAINT "invoice_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "public"."billing_offer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."invoice" ADD CONSTRAINT "invoice_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "public"."subscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."invoice" ADD CONSTRAINT "invoice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."lesson_plan" ADD CONSTRAINT "lesson_plan_educationLevelId_fkey" FOREIGN KEY ("educationLevelId") REFERENCES "public"."education_level"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."lesson_plan" ADD CONSTRAINT "lesson_plan_gradeId_fkey" FOREIGN KEY ("gradeId") REFERENCES "public"."grade"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."lesson_plan" ADD CONSTRAINT "lesson_plan_sourceResourceId_fkey" FOREIGN KEY ("sourceResourceId") REFERENCES "public"."resource"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."lesson_plan" ADD CONSTRAINT "lesson_plan_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "public"."subject"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."lesson_plan" ADD CONSTRAINT "lesson_plan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."pdf_knowledge_document" ADD CONSTRAINT "pdf_knowledge_document_resourceFileId_fkey" FOREIGN KEY ("resourceFileId") REFERENCES "public"."resource_file"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."pdf_knowledge_document" ADD CONSTRAINT "pdf_knowledge_document_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "public"."resource"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."question_bank_context" ADD CONSTRAINT "question_bank_context_educationLevelId_fkey" FOREIGN KEY ("educationLevelId") REFERENCES "public"."education_level"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."question_bank_context" ADD CONSTRAINT "question_bank_context_gradeId_fkey" FOREIGN KEY ("gradeId") REFERENCES "public"."grade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."question_bank_context" ADD CONSTRAINT "question_bank_context_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "public"."subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."question_bank_feedback" ADD CONSTRAINT "question_bank_feedback_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "public"."question_bank_question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."question_bank_feedback" ADD CONSTRAINT "question_bank_feedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."question_bank_question" ADD CONSTRAINT "question_bank_question_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."question_bank_question" ADD CONSTRAINT "question_bank_question_contextId_fkey" FOREIGN KEY ("contextId") REFERENCES "public"."question_bank_context"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."question_bank_question" ADD CONSTRAINT "question_bank_question_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."question_bank_question" ADD CONSTRAINT "question_bank_question_educationLevelId_fkey" FOREIGN KEY ("educationLevelId") REFERENCES "public"."education_level"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."question_bank_question" ADD CONSTRAINT "question_bank_question_gradeId_fkey" FOREIGN KEY ("gradeId") REFERENCES "public"."grade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."question_bank_question" ADD CONSTRAINT "question_bank_question_questionSourceId_fkey" FOREIGN KEY ("questionSourceId") REFERENCES "public"."question_bank_source"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."question_bank_question" ADD CONSTRAINT "question_bank_question_questionTypeId_fkey" FOREIGN KEY ("questionTypeId") REFERENCES "public"."question_bank_question_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."question_bank_question" ADD CONSTRAINT "question_bank_question_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "public"."subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."question_bank_question_skill" ADD CONSTRAINT "question_bank_question_skill_bnccSkillId_fkey" FOREIGN KEY ("bnccSkillId") REFERENCES "public"."bncc_skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."question_bank_question_skill" ADD CONSTRAINT "question_bank_question_skill_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "public"."question_bank_question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."question_bank_request" ADD CONSTRAINT "question_bank_request_educationLevelId_fkey" FOREIGN KEY ("educationLevelId") REFERENCES "public"."education_level"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."question_bank_request" ADD CONSTRAINT "question_bank_request_gradeId_fkey" FOREIGN KEY ("gradeId") REFERENCES "public"."grade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."question_bank_request" ADD CONSTRAINT "question_bank_request_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "public"."subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."question_bank_request" ADD CONSTRAINT "question_bank_request_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."question_bank_request_export" ADD CONSTRAINT "question_bank_request_export_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."question_bank_request_export" ADD CONSTRAINT "question_bank_request_export_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "public"."question_bank_request"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."question_bank_request_item" ADD CONSTRAINT "question_bank_request_item_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "public"."question_bank_question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."question_bank_request_item" ADD CONSTRAINT "question_bank_request_item_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "public"."question_bank_request"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."question_bank_request_item" ADD CONSTRAINT "question_bank_request_item_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "public"."question_bank_source"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."related_resource" ADD CONSTRAINT "related_resource_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."related_resource" ADD CONSTRAINT "related_resource_sourceResourceId_fkey" FOREIGN KEY ("sourceResourceId") REFERENCES "public"."resource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."related_resource" ADD CONSTRAINT "related_resource_targetResourceId_fkey" FOREIGN KEY ("targetResourceId") REFERENCES "public"."resource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."resource" ADD CONSTRAINT "resource_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."author"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."resource" ADD CONSTRAINT "resource_curatorId_fkey" FOREIGN KEY ("curatorId") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."resource" ADD CONSTRAINT "resource_educationLevelId_fkey" FOREIGN KEY ("educationLevelId") REFERENCES "public"."education_level"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."resource" ADD CONSTRAINT "resource_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "public"."subject"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."resource_bncc_skill" ADD CONSTRAINT "resource_bncc_skill_bnccSkillId_fkey" FOREIGN KEY ("bnccSkillId") REFERENCES "public"."bncc_skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."resource_bncc_skill" ADD CONSTRAINT "resource_bncc_skill_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "public"."resource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."resource_education_level" ADD CONSTRAINT "resource_education_level_educationLevelId_fkey" FOREIGN KEY ("educationLevelId") REFERENCES "public"."education_level"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."resource_education_level" ADD CONSTRAINT "resource_education_level_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "public"."resource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."resource_file" ADD CONSTRAINT "resource_file_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "public"."resource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."resource_file_image" ADD CONSTRAINT "resource_file_image_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "public"."resource_file"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."resource_grade" ADD CONSTRAINT "resource_grade_gradeId_fkey" FOREIGN KEY ("gradeId") REFERENCES "public"."grade"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."resource_grade" ADD CONSTRAINT "resource_grade_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "public"."resource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."resource_image" ADD CONSTRAINT "resource_image_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "public"."resource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."resource_objective" ADD CONSTRAINT "resource_objective_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "public"."resource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."resource_step" ADD CONSTRAINT "resource_step_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "public"."resource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."resource_subject" ADD CONSTRAINT "resource_subject_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "public"."resource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."resource_subject" ADD CONSTRAINT "resource_subject_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "public"."subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."resource_video" ADD CONSTRAINT "resource_video_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "public"."resource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."review" ADD CONSTRAINT "review_moderatedBy_fkey" FOREIGN KEY ("moderatedBy") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."review" ADD CONSTRAINT "review_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "public"."resource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."review" ADD CONSTRAINT "review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."subject" ADD CONSTRAINT "subject_knowledgeAreaId_fkey" FOREIGN KEY ("knowledgeAreaId") REFERENCES "public"."knowledge_area"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."subscription" ADD CONSTRAINT "subscription_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "public"."billing_offer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."subscription" ADD CONSTRAINT "subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_resource_interaction" ADD CONSTRAINT "user_resource_interaction_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "public"."resource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_resource_interaction" ADD CONSTRAINT "user_resource_interaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

