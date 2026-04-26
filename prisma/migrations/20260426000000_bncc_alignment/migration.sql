-- CreateEnum for EducationLevelType
CREATE TYPE "EducationLevelType" AS ENUM ('EF', 'EM');

-- CreateEnum for SubjectComponentType
CREATE TYPE "SubjectComponentType" AS ENUM ('LINGUA_PORTUGUESA', 'ARTE', 'EDUCACAO_FISICA', 'LINGUA_INGLESA', 'MATEMATICA', 'CIENCIAS', 'HISTORIA', 'GEOGRAFIA', 'ENSINO_RELIGIOSO');

-- CreateTable KnowledgeArea
CREATE TABLE "knowledge_area" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "knowledge_area_pkey" PRIMARY KEY ("id")
);

-- CreateIndex for KnowledgeArea
CREATE UNIQUE INDEX "knowledge_area_code_key" ON "knowledge_area"("code");
CREATE UNIQUE INDEX "knowledge_area_name_key" ON "knowledge_area"("name");
CREATE INDEX "knowledge_area_code_idx" ON "knowledge_area"("code");

-- AlterTable EducationLevel - add type column
ALTER TABLE "education_level" ADD COLUMN "type" "EducationLevelType";

-- CreateIndex for EducationLevel.type (unique for existing records)
CREATE UNIQUE INDEX "education_level_type_key" ON "education_level"("type");

-- AlterTable Grade - add year column
ALTER TABLE "grade" ADD COLUMN "year" INTEGER;

-- CreateIndex for Grade.year
CREATE INDEX "grade_year_idx" ON "grade"("year");

-- AlterTable Subject - add componentCode and knowledgeAreaId columns
ALTER TABLE "subject" ADD COLUMN "componentCode" TEXT;
ALTER TABLE "subject" ADD COLUMN "knowledgeAreaId" UUID;

-- AddForeignKey for Subject
ALTER TABLE "subject" ADD CONSTRAINT "subject_knowledgeAreaId_fkey" FOREIGN KEY ("knowledgeAreaId") REFERENCES "knowledge_area"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateIndex for Subject
CREATE UNIQUE INDEX "subject_componentCode_key" ON "subject"("componentCode");
CREATE INDEX "subject_knowledgeAreaId_idx" ON "subject"("knowledgeAreaId");
