import { cloudinary } from './config'
import { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary'

const MAX_FILE_SIZE = 500 * 1024 * 1024 // 500MB for videos
const ALLOWED_MIME_TYPES = ['video/mp4', 'video/webm', 'video/quicktime']

export interface VideoUploadResult {
  publicId: string
  url: string
  title: string
  duration: number
  width: number
  height: number
  format: string
}

export async function uploadVideo(
  file: File,
  folder: string,
  resourceId: string,
  title: string
): Promise<VideoUploadResult> {
  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`Video must be smaller than ${MAX_FILE_SIZE / 1024 / 1024}MB`)
  }

  // Validate file type
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new Error(
      `Video type not allowed: ${file.type}. Allowed types: MP4, WebM, QuickTime`
    )
  }

  // Convert File to Buffer
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder: `${folder}/${resourceId}`,
        public_id: `${Date.now()}-${Math.random().toString(36).substring(7)}`,
        resource_type: 'video',
        tags: ['resource', 'video', resourceId],
        context: {
          title: title,
        },
        eager: [
          {
            width: 640,
            height: 480,
            crop: 'fill',
            gravity: 'auto',
            quality: 'auto',
            fetch_format: 'jpg',
          },
        ],
        eager_async: true,
      },
      (
        error: UploadApiErrorResponse | undefined,
        result: UploadApiResponse | undefined
      ) => {
        if (error) {
          reject(new Error(`Video upload failed: ${error.message}`))
        } else if (result) {
          resolve({
            publicId: result.public_id,
            url: result.secure_url,
            title: title,
            duration: result.duration || 0,
            width: result.width,
            height: result.height,
            format: result.format,
          })
        } else {
          reject(new Error('Video upload failed: No result returned'))
        }
      }
    ).end(buffer)
  })
}

export async function deleteVideo(publicId: string): Promise<void> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, { resource_type: 'video' }, (error, result) => {
      if (error) {
        reject(new Error(`Video deletion failed: ${error.message}`))
      } else if (result && (result.result === 'ok' || result.result === 'not found')) {
        resolve()
      } else {
        reject(new Error(`Video deletion failed: ${result?.result || 'Unknown error'}`))
      }
    })
  })
}

export function getVideoUrl(publicId: string): string {
  return cloudinary.url(publicId, {
    secure: true,
    type: 'upload',
    resource_type: 'video',
  })
}

export function getVideoThumbnail(publicId: string, time?: number): string {
  return cloudinary.url(publicId, {
    secure: true,
    type: 'upload',
    resource_type: 'video',
    fetch_format: 'jpg',
    quality: 'auto',
    gravity: 'auto',
    width: 640,
    height: 480,
    crop: 'fill',
    start_offset: time,
  })
}

export interface VideoTransformOptions {
  width?: number
  height?: number
  crop?: string
  quality?: string
  format?: string
}

export function getOptimizedVideoUrl(
  publicId: string,
  options: VideoTransformOptions = {}
): string {
  return cloudinary.url(publicId, {
    secure: true,
    type: 'upload',
    resource_type: 'video',
    quality: options.quality || 'auto',
    fetch_format: options.format,
    crop: options.crop,
    width: options.width,
    height: options.height,
  })
}
