import { prisma } from '@/lib/db'

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
  const { resourceId, name, cloudinaryPublicId, fileType, sizeBytes } = input

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
