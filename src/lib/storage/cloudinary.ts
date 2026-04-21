import { cloudinary, CLOUDINARY_CLOUD_NAME } from '@/server/clients/cloudinary/config'
import { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary'
import { Readable } from 'node:stream'

const MAX_IMAGE_SIZE = 10 * 1024 * 1024 // 10MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024 // 100MB

// Cache to prevent duplicate concurrent uploads of the same asset
const ongoingUploads = new Map<string, Promise<UploadApiResponse>>()

export interface CloudinaryUploadOptions {
  folder: string
  publicId?: string
  tags?: string[]
  context?: Record<string, string>
  overwrite?: boolean
  resourceType?: 'image' | 'video' | 'raw'
}

/**
 * Upload an image to Cloudinary
 */
export async function uploadImage(
  file: Buffer | File,
  options: CloudinaryUploadOptions
): Promise<UploadApiResponse> {
  const buffer = Buffer.isBuffer(file) ? file : Buffer.from(await (file as File).arrayBuffer())

  if (buffer.byteLength > MAX_IMAGE_SIZE) {
    throw new Error(`Image is too large (${(buffer.byteLength / 1024 / 1024).toFixed(1)}MB). Max 10MB.`)
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder,
        public_id: options.publicId,
        overwrite: options.overwrite ?? true,
        resource_type: 'image',
        quality: 'auto',
        fetch_format: 'auto',
        tags: options.tags,
        context: options.context,
      },
      (error, result) => {
        if (error) reject(new Error(`Cloudinary upload failed: ${error.message}`))
        else if (result) resolve(result)
        else reject(new Error('Cloudinary upload failed: No result'))
      }
    )
    
    Readable.from(buffer).pipe(uploadStream)
  })
}

/**
 * Upload a video using chunked stream (for larger files)
 */
export async function uploadVideoChunked(
  buffer: Buffer,
  options: CloudinaryUploadOptions
): Promise<UploadApiResponse> {
  const cacheKey = options.publicId || `${options.folder}/${Date.now()}`

  if (ongoingUploads.has(cacheKey)) {
    return ongoingUploads.get(cacheKey)!
  }

  const uploadPromise = new Promise<UploadApiResponse>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_chunked_stream(
      {
        resource_type: options.resourceType || 'video',
        folder: options.folder,
        public_id: options.publicId,
        overwrite: options.overwrite ?? true,
        chunk_size: 6_000_000,
        tags: options.tags,
      },
      (error, result) => {
        if (error) return reject(error)
        if (result && 'done' in result && result.done === false) return
        if (!result) return reject(new Error('Upload failed - empty result'))
        resolve(result as UploadApiResponse)
      }
    )

    Readable.from(buffer).pipe(stream)
  })

  ongoingUploads.set(cacheKey, uploadPromise)
  
  // Cleanup cache after 2 minutes
  setTimeout(() => ongoingUploads.delete(cacheKey), 120_000)

  return uploadPromise
}

/**
 * Upload a raw file (PDF, doc, etc)
 */
export async function uploadRaw(
  file: Buffer | File,
  options: CloudinaryUploadOptions
): Promise<UploadApiResponse> {
  const buffer = Buffer.isBuffer(file) ? file : Buffer.from(await (file as File).arrayBuffer())

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder,
        public_id: options.publicId,
        overwrite: options.overwrite ?? true,
        resource_type: 'raw',
        tags: options.tags,
        context: options.context,
      },
      (error, result) => {
        if (error) reject(new Error(`Cloudinary upload failed: ${error.message}`))
        else if (result) resolve(result)
        else reject(new Error('Cloudinary upload failed: No result'))
      }
    )
    
    Readable.from(buffer).pipe(uploadStream)
  })
}

/**
 * Delete an asset from Cloudinary
 */
export async function deleteAsset(
  publicId: string, 
  resourceType: 'image' | 'video' | 'raw' = 'image'
): Promise<void> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, { resource_type: resourceType }, (error, result) => {
      if (error) {
        reject(new Error(`Cloudinary deletion failed: ${error.message}`))
      } else if (result && (result.result === 'ok' || result.result === 'not found')) {
        resolve()
      } else {
        reject(new Error(`Cloudinary deletion failed: ${result?.result || 'Unknown error'}`))
      }
    })
  })
}

/**
 * Upload an image from a URL
 */
export async function uploadFromUrl(
  url: string,
  options: CloudinaryUploadOptions
): Promise<UploadApiResponse> {
  try {
    return await cloudinary.uploader.upload(url, {
      folder: options.folder,
      public_id: options.publicId,
      overwrite: options.overwrite ?? true,
      resource_type: options.resourceType || 'image',
      quality: 'auto',
      fetch_format: 'auto',
      context: options.context,
      tags: options.tags,
    })
  } catch (error) {
    throw new Error(`Failed to upload from URL: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Generate a Cloudinary URL with options
 */
export function getCloudinaryUrl(publicId: string, options: Record<string, any> = {}): string {
  return cloudinary.url(publicId, {
    secure: true,
    quality: 'auto',
    fetch_format: 'auto',
    ...options,
  })
}

/**
 * Get video thumbnail URL
 */
export function getVideoThumbnail(publicId: string, time?: number): string {
  return getCloudinaryUrl(publicId, {
    resource_type: 'video',
    fetch_format: 'jpg',
    gravity: 'auto',
    width: 640,
    height: 480,
    crop: 'fill',
    start_offset: time,
  })
}

