-- CreateEnum
CREATE TYPE "LessonPlanOrigin" AS ENUM ('RESOURCE', 'MANUAL');

-- CreateEnum
CREATE TYPE "LessonPlanStatus" AS ENUM ('GENERATED', 'FAILED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "LessonPlanMode" AS ENUM ('FULL_LESSON', 'REVIEW', 'GROUP_ACTIVITY', 'DIAGNOSTIC', 'HOMEWORK');

-- CreateTable
CREATE TABLE "lesson_plan" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "sourceResourceId" UUID,
    "title" TEXT NOT NULL,
    "status" "LessonPlanStatus" NOT NULL DEFAULT 'GENERATED',
    "origin" "LessonPlanOrigin" NOT NULL DEFAULT 'RESOURCE',
    "mode" "LessonPlanMode" NOT NULL,
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

-- CreateIndex
CREATE INDEX "lesson_plan_userId_createdAt_idx" ON "lesson_plan"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "lesson_plan_userId_archivedAt_idx" ON "lesson_plan"("userId", "archivedAt");

-- CreateIndex
CREATE INDEX "lesson_plan_userId_sourceResourceId_idx" ON "lesson_plan"("userId", "sourceResourceId");

-- CreateIndex
CREATE INDEX "lesson_plan_sourceResourceId_idx" ON "lesson_plan"("sourceResourceId");

-- CreateIndex
CREATE INDEX "lesson_plan_educationLevelId_idx" ON "lesson_plan"("educationLevelId");

-- CreateIndex
CREATE INDEX "lesson_plan_subjectId_idx" ON "lesson_plan"("subjectId");

-- CreateIndex
CREATE INDEX "lesson_plan_gradeId_idx" ON "lesson_plan"("gradeId");

-- AddForeignKey
ALTER TABLE "lesson_plan" ADD CONSTRAINT "lesson_plan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_plan" ADD CONSTRAINT "lesson_plan_sourceResourceId_fkey" FOREIGN KEY ("sourceResourceId") REFERENCES "resource"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_plan" ADD CONSTRAINT "lesson_plan_educationLevelId_fkey" FOREIGN KEY ("educationLevelId") REFERENCES "education_level"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_plan" ADD CONSTRAINT "lesson_plan_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subject"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_plan" ADD CONSTRAINT "lesson_plan_gradeId_fkey" FOREIGN KEY ("gradeId") REFERENCES "grade"("id") ON DELETE SET NULL ON UPDATE CASCADE;
