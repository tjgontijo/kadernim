import { prisma } from '@/server/db'

// Allowed file types
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
]

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB

export interface CreateFileInput {
  resourceId: string
  name: string
  cloudinaryPublicId: string
  url?: string
  fileType?: string
  sizeBytes?: number
  adminId: string
}

/**
 * Create a file record for a resource
 * Cloudinary public ID should be provided after upload
 */
export async function createFileService(
  input: CreateFileInput
) {
  const { resourceId, name, cloudinaryPublicId, url, fileType, sizeBytes } = input

  // Check if resource exists
  const resource = await prisma.resource.findUnique({
    where: { id: resourceId },
  })

  if (!resource) {
    throw new Error(`Resource with id ${resourceId} not found`)
  }

  // Create file record
  const file = await prisma.resourceFile.create({
    data: {
      name,
      cloudinaryPublicId,
      url,
      fileType,
      sizeBytes,
      resourceId,
    },
  })

  return file
}

/**
 * Delete a file from a resource
 * Assumes the file has already been deleted from Cloudinary
 */
export async function deleteFileService(
  fileId: string,
  resourceId: string,
  _adminId: string
): Promise<void> {
  // Check if file exists and belongs to the resource
  const file = await prisma.resourceFile.findUnique({
    where: { id: fileId },
  })

  if (!file) {
    throw new Error(`File with id ${fileId} not found`)
  }

  if (file.resourceId !== resourceId) {
    throw new Error('File does not belong to this resource')
  }

  // Delete file record
  await prisma.resourceFile.delete({
    where: { id: fileId },
  })
}

export async function getResourceFileById(fileId: string) {
  return prisma.resourceFile.findUnique({
    where: { id: fileId },
  })
}

export async function getResourceFileImageById(imageId: string) {
  return prisma.resourceFileImage.findUnique({
    where: { id: imageId },
    include: {
      file: {
        select: {
          id: true,
          resourceId: true,
        },
      },
    },
  })
}

export async function deleteResourceFileImage(
  resourceId: string,
  fileId: string,
  imageId: string
): Promise<void> {
  const image = await prisma.resourceFileImage.findUnique({
    where: { id: imageId },
    include: {
      file: {
        select: {
          id: true,
          resourceId: true,
        },
      },
    },
  })

  if (!image) {
    throw new Error('FILE_IMAGE_NOT_FOUND')
  }

  if (image.file.id !== fileId || image.file.resourceId !== resourceId) {
    throw new Error('FILE_IMAGE_OWNERSHIP_MISMATCH')
  }

  await prisma.$transaction(async (tx) => {
    await tx.resourceFileImage.delete({ where: { id: imageId } })

    const remaining = await tx.resourceFileImage.findMany({
      where: { fileId },
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
      select: { id: true },
    })

    for (const [index, item] of remaining.entries()) {
      await tx.resourceFileImage.update({
        where: { id: item.id },
        data: { order: index },
      })
    }
  })
}

export async function reorderResourceFileImagesByUpdates(
  resourceId: string,
  fileId: string,
  updates: Array<{ id: string; order: number }>
): Promise<void> {
  const ids = updates.map((update) => update.id)
  if (ids.length === 0) {
    return
  }

  const images = await prisma.resourceFileImage.findMany({
    where: {
      id: { in: ids },
      fileId,
    },
    include: {
      file: {
        select: {
          resourceId: true,
        },
      },
    },
  })

  if (images.length !== ids.length) {
    throw new Error('FILE_IMAGE_NOT_FOUND')
  }

  if (images.some((image) => image.file.resourceId !== resourceId)) {
    throw new Error('FILE_IMAGE_OWNERSHIP_MISMATCH')
  }

  await prisma.$transaction(
    updates.map((update) =>
      prisma.resourceFileImage.update({
        where: { id: update.id },
        data: { order: update.order },
      })
    )
  )
}

/**
 * Validate file before upload
 */
export function validateFile(
  mimeType: string,
  size: number
): { valid: boolean; error?: string } {
  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    return {
      valid: false,
      error: `File type ${mimeType} is not allowed. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`,
    }
  }

  if (size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size ${size} exceeds maximum of ${MAX_FILE_SIZE} bytes (50MB)`,
    }
  }

  return { valid: true }
}

export { ALLOWED_MIME_TYPES, MAX_FILE_SIZE }
