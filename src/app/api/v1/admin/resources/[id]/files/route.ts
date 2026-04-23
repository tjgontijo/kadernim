import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'node:crypto'
import { prisma } from '@/server/db'
import {
  authorizeAdminResourceRequest,
  adminResourceNotFound,
  adminResourceServerError,
} from '../../route-support'
import {
  createFileService,
  validateFile,
} from '@/lib/resources/services/admin'
import { serializeResourceFile } from '../media-route-support'
import { uploadToR2, deleteFromR2 } from '@/lib/storage/r2'
import {
  generatePreviewImagesFromPdf,
  uploadPdfToR2,
} from '@/services/resources/storage-service'
import { slugify } from '@/lib/utils/string'

const FALLBACK_CONTENT_TYPE = 'application/octet-stream'

const MIME_BY_EXTENSION: Record<string, string> = {
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ppt: 'application/vnd.ms-powerpoint',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  txt: 'text/plain',
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await authorizeAdminResourceRequest(request, {
      key: 'admin:resources:files:upload',
      limit: 20,
    })
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const { id } = await params
    const resource = await prisma.resource.findUnique({
      where: { id },
      select: { id: true, title: true, slug: true },
    })

    if (!resource) {
      return adminResourceNotFound('Resource not found')
    }

    const formData = await request.formData()
    const file = formData.get('file')
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const inferredMimeType = inferMimeType(file)
    const validation = validateFile(inferredMimeType, file.size)
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer())
    const fileId = randomUUID()
    const resourceSlug = resource.slug || slugify(resource.title || resource.id)
    const safeFileName = slugifyFileName(file.name)
    const isPdf = inferredMimeType === 'application/pdf'

    const uploadResult = isPdf
      ? await uploadPdfToR2(fileBuffer, {
          resourceSlug,
          driveFolderId: 'manual',
          driveFileId: fileId,
          fileName: file.name,
          mimeType: inferredMimeType,
        })
      : await uploadToR2({
          key: `resources/${resourceSlug}/files/manual/${fileId}/${safeFileName}`,
          body: fileBuffer,
          contentType: inferredMimeType || FALLBACK_CONTENT_TYPE,
        })

    const created = await createFileService({
      resourceId: id,
      name: file.name,
      cloudinaryPublicId: uploadResult.key,
      url: uploadResult.url,
      fileType: inferredMimeType,
      sizeBytes: uploadResult.sizeBytes,
      pageCount: 'pageCount' in uploadResult ? (uploadResult as any).pageCount : undefined,
      adminId: authResult.userId,
    })

    if (isPdf) {
      try {
        const previews = await generatePreviewImagesFromPdf({
          resourceSlug,
          resourceTitle: resource.title,
          driveFolderId: 'manual',
          driveFileId: fileId,
          pdfFileName: file.name,
          pdfBuffer: fileBuffer,
          fileDisplayName: file.name,
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
      } catch (error) {
        await prisma.resourceFile.delete({ where: { id: created.id } }).catch(() => undefined)
        await deleteFromR2(uploadResult.key).catch(() => undefined)
        throw error
      }
    }

    return NextResponse.json(serializeResourceFile(created), { status: 201 })
  } catch (error) {
    return adminResourceServerError('[POST /api/v1/admin/resources/:id/files]', error)
  }
}

function inferMimeType(file: File) {
  if (file.type) return file.type

  const extension = file.name.split('.').pop()?.toLowerCase()
  if (!extension) return FALLBACK_CONTENT_TYPE

  return MIME_BY_EXTENSION[extension] || FALLBACK_CONTENT_TYPE
}

function slugifyFileName(fileName: string) {
  const extension = fileName.includes('.') ? fileName.split('.').pop()?.toLowerCase() : ''
  const baseName = extension
    ? fileName.slice(0, -(extension.length + 1))
    : fileName

  const safeBase = slugify(baseName || 'arquivo')
  return extension ? `${safeBase}.${extension}` : safeBase
}
