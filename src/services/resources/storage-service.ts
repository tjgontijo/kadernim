import { r2Client, R2_BUCKET_NAME, R2_PUBLIC_URL } from '../../server/clients/r2/config'
import { cloudinary } from '../../server/clients/cloudinary/config'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import type { UploadApiResponse } from 'cloudinary'
import { Readable } from 'node:stream'
import { optimizePdf, optimizeVideo, CLOUDINARY_RAW_MAX_BYTES, CLOUDINARY_VIDEO_MAX_BYTES } from './media-service'

const ongoingUploads = new Map<string, Promise<any>>()

/**
 * Faz o upload de um PDF para o Cloudflare R2 após otimização.
 */
export async function uploadPdfToR2(
  buffer: Buffer,
  options: { resourceSlug: string; driveFileId: string; fileName: string; mimeType: string }
) {
  const optimizedBuffer = await optimizePdf(buffer, options.fileName)
  const key = buildResourcePdfObjectKey(options)
  const contentDisposition = buildSafeContentDisposition(options.fileName)

  await r2Client.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      Body: optimizedBuffer,
      ContentType: options.mimeType,
      ContentDisposition: contentDisposition,
    })
  )

  const url = R2_PUBLIC_URL ? `${R2_PUBLIC_URL}/${key}` : key

  return {
    key,
    url,
    sizeBytes: optimizedBuffer.byteLength,
  }
}

/**
 * Faz o upload de vídeo para o Cloudinary em pedaços (chunked).
 */
export async function uploadVideoToCloudinary(
  buffer: Buffer,
  options: { resourceSlug: string; driveFileId: string; fileName: string }
) {
  const publicId = buildResourceVideoPublicId(options)
  
  if (ongoingUploads.has(publicId)) {
    console.log(`📡 Usando upload já em curso para o vídeo: ${options.fileName}`)
    return ongoingUploads.get(publicId)!
  }

  const uploadPromise = (async () => {
    const uploadBuffer = await optimizeVideo(buffer, options.fileName)

    if (uploadBuffer.byteLength > CLOUDINARY_VIDEO_MAX_BYTES) {
      throw new Error(`O vídeo permanece acima de 100MB (${(uploadBuffer.byteLength / 1024 / 1024).toFixed(1)}MB) mesmo após compressão.`)
    }

    return new Promise<UploadApiResponse>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_chunked_stream(
        {
          resource_type: 'video',
          public_id: publicId,
          overwrite: true,
          chunk_size: 6_000_000,
          tags: ['resource', 'video', options.resourceSlug, options.driveFileId],
        },
        (error, result) => {
          if (error) return reject(error)
          if (result && 'done' in result && result.done === false) return
          if (!result) return reject(new Error('Upload failed - empty result'))
          resolve(result as UploadApiResponse)
        }
      )
      Readable.from(uploadBuffer).pipe(stream)
    })
  })()

  ongoingUploads.set(publicId, uploadPromise)
  
  // Limpar cache de upload após 2 minutos
  setTimeout(() => ongoingUploads.delete(publicId), 120_000)
  
  return uploadPromise
}

/**
 * Gera imagens de preview do PDF no Cloudinary.
 */
export async function generatePreviewImagesFromPdf(options: {
  resourceSlug: string
  resourceTitle: string
  driveFileId: string
  pdfFileName: string
  pdfBuffer: Buffer
  fileDisplayName: string
}) {
  // 1. Otimizar PDF antes de tentar mandar pro Cloudinary para preview
  const uploadBuffer = await optimizePdf(options.pdfBuffer, options.pdfFileName)

  if (uploadBuffer.byteLength > CLOUDINARY_RAW_MAX_BYTES) {
    throw new Error(`Arquivo muito grande (${(uploadBuffer.byteLength / 1024 / 1024).toFixed(1)}MB) para gerar previews no Cloudinary.`)
  }

  const previewFileSlug = slugifyStorageName(stripExtension(options.pdfFileName), 'arquivo')
  const basePath = `resources/${options.resourceSlug}/${options.driveFileId}`

  // 2. Upload como "PDF base" para extração de páginas
  const pdfSource = await new Promise<UploadApiResponse>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_chunked_stream(
      {
        resource_type: 'image',
        format: 'pdf',
        public_id: `${basePath}/thumb`,
        overwrite: true,
        tags: ['resource', 'pdf-source', options.resourceSlug, options.driveFileId],
      },
      (error, result) => {
        if (error) return reject(error)
        if (result && 'done' in result && result.done === false) return
        if (!result) return reject(new Error('Upload source failed'))
        resolve(result)
      }
    )
    Readable.from(uploadBuffer).pipe(stream)
  })

  // 3. Escolher e gerar imagens de páginas específicas
  const totalPages = (pdfSource as any).pages || 1
  const selectedPages = pickPreviewPages(totalPages)
  const images = []

  for (let i = 0; i < selectedPages.length; i++) {
    const page = selectedPages[i]
    const url = cloudinary.url(pdfSource.public_id, {
      secure: true,
      resource_type: 'image',
      format: 'jpg',
      transformation: [
        { page },
        { quality: 'auto:good' },
        { width: 1400, crop: 'limit' },
      ],
    })

    const uploaded = await cloudinary.uploader.upload(url, {
      public_id: `${basePath}/preview/${previewFileSlug}/images-${i + 1}`,
      overwrite: true,
      resource_type: 'image',
      context: { alt: `${options.resourceTitle} - ${options.fileDisplayName} - página ${page}` },
    })
    const uploadedContext = uploaded.context as { custom?: { alt?: string } } | undefined

    images.push({
      cloudinaryPublicId: uploaded.public_id,
      url: uploaded.secure_url,
      alt: uploadedContext?.custom?.alt ?? options.resourceTitle,
    })
  }

  return images
}

export function buildResourcePdfObjectKey(options: { resourceSlug: string; driveFileId: string; fileName: string }) {
  const fileSlug = slugifyStorageName(stripExtension(options.fileName), 'arquivo')
  return `resources/${options.resourceSlug}/${options.driveFileId}/files/${fileSlug}.pdf`
}

export function buildResourceVideoPublicId(options: { resourceSlug: string; driveFileId: string; fileName: string }) {
  const fileSlug = slugifyStorageName(stripExtension(options.fileName), 'video')
  return `resources/${options.resourceSlug}/${options.driveFileId}/videos/${fileSlug}`
}

function pickPreviewPages(total: number): number[] {
  if (total <= 4) return Array.from({ length: total }, (_, i) => i + 1)
  // Lógica simplificada: primeira, meio, penúltima, última (ou similar)
  return [1, Math.floor(total / 2), total - 1, total]
}

function buildSafeContentDisposition(fileName: string): string {
  const asciiName = fileName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\x20-\x7E]/g, '')
    .replace(/["\\]/g, '')
    .trim()

  const fallbackName = asciiName.length > 0 ? asciiName : 'file.pdf'
  return `attachment; filename="${fallbackName}"`
}

function stripExtension(fileName: string): string {
  return fileName.replace(/\.[^/.]+$/, '')
}

function slugifyStorageName(value: string, fallback: string): string {
  const slug = value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

  return slug.length > 0 ? slug : fallback
}

/**
 * Faz upload de imagem de capa a partir de uma URL para o Cloudinary.
 */
export async function uploadImageFromUrlToCloudinary(options: {
  imageUrl: string
  resourceId: string
  publicId?: string
  altText?: string
}) {
  const upload = await cloudinary.uploader.upload(options.imageUrl, {
    folder: `resources/images/${options.resourceId}`,
    public_id: options.publicId ?? 'cover',
    overwrite: true,
    resource_type: 'image',
    quality: 'auto',
    fetch_format: 'auto',
    context: options.altText ? { alt: options.altText } : undefined,
    tags: ['resource', 'image', 'seed', options.resourceId],
  })

  return {
    publicId: upload.public_id,
    url: upload.secure_url,
    width: upload.width,
    height: upload.height,
    format: upload.format,
  }
}
