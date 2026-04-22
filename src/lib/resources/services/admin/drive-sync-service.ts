import { prisma } from '@/server/db'
import { listDriveFileIds, downloadDriveFile } from '@/services/resources/drive-service'
import {
  buildResourcePdfObjectKey,
  buildResourceVideoPublicId,
  generatePreviewImagesFromPdf,
  uploadPdfToR2,
  uploadVideoToCloudinary,
} from '@/services/resources/storage-service'

export interface GoogleDriveSyncInput {
  resourceId: string
  resourceSlug: string
  resourceTitle: string
  googleDriveUrl: string
}

export interface GoogleDriveSyncSummary {
  invalidFolderUrl: number
  emptyDriveFolder: number
  duplicatesSkipped: number
  uploadedPdfsToR2: number
  uploadedVideosToCloudinary: number
  generatedPreviewSets: number
  previewFailures: number
  downloadFailures: number
}

export async function syncResourceFilesFromGoogleDrive(
  input: GoogleDriveSyncInput
): Promise<GoogleDriveSyncSummary> {
  const summary: GoogleDriveSyncSummary = {
    invalidFolderUrl: 0,
    emptyDriveFolder: 0,
    duplicatesSkipped: 0,
    uploadedPdfsToR2: 0,
    uploadedVideosToCloudinary: 0,
    generatedPreviewSets: 0,
    previewFailures: 0,
    downloadFailures: 0,
  }

  const folderId = extractDriveFolderId(input.googleDriveUrl)
  if (!folderId) {
    summary.invalidFolderUrl += 1
    return summary
  }

  const driveFiles = await listDriveFileIds(folderId)
  if (driveFiles.length === 0) {
    summary.emptyDriveFolder += 1
    return summary
  }

  for (const { id: driveFileId, name: driveFileName } of driveFiles) {
    try {
      const downloaded = await downloadDriveFile(driveFileId)

      if (downloaded.mimeType.includes('video')) {
        const expectedVideoId = buildResourceVideoPublicId({
          resourceSlug: input.resourceSlug,
          fileName: downloaded.fileName,
        })

        const existingVideo = await prisma.resourceVideo.findUnique({
          where: { cloudinaryPublicId: expectedVideoId },
          select: { id: true, resourceId: true },
        })

        if (existingVideo) {
          summary.duplicatesSkipped += 1
          continue
        }

        const upload = await uploadVideoToCloudinary(downloaded.buffer, {
          resourceSlug: input.resourceSlug,
          driveFolderId: folderId,
          driveFileId,
          fileName: downloaded.fileName,
        })

        await prisma.resourceVideo.create({
          data: {
            resourceId: input.resourceId,
            title: downloaded.fileName,
            cloudinaryPublicId: upload.public_id,
            url: upload.secure_url,
            thumbnail: upload.secure_url.replace(/\.[^.]+$/, '.jpg'),
            duration: Math.round(upload.duration || 0),
            order: 99,
          },
        })

        summary.uploadedVideosToCloudinary += 1
        continue
      }

      if (downloaded.mimeType.includes('pdf')) {
        const expectedPdfKey = buildResourcePdfObjectKey({
          resourceSlug: input.resourceSlug,
          driveFileId,
          fileName: downloaded.fileName,
        })

        const existingFile = await prisma.resourceFile.findUnique({
          where: { cloudinaryPublicId: expectedPdfKey },
          select: { id: true, resourceId: true },
        })

        if (existingFile) {
          summary.duplicatesSkipped += 1
          continue
        }

        const upload = await uploadPdfToR2(downloaded.buffer, {
          resourceSlug: input.resourceSlug,
          driveFolderId: folderId,
          driveFileId,
          fileName: downloaded.fileName,
          mimeType: downloaded.mimeType,
        })
        summary.uploadedPdfsToR2 += 1

        const created = await prisma.resourceFile.create({
          data: {
            name: downloaded.fileName,
            cloudinaryPublicId: upload.key,
            url: upload.url,
            fileType: downloaded.mimeType,
            sizeBytes: upload.sizeBytes,
            resourceId: input.resourceId,
          },
        })

        try {
          const previews = await generatePreviewImagesFromPdf({
            resourceSlug: input.resourceSlug,
            resourceTitle: input.resourceTitle,
            driveFolderId: folderId,
            driveFileId,
            pdfFileName: downloaded.fileName,
            pdfBuffer: downloaded.buffer,
            fileDisplayName: downloaded.fileName,
          })

          await prisma.resourceFileImage.deleteMany({ where: { fileId: created.id } })
          if (previews.length > 0) {
            await prisma.resourceFileImage.createMany({
              data: previews.map((preview, index) => ({
                fileId: created.id,
                cloudinaryPublicId: preview.cloudinaryPublicId,
                url: preview.url,
                alt: preview.alt,
                order: index,
              })),
            })
          }

          summary.generatedPreviewSets += 1
        } catch (error) {
          summary.previewFailures += 1
          console.error(
            `[GOOGLE_DRIVE_SYNC] Falha ao gerar previews do PDF ${downloaded.fileName}:`,
            error
          )
        }
        continue
      }

      console.warn(
        `[GOOGLE_DRIVE_SYNC] Tipo de arquivo não suportado (${downloaded.mimeType}) para ${driveFileName}`
      )
    } catch (error) {
      summary.downloadFailures += 1
      console.error(
        `[GOOGLE_DRIVE_SYNC] Falha ao processar arquivo ${driveFileName} (resourceId=${input.resourceId}, driveFileId=${driveFileId}):`,
        error
      )
    }
  }

  return summary
}

function extractDriveFolderId(url: string): string | null {
  const byPath = url.match(/\/folders\/([a-zA-Z0-9_-]+)/)?.[1]
  if (byPath) return byPath

  const byQuery = url.match(/[?&]id=([a-zA-Z0-9_-]+)/)?.[1]
  if (byQuery) return byQuery

  return null
}
