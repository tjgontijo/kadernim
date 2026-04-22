import { uploadToR2, getR2PublicUrl } from '@/lib/storage/r2'
import { uploadVideoChunked, uploadImage, uploadFromUrl, getCloudinaryUrl } from '@/lib/storage/cloudinary'
import {
  optimizePdf,
  optimizeVideo,
  CLOUDINARY_RAW_MAX_BYTES,
  CLOUDINARY_VIDEO_MAX_BYTES,
  extractPdfPages
} from '@/lib/media'

/**
 * Faz o upload de um PDF para o Cloudflare R2 após otimização.
 */
export async function uploadPdfToR2(
  buffer: Buffer,
  options: { resourceSlug: string; driveFolderId: string; driveFileId: string; fileName: string; mimeType: string }
) {
  const startOpt = performance.now()
  const optimizedBuffer = await optimizePdf(buffer, options.fileName)
  const optDuration = ((performance.now() - startOpt) / 1000).toFixed(1)
  console.log(`  ⚙️ Otimização PDF: ${optDuration}s`)

  const startUpload = performance.now()
  const key = buildResourcePdfObjectKey(options)
  const contentDisposition = buildSafeContentDisposition(options.fileName)

  const result = await uploadToR2({
    key,
    body: optimizedBuffer,
    contentType: options.mimeType,
    contentDisposition,
  })
  const uploadDuration = ((performance.now() - startUpload) / 1000).toFixed(1)
  console.log(`  ☁️ Upload R2: ${uploadDuration}s`)

  return result
}

/**
 * Faz o upload de vídeo para o Cloudinary em pedaços (chunked).
 */
export async function uploadVideoToCloudinary(
  buffer: Buffer,
  options: { resourceSlug: string; driveFolderId: string; driveFileId: string; fileName: string }
) {
  const publicId = buildResourceVideoPublicId(options)
  const uploadBuffer = await optimizeVideo(buffer, options.fileName)

  if (uploadBuffer.byteLength > CLOUDINARY_VIDEO_MAX_BYTES) {
    throw new Error(`O vídeo permanece acima de 100MB (${(uploadBuffer.byteLength / 1024 / 1024).toFixed(1)}MB) mesmo após compressão.`)
  }

  return await uploadVideoChunked(uploadBuffer, {
    folder: '', // Public ID already has path
    publicId: publicId,
    tags: ['resource', 'video', options.resourceSlug, options.driveFolderId, options.driveFileId],
  })
}

/**
 * Gera imagens de preview do PDF localmente e faz upload para o Cloudinary em paralelo.
 */
export async function generatePreviewImagesFromPdf(options: {
  resourceSlug: string
  resourceTitle: string
  driveFolderId: string
  driveFileId: string
  pdfFileName: string
  pdfBuffer: Buffer
  fileDisplayName: string
}) {
  // 1. Usar o buffer original para extração (mais rápido e melhor qualidade)
  const totalPagesEstimate = options.pdfBuffer.length > 5000000 ? 20 : 10 
  const selectedPages = pickPreviewPages(24) 

  // 2. Extrair páginas localmente usando Ghostscript
  const startExtract = performance.now()
  const pageBuffers = await extractPdfPages(options.pdfBuffer, selectedPages, options.pdfFileName)
  const extractDuration = ((performance.now() - startExtract) / 1000).toFixed(1)
  console.log(`  🖼️ Extração Local (${selectedPages.length} pgs): ${extractDuration}s`)

  const previewFileSlug = slugifyStorageName(stripExtension(options.pdfFileName), 'arquivo')
  const basePath = `resources/${options.resourceSlug}/images`

  // 3. Upload de todas as páginas em paralelo para o Cloudinary
  const startUpload = performance.now()
  const uploadPromises = pageBuffers.map(async (buffer, i) => {
    const pageNumber = selectedPages[i]
    const uploaded = await uploadImage(buffer, {
      folder: `${basePath}/preview/${previewFileSlug}`,
      publicId: `page-${i + 1}`,
      context: { alt: `${options.resourceTitle} - ${options.fileDisplayName} - página ${pageNumber}` },
      tags: ['resource', 'preview', options.resourceSlug, options.driveFolderId]
    })

    const uploadedContext = uploaded.context as { custom?: { alt?: string } } | undefined

    return {
      cloudinaryPublicId: uploaded.public_id,
      url: uploaded.secure_url,
      alt: uploadedContext?.custom?.alt ?? options.resourceTitle,
    }
  })

  const results = await Promise.all(uploadPromises)
  const uploadDuration = ((performance.now() - startUpload) / 1000).toFixed(1)
  console.log(`  ☁️ Upload Cloudinary (Paralelo): ${uploadDuration}s`)

  return results
}

/**
 * Gera apenas uma página de preview do PDF e envia para o Cloudinary.
 */
export async function generateSinglePreviewImageFromPdf(options: {
  resourceSlug: string
  resourceTitle: string
  driveFolderId: string
  driveFileId: string
  pdfFileName: string
  pdfBuffer: Buffer
  fileDisplayName: string
  pageNumber: number
  previewOrder: number
}) {
  const pageBuffers = await extractPdfPages(options.pdfBuffer, [options.pageNumber], options.pdfFileName)

  if (pageBuffers.length === 0) {
    throw new Error('PREVIEW_PAGE_NOT_AVAILABLE')
  }

  const previewFileSlug = slugifyStorageName(stripExtension(options.pdfFileName), 'arquivo')
  const basePath = `resources/${options.resourceSlug}/images`

  const uploaded = await uploadImage(pageBuffers[0], {
    folder: `${basePath}/preview/${previewFileSlug}`,
    publicId: `page-${options.previewOrder}`,
    context: { alt: `${options.resourceTitle} - ${options.fileDisplayName} - página ${options.pageNumber}` },
    tags: ['resource', 'preview', options.resourceSlug, options.driveFolderId]
  })

  const uploadedContext = uploaded.context as { custom?: { alt?: string } } | undefined

  return {
    cloudinaryPublicId: uploaded.public_id,
    url: uploaded.secure_url,
    alt: uploadedContext?.custom?.alt ?? options.resourceTitle,
  }
}

export function buildResourcePdfObjectKey(options: { resourceSlug: string; driveFileId: string; fileName: string }) {
  const safeName = slugifyStorageName(options.fileName, 'material')
  return `resources/${options.resourceSlug}/files/${options.driveFileId}/${safeName}`
}

export function buildResourceVideoPublicId(options: { resourceSlug: string; fileName: string }) {
  const safeName = slugifyStorageName(stripExtension(options.fileName), 'video')
  return `resources/${options.resourceSlug}/videos/${safeName}`
}

export function buildResourceThumbPublicId(options: { resourceSlug: string }) {
  return `resources/${options.resourceSlug}/thumb`
}

function pickPreviewPages(total: number): number[] {
  if (total <= 0) return []

  // Mais agressivo: Para materiais ricos, queremos mostrar até 8 imagens.
  if (total < 12) {
    if (total <= 8) return Array.from({ length: total }, (_, i) => i + 1)
    return uniquePages([1, 2, 3, 4, 6, 8, total - 1, total].filter(p => p <= total))
  }

  // Para documentos grandes, pegamos uma amostra bem distribuída
  const firstAllowedPage = 1 // Inicia na 1 para materiais pequenos, mas vamos manter a lógica de pular se for muito grande?
  // Na verdade, materiais de professores geralmente a capa é importante.
  
  const step = Math.floor(total / 8)
  const candidates = [
    1,
    2,
    3,
    1 + step,
    1 + 2 * step,
    1 + 3 * step,
    total - 1,
    total,
  ]

  return uniquePages(candidates.filter((page) => page >= 1 && page <= total))
}


function uniquePages(pages: number[]): number[] {
  return Array.from(new Set(pages)).sort((a, b) => a - b)
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
  resourceSlug?: string
  publicId?: string
  altText?: string
}) {
  const folder = options.resourceSlug
    ? `resources/${options.resourceSlug}/images`
    : `resources/images/${options.resourceId}`

  const upload = await uploadFromUrl(options.imageUrl, {
    folder: folder,
    publicId: options.publicId ?? 'cover',
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
