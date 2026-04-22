import { PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { Readable } from 'node:stream'
import { r2Client, R2_BUCKET_NAME, R2_PUBLIC_URL } from '@/server/clients/r2/config'

export interface R2UploadOptions {
  key: string
  body: Buffer | Uint8Array | string
  contentType?: string
  contentDisposition?: string
}

/**
 * Upload a buffer or string to R2
 */
export async function uploadToR2(options: R2UploadOptions) {
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: options.key,
    Body: options.body,
    ContentType: options.contentType,
    ContentDisposition: options.contentDisposition,
  })

  await r2Client.send(command)

  const url = R2_PUBLIC_URL 
    ? `${R2_PUBLIC_URL}/${options.key}` 
    : options.key

  return {
    key: options.key,
    url,
    sizeBytes: typeof options.body === 'string' 
      ? Buffer.byteLength(options.body) 
      : options.body.byteLength,
  }
}

/**
 * Delete an object from R2
 */
export async function deleteFromR2(key: string) {
  const command = new DeleteObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
  })

  await r2Client.send(command)
}

/**
 * Download an object from R2 as Buffer
 */
export async function getFromR2(key: string): Promise<Buffer> {
  const command = new GetObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
  })

  const response = await r2Client.send(command)

  if (!response.Body) {
    throw new Error(`R2 object not found or empty body: ${key}`)
  }

  const body = response.Body as Readable & {
    transformToByteArray?: () => Promise<Uint8Array>
  }

  if (typeof body.transformToByteArray === 'function') {
    const bytes = await body.transformToByteArray()
    return Buffer.from(bytes)
  }

  const chunks: Buffer[] = []
  for await (const chunk of body) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
  }
  return Buffer.concat(chunks)
}

/**
 * Get the public URL for a key
 */
export function getR2PublicUrl(key: string): string {
  if (key.startsWith('http')) return key
  return R2_PUBLIC_URL ? `${R2_PUBLIC_URL}/${key}` : key
}
