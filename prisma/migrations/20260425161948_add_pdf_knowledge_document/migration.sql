-- CreateEnum
CREATE TYPE "PdfKnowledgeSourceType" AS ENUM ('LOCAL_FILE', 'RESOURCE_FILE');

-- CreateTable
CREATE TABLE "pdf_knowledge_document" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "sourceType" "PdfKnowledgeSourceType" NOT NULL,
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

-- CreateIndex
CREATE UNIQUE INDEX "pdf_knowledge_document_sourceType_sourceKey_key" ON "pdf_knowledge_document"("sourceType", "sourceKey");

-- CreateIndex
CREATE INDEX "pdf_knowledge_document_resourceId_idx" ON "pdf_knowledge_document"("resourceId");

-- CreateIndex
CREATE INDEX "pdf_knowledge_document_resourceFileId_idx" ON "pdf_knowledge_document"("resourceFileId");

-- CreateIndex
CREATE INDEX "pdf_knowledge_document_pdfName_idx" ON "pdf_knowledge_document"("pdfName");

-- CreateIndex
CREATE INDEX "pdf_knowledge_document_extractedAt_idx" ON "pdf_knowledge_document"("extractedAt");

-- AddForeignKey
ALTER TABLE "pdf_knowledge_document" ADD CONSTRAINT "pdf_knowledge_document_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "resource"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pdf_knowledge_document" ADD CONSTRAINT "pdf_knowledge_document_resourceFileId_fkey" FOREIGN KEY ("resourceFileId") REFERENCES "resource_file"("id") ON DELETE SET NULL ON UPDATE CASCADE;
