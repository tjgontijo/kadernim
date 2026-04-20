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
  const key = `shared/files/${options.driveFileId}/file.pdf`

  await r2Client.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      Body: optimizedBuffer,
      ContentType: options.mimeType,
      ContentDisposition: `attachment; filename="${options.fileName}"`,
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
  const publicId = `shared/videos/${options.driveFileId}`
  
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
          folder: `shared/videos`,
          public_id: options.driveFileId,
          overwrite: true,
          chunk_size: 6_000_000,
          tags: ['resource', 'video', 'shared'],
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

  // 2. Upload como "PDF base" para extração de páginas
  const pdfSource = await new Promise<UploadApiResponse>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_chunked_stream(
      {
        resource_type: 'image',
        format: 'pdf',
        folder: `resources/${options.resourceSlug}/files/${options.driveFileId}/preview-source`,
        public_id: 'pdf-source',
        overwrite: true,
        tags: ['resource', 'pdf-source', options.resourceSlug],
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
    const url = cloudinary.url(pdfSource.publicIp || pdfSource.public_id, {
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
      folder: `resources/${options.resourceSlug}/files/${options.driveFileId}/previews`,
      public_id: `page-${i + 1}`,
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

function pickPreviewPages(total: number): number[] {
  if (total <= 4) return Array.from({ length: total }, (_, i) => i + 1)
  // Lógica simplificada: primeira, meio, penúltima, última (ou similar)
  return [1, Math.floor(total / 2), total - 1, total]
}
