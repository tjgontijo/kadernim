import { cloudinary } from './config'
import { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary'

const FOLDER = 'resources/files'
const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB for files

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

export interface FileUploadResult {
  publicId: string
  url: string
  fileName: string
  fileType: string
  sizeBytes: number
}

export async function uploadFile(
  file: File,
  resourceId: string
): Promise<FileUploadResult> {
  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File must be smaller than ${MAX_FILE_SIZE / 1024 / 1024}MB`)
  }

  // Validate file type
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new Error(
      `File type not allowed: ${file.type}. Allowed types: PDF, Office documents, text`
    )
  }

  // Convert File to Buffer
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder: `${FOLDER}/${resourceId}`,
        public_id: `${Date.now()}-${Math.random().toString(36).substring(7)}`,
        resource_type: 'raw',
        tags: ['resource', 'file', resourceId],
        context: {
          originalName: file.name,
        },
      },
      (
        error: UploadApiErrorResponse | undefined,
        result: UploadApiResponse | undefined
      ) => {
        if (error) {
          reject(new Error(`File upload failed: ${error.message}`))
        } else if (result) {
          resolve({
            publicId: result.public_id,
            url: result.secure_url,
            fileName: file.name,
            fileType: file.type,
            sizeBytes: file.size,
          })
        } else {
          reject(new Error('File upload failed: No result returned'))
        }
      }
    ).end(buffer)
  })
}

export async function deleteFile(publicId: string): Promise<void> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, { resource_type: 'raw' }, (error, result) => {
      if (error) {
        reject(new Error(`File deletion failed: ${error.message}`))
      } else if (result && (result.result === 'ok' || result.result === 'not found')) {
        resolve()
      } else {
        reject(new Error(`File deletion failed: ${result?.result || 'Unknown error'}`))
      }
    })
  })
}

export function getFileUrl(publicId: string): string {
  return cloudinary.url(publicId, {
    secure: true,
    type: 'upload',
    resource_type: 'raw',
  })
}
