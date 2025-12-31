import { supabase } from '@/lib/supabase'

const BUCKET_NAME = 'resources'

export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'image/jpeg',
  'image/png',
  'image/webp',
  'video/mp4',
  'video/webm',
  'audio/mpeg',
  'audio/wav',
]

export const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB

export async function validateFile(file: File): Promise<{ valid: boolean; error?: string }> {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Tipo de arquivo não permitido: ${file.type}. Tipos permitidos: PDF, Office, imagens, vídeos, áudio`,
    }
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `Arquivo muito grande. Tamanho máximo: 50MB. Seu arquivo: ${(file.size / 1024 / 1024).toFixed(2)}MB`,
    }
  }

  return { valid: true }
}

export async function uploadFile(file: File): Promise<string> {
  // Validar arquivo
  const validation = await validateFile(file)
  if (!validation.valid) {
    throw new Error(validation.error)
  }

  // Gerar nome único
  const fileExt = file.name.split('.').pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
  const filePath = `files/${fileName}`

  // Upload para Supabase Storage
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) {
    throw new Error(`Erro ao fazer upload: ${error.message}`)
  }

  // Obter URL pública
  const { data: publicUrlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath)

  return publicUrlData.publicUrl
}

export async function deleteFile(filePath: string): Promise<void> {
  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([filePath])

  if (error) {
    throw new Error(`Erro ao deletar arquivo: ${error.message}`)
  }
}

export function getFilePathFromUrl(url: string): string {
  // Extract path from Supabase URL
  // URL format: https://xxx.supabase.co/storage/v1/object/public/resources/files/xxx.pdf
  const match = url.match(/\/storage\/v1\/object\/public\/resources\/(.+)$/)
  return match ? match[1] : url
}
