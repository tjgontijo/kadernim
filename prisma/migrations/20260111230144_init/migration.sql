-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('user', 'subscriber', 'editor', 'manager', 'admin');

-- CreateEnum
CREATE TYPE "CommunityRequestStatus" AS ENUM ('draft', 'voting', 'selected', 'approved', 'in_production', 'completed', 'unfeasible');

-- CreateEnum
CREATE TYPE "CampaignStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'SENDING', 'SENT', 'FAILED');

-- CreateEnum
CREATE TYPE "ConfigType" AS ENUM ('string', 'number', 'boolean', 'json');

-- CreateTable
CREATE TABLE "education_level" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "education_level_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grade" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "educationLevelId" TEXT NOT NULL,

    CONSTRAINT "grade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subject" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "isBncc" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "subject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grade_subject" (
    "id" TEXT NOT NULL,
    "gradeId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,

    CONSTRAINT "grade_subject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'user',
    "banned" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
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
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,
    "impersonatedBy" TEXT,
    "activeOrganizationId" TEXT,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization" (
    "id" TEXT NOT NULL,
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
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "purchaseDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resource_grade" (
    "id" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "gradeId" TEXT NOT NULL,

    CONSTRAINT "resource_grade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resource_image" (
    "id" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "cloudinaryPublicId" TEXT NOT NULL,
    "url" TEXT,
    "alt" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "resource_image_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resource_file" (
    "id" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
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
    "id" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
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
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "source" TEXT,
    "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "resource_user_access_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resource" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "educationLevelId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "externalId" INTEGER,
    "isFree" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "originRequestId" TEXT,

    CONSTRAINT "resource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bncc_skill" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "educationLevelId" TEXT NOT NULL,
    "gradeId" TEXT,
    "subjectId" TEXT,
    "unitTheme" TEXT,
    "knowledgeObject" TEXT,
    "description" TEXT NOT NULL,
    "comments" TEXT,
    "curriculumSuggestions" TEXT,
    "searchVector" tsvector,
    "embedding" vector(1536),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bncc_skill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resource_bncc_skill" (
    "id" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "bnccSkillId" TEXT NOT NULL,

    CONSTRAINT "resource_bncc_skill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lesson_plan" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "numberOfClasses" INTEGER NOT NULL,
    "duration" INTEGER NOT NULL,
    "educationLevelSlug" TEXT NOT NULL,
    "gradeSlug" TEXT,
    "subjectSlug" TEXT,
    "ageRange" TEXT,
    "fieldOfExperience" TEXT,
    "bnccSkillCodes" TEXT[],
    "content" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lesson_plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lesson_plan_usage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "yearMonth" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lesson_plan_usage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "community_request" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "votingMonth" TEXT NOT NULL,
    "educationLevelId" TEXT,
    "gradeId" TEXT,
    "subjectId" TEXT,
    "userId" TEXT NOT NULL,
    "status" "CommunityRequestStatus" NOT NULL DEFAULT 'draft',
    "hasBnccAlignment" BOOLEAN NOT NULL DEFAULT false,
    "bnccSkillCodes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "unfeasibleReason" TEXT,
    "unfeasibleById" TEXT,
    "voteCount" INTEGER NOT NULL DEFAULT 0,
    "survivedMonths" INTEGER NOT NULL DEFAULT 0,
    "commentCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "selectedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "unfeasibleAt" TIMESTAMP(3),

    CONSTRAINT "community_request_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "community_request_vote" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "votingMonth" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "community_request_vote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "community_request_reference" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "cloudinaryPublicId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "community_request_reference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "llm_usage_log" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "feature" TEXT NOT NULL,
    "operation" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'openai',
    "inputTokens" INTEGER NOT NULL,
    "outputTokens" INTEGER NOT NULL,
    "totalTokens" INTEGER NOT NULL,
    "inputCost" DOUBLE PRECISION NOT NULL,
    "outputCost" DOUBLE PRECISION NOT NULL,
    "totalCost" DOUBLE PRECISION NOT NULL,
    "latencyMs" INTEGER,
    "status" TEXT NOT NULL,
    "errorMessage" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "llm_usage_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "llm_usage_daily" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "feature" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "totalCalls" INTEGER NOT NULL,
    "successCalls" INTEGER NOT NULL,
    "errorCalls" INTEGER NOT NULL,
    "totalTokens" BIGINT NOT NULL,
    "totalCost" DOUBLE PRECISION NOT NULL,
    "avgLatencyMs" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "llm_usage_daily_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "automation_rule" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "conditions" JSONB,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "automation_rule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "automation_action" (
    "id" TEXT NOT NULL,
    "ruleId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "config" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "automation_action_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "automation_log" (
    "id" TEXT NOT NULL,
    "ruleId" TEXT NOT NULL,
    "actionId" TEXT,
    "status" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "error" TEXT,
    "executedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "automation_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_template" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "subject" TEXT,
    "body" TEXT NOT NULL,
    "description" TEXT,
    "variables" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_template_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "push_subscription" (
    "id" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "push_subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_templates" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "preheader" TEXT,
    "body" TEXT NOT NULL,
    "content" JSONB,
    "eventType" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "email_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "push_campaigns" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "body" VARCHAR(255) NOT NULL,
    "url" TEXT,
    "icon" TEXT,
    "imageUrl" TEXT,
    "audience" JSONB NOT NULL DEFAULT '{}',
    "status" "CampaignStatus" NOT NULL DEFAULT 'DRAFT',
    "scheduledAt" TIMESTAMPTZ,
    "sentAt" TIMESTAMPTZ,
    "totalSent" INTEGER NOT NULL DEFAULT 0,
    "totalClicked" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,

    CONSTRAINT "push_campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "push_campaign_clicks" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "userId" TEXT,
    "clickedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userAgent" TEXT,

    CONSTRAINT "push_campaign_clicks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "whatsapp_template" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "whatsapp_template_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "push_template" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "icon" TEXT,
    "badge" TEXT,
    "image" TEXT,
    "url" TEXT,
    "tag" TEXT,
    "eventType" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "push_template_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_config" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "type" "ConfigType" NOT NULL,
    "label" TEXT,
    "description" TEXT,
    "category" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "community_request_upload" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "cloudinaryPublicId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "community_request_upload_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "community_request_comment" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "parentId" TEXT,
    "content" TEXT NOT NULL,
    "isEdited" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "community_request_comment_pkey" PRIMARY KEY ("id")
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
CREATE INDEX "subscription_userId_idx" ON "subscription"("userId");

-- CreateIndex
CREATE INDEX "subscription_isActive_idx" ON "subscription"("isActive");

-- CreateIndex
CREATE INDEX "subscription_expiresAt_idx" ON "subscription"("expiresAt");

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

-- CreateIndex
CREATE INDEX "bncc_skill_educationLevelId_idx" ON "bncc_skill"("educationLevelId");

-- CreateIndex
CREATE INDEX "bncc_skill_gradeId_idx" ON "bncc_skill"("gradeId");

-- CreateIndex
CREATE INDEX "bncc_skill_subjectId_idx" ON "bncc_skill"("subjectId");

-- CreateIndex
CREATE INDEX "bncc_skill_code_idx" ON "bncc_skill"("code");

-- CreateIndex
CREATE INDEX "bncc_skill_searchVector_idx" ON "bncc_skill" USING GIN ("searchVector");

-- CreateIndex
CREATE UNIQUE INDEX "bncc_skill_code_gradeId_key" ON "bncc_skill"("code", "gradeId");

-- CreateIndex
CREATE INDEX "resource_bncc_skill_resourceId_idx" ON "resource_bncc_skill"("resourceId");

-- CreateIndex
CREATE INDEX "resource_bncc_skill_bnccSkillId_idx" ON "resource_bncc_skill"("bnccSkillId");

-- CreateIndex
CREATE UNIQUE INDEX "resource_bncc_skill_resourceId_bnccSkillId_key" ON "resource_bncc_skill"("resourceId", "bnccSkillId");

-- CreateIndex
CREATE INDEX "lesson_plan_userId_idx" ON "lesson_plan"("userId");

-- CreateIndex
CREATE INDEX "lesson_plan_createdAt_idx" ON "lesson_plan"("createdAt");

-- CreateIndex
CREATE INDEX "lesson_plan_educationLevelSlug_idx" ON "lesson_plan"("educationLevelSlug");

-- CreateIndex
CREATE INDEX "lesson_plan_gradeSlug_idx" ON "lesson_plan"("gradeSlug");

-- CreateIndex
CREATE INDEX "lesson_plan_subjectSlug_idx" ON "lesson_plan"("subjectSlug");

-- CreateIndex
CREATE INDEX "lesson_plan_usage_userId_idx" ON "lesson_plan_usage"("userId");

-- CreateIndex
CREATE INDEX "lesson_plan_usage_yearMonth_idx" ON "lesson_plan_usage"("yearMonth");

-- CreateIndex
CREATE UNIQUE INDEX "lesson_plan_usage_userId_yearMonth_key" ON "lesson_plan_usage"("userId", "yearMonth");

-- CreateIndex
CREATE INDEX "community_request_userId_idx" ON "community_request"("userId");

-- CreateIndex
CREATE INDEX "community_request_gradeId_idx" ON "community_request"("gradeId");

-- CreateIndex
CREATE INDEX "community_request_educationLevelId_idx" ON "community_request"("educationLevelId");

-- CreateIndex
CREATE INDEX "community_request_subjectId_idx" ON "community_request"("subjectId");

-- CreateIndex
CREATE INDEX "community_request_status_votingMonth_idx" ON "community_request"("status", "votingMonth");

-- CreateIndex
CREATE INDEX "community_request_vote_userId_votingMonth_idx" ON "community_request_vote"("userId", "votingMonth");

-- CreateIndex
CREATE UNIQUE INDEX "community_request_vote_requestId_userId_key" ON "community_request_vote"("requestId", "userId");

-- CreateIndex
CREATE INDEX "community_request_reference_requestId_idx" ON "community_request_reference"("requestId");

-- CreateIndex
CREATE INDEX "llm_usage_log_userId_idx" ON "llm_usage_log"("userId");

-- CreateIndex
CREATE INDEX "llm_usage_log_feature_idx" ON "llm_usage_log"("feature");

-- CreateIndex
CREATE INDEX "llm_usage_log_createdAt_idx" ON "llm_usage_log"("createdAt");

-- CreateIndex
CREATE INDEX "llm_usage_log_status_idx" ON "llm_usage_log"("status");

-- CreateIndex
CREATE INDEX "llm_usage_daily_date_idx" ON "llm_usage_daily"("date");

-- CreateIndex
CREATE INDEX "llm_usage_daily_feature_idx" ON "llm_usage_daily"("feature");

-- CreateIndex
CREATE UNIQUE INDEX "llm_usage_daily_date_feature_model_key" ON "llm_usage_daily"("date", "feature", "model");

-- CreateIndex
CREATE INDEX "automation_rule_eventType_idx" ON "automation_rule"("eventType");

-- CreateIndex
CREATE INDEX "automation_rule_isActive_idx" ON "automation_rule"("isActive");

-- CreateIndex
CREATE INDEX "automation_action_ruleId_idx" ON "automation_action"("ruleId");

-- CreateIndex
CREATE INDEX "automation_log_ruleId_idx" ON "automation_log"("ruleId");

-- CreateIndex
CREATE INDEX "automation_log_actionId_idx" ON "automation_log"("actionId");

-- CreateIndex
CREATE INDEX "automation_log_status_idx" ON "automation_log"("status");

-- CreateIndex
CREATE INDEX "automation_log_executedAt_idx" ON "automation_log"("executedAt");

-- CreateIndex
CREATE UNIQUE INDEX "notification_template_slug_key" ON "notification_template"("slug");

-- CreateIndex
CREATE INDEX "notification_template_type_idx" ON "notification_template"("type");

-- CreateIndex
CREATE INDEX "notification_template_eventType_idx" ON "notification_template"("eventType");

-- CreateIndex
CREATE INDEX "notification_template_isActive_idx" ON "notification_template"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "push_subscription_endpoint_key" ON "push_subscription"("endpoint");

-- CreateIndex
CREATE INDEX "push_subscription_userId_idx" ON "push_subscription"("userId");

-- CreateIndex
CREATE INDEX "push_subscription_active_idx" ON "push_subscription"("active");

-- CreateIndex
CREATE UNIQUE INDEX "email_templates_slug_key" ON "email_templates"("slug");

-- CreateIndex
CREATE INDEX "push_campaign_clicks_campaignId_idx" ON "push_campaign_clicks"("campaignId");

-- CreateIndex
CREATE INDEX "push_campaign_clicks_clickedAt_idx" ON "push_campaign_clicks"("clickedAt");

-- CreateIndex
CREATE UNIQUE INDEX "whatsapp_template_slug_key" ON "whatsapp_template"("slug");

-- CreateIndex
CREATE INDEX "whatsapp_template_eventType_idx" ON "whatsapp_template"("eventType");

-- CreateIndex
CREATE UNIQUE INDEX "push_template_slug_key" ON "push_template"("slug");

-- CreateIndex
CREATE INDEX "push_template_eventType_idx" ON "push_template"("eventType");

-- CreateIndex
CREATE INDEX "push_template_isActive_idx" ON "push_template"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "system_config_key_key" ON "system_config"("key");

-- CreateIndex
CREATE INDEX "system_config_category_idx" ON "system_config"("category");

-- CreateIndex
CREATE INDEX "community_request_upload_requestId_idx" ON "community_request_upload"("requestId");

-- CreateIndex
CREATE INDEX "community_request_comment_requestId_idx" ON "community_request_comment"("requestId");

-- CreateIndex
CREATE INDEX "community_request_comment_userId_idx" ON "community_request_comment"("userId");

-- CreateIndex
CREATE INDEX "community_request_comment_parentId_idx" ON "community_request_comment"("parentId");

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
ALTER TABLE "subscription" ADD CONSTRAINT "subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_grade" ADD CONSTRAINT "resource_grade_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "resource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_grade" ADD CONSTRAINT "resource_grade_gradeId_fkey" FOREIGN KEY ("gradeId") REFERENCES "grade"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_image" ADD CONSTRAINT "resource_image_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "resource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_file" ADD CONSTRAINT "resource_file_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "resource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_video" ADD CONSTRAINT "resource_video_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "resource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_user_access" ADD CONSTRAINT "resource_user_access_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_user_access" ADD CONSTRAINT "resource_user_access_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "resource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource" ADD CONSTRAINT "resource_educationLevelId_fkey" FOREIGN KEY ("educationLevelId") REFERENCES "education_level"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource" ADD CONSTRAINT "resource_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource" ADD CONSTRAINT "resource_originRequestId_fkey" FOREIGN KEY ("originRequestId") REFERENCES "community_request"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bncc_skill" ADD CONSTRAINT "bncc_skill_educationLevelId_fkey" FOREIGN KEY ("educationLevelId") REFERENCES "education_level"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bncc_skill" ADD CONSTRAINT "bncc_skill_gradeId_fkey" FOREIGN KEY ("gradeId") REFERENCES "grade"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bncc_skill" ADD CONSTRAINT "bncc_skill_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subject"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_bncc_skill" ADD CONSTRAINT "resource_bncc_skill_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "resource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_bncc_skill" ADD CONSTRAINT "resource_bncc_skill_bnccSkillId_fkey" FOREIGN KEY ("bnccSkillId") REFERENCES "bncc_skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_plan" ADD CONSTRAINT "lesson_plan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_plan_usage" ADD CONSTRAINT "lesson_plan_usage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_request" ADD CONSTRAINT "community_request_educationLevelId_fkey" FOREIGN KEY ("educationLevelId") REFERENCES "education_level"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_request" ADD CONSTRAINT "community_request_gradeId_fkey" FOREIGN KEY ("gradeId") REFERENCES "grade"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_request" ADD CONSTRAINT "community_request_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subject"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_request" ADD CONSTRAINT "community_request_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_request_vote" ADD CONSTRAINT "community_request_vote_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "community_request"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_request_vote" ADD CONSTRAINT "community_request_vote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_request_reference" ADD CONSTRAINT "community_request_reference_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "community_request"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "llm_usage_log" ADD CONSTRAINT "llm_usage_log_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "automation_action" ADD CONSTRAINT "automation_action_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "automation_rule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "automation_log" ADD CONSTRAINT "automation_log_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "automation_rule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "automation_log" ADD CONSTRAINT "automation_log_actionId_fkey" FOREIGN KEY ("actionId") REFERENCES "automation_action"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "push_subscription" ADD CONSTRAINT "push_subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "push_campaign_clicks" ADD CONSTRAINT "push_campaign_clicks_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "push_campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_request_upload" ADD CONSTRAINT "community_request_upload_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "community_request"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_request_upload" ADD CONSTRAINT "community_request_upload_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_request_comment" ADD CONSTRAINT "community_request_comment_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "community_request"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_request_comment" ADD CONSTRAINT "community_request_comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_request_comment" ADD CONSTRAINT "community_request_comment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "community_request_comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
