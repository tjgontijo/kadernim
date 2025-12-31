import { cloudinary, CLOUDINARY_CLOUD_NAME } from './config'
import { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary'

const FOLDER = 'resources/images'
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB for images

export interface ImageUploadResult {
  publicId: string
  url: string
  width: number
  height: number
  format: string
}

export async function uploadImage(
  file: File,
  resourceId: string,
  altText?: string
): Promise<ImageUploadResult> {
  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`Image must be smaller than ${MAX_FILE_SIZE / 1024 / 1024}MB`)
  }

  // Validate file type
  if (!file.type.startsWith('image/')) {
    throw new Error('File must be an image')
  }

  // Convert File to Buffer
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder: `${FOLDER}/${resourceId}`,
        public_id: `${Date.now()}-${Math.random().toString(36).substring(7)}`,
        resource_type: 'image',
        quality: 'auto',
        format: 'webp',
        responsive_width: true,
        tags: ['resource', 'image', resourceId],
        context: {
          alt: altText || 'Resource image',
        },
      },
      (
        error: UploadApiErrorResponse | undefined,
        result: UploadApiResponse | undefined
      ) => {
        if (error) {
          reject(new Error(`Image upload failed: ${error.message}`))
        } else if (result) {
          resolve({
            publicId: result.public_id,
            url: result.secure_url,
            width: result.width,
            height: result.height,
            format: result.format,
          })
        } else {
          reject(new Error('Image upload failed: No result returned'))
        }
      }
    ).end(buffer)
  })
}

export async function deleteImage(publicId: string): Promise<void> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, (error, result) => {
      if (error) {
        reject(new Error(`Image deletion failed: ${error.message}`))
      } else if (result && (result.result === 'ok' || result.result === 'not found')) {
        resolve()
      } else {
        reject(new Error(`Image deletion failed: ${result?.result || 'Unknown error'}`))
      }
    })
  })
}

export function getImageUrl(publicId: string, options?: Record<string, any>): string {
  return cloudinary.url(publicId, {
    secure: true,
    type: 'upload',
    quality: 'auto',
    fetch_format: 'auto',
    ...options,
  })
}

export interface ImageTransformOptions {
  width?: number
  height?: number
  crop?: string
  gravity?: string
  quality?: string
  format?: string
}

export function getOptimizedImageUrl(
  publicId: string,
  options: ImageTransformOptions = {}
): string {
  return cloudinary.url(publicId, {
    secure: true,
    type: 'upload',
    quality: 'auto',
    fetch_format: 'auto',
    crop: options.crop || 'fill',
    gravity: options.gravity || 'auto',
    width: options.width,
    height: options.height,
    ...options,
  })
}
export async function uploadImageFromUrl(
  imageUrl: string,
  options?: {
    publicId?: string
    folder?: string
    altText?: string
  }
): Promise<ImageUploadResult> {
  console.log(`Uploading image from URL: ${imageUrl}`)

  const uploadOptions: any = {
    folder: options?.folder || FOLDER,
    resource_type: 'image',
    quality: 'auto',
    fetch_format: 'auto',
  }

  if (options?.publicId) {
    uploadOptions.public_id = options.publicId
  }

  if (options?.altText) {
    uploadOptions.context = { alt: options.altText }
  }

  try {
    const result = await cloudinary.uploader.upload(imageUrl, uploadOptions)

    return {
      publicId: result.public_id,
      url: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format,
    }
  } catch (error) {
    console.error(`Failed to upload image from URL (${imageUrl}):`, error)
    throw new Error(`Failed to upload image from URL: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}
