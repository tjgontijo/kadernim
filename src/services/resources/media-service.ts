import { exec } from 'node:child_process'
import { promisify } from 'node:util'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

const execPromise = promisify(exec)

export const CLOUDINARY_RAW_MAX_BYTES = 10_000_000 // 10MB
export const CLOUDINARY_VIDEO_MAX_BYTES = 100_000_000 // 100MB

/**
 * Otimiza um buffer de vídeo usando FFmpeg se necessário.
 * Tenta manter o tamanho abaixo do limite do Cloudinary (100MB).
 */
// Cache simples para evitar processar o mesmo vídeo em paralelo
const ongoingOptimizations = new Map<string, Promise<Buffer>>()

export async function optimizeVideo(buffer: Buffer, fileHint: string): Promise<Buffer> {
  const cacheKey = `${fileHint}-${buffer.byteLength}`
  
  if (ongoingOptimizations.has(cacheKey)) {
    console.log(`⏳ Aguardando otimização já em curso para: ${fileHint}`)
    return ongoingOptimizations.get(cacheKey)!
  }

  const optimizationPromise = (async () => {
    // Se o buffer já for pequeno o suficiente, não faz nada
    if (buffer.byteLength <= CLOUDINARY_VIDEO_MAX_BYTES * 0.9) {
      return buffer
    }

    let ffmpegPath = 'ffmpeg'
    try {
      await execPromise('ffmpeg -version')
    } catch (e) {
      try {
        await execPromise('/opt/homebrew/bin/ffmpeg -version')
        ffmpegPath = '/opt/homebrew/bin/ffmpeg'
      } catch {
        console.error(`❌ FFmpeg não encontrado. O vídeo de ${(buffer.byteLength / 1024 / 1024).toFixed(1)}MB não será otimizado.`)
        return buffer
      }
    }

    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'video-opt-'))
    const inputPath = path.join(tempDir, 'input.mp4')
    const outputPath = path.join(tempDir, 'output.mp4')
    
    try {
      await fs.writeFile(inputPath, buffer)
      console.log(`🎬 Otimizando vídeo ${fileHint} (${(buffer.byteLength / 1024 / 1024).toFixed(1)}MB)...`)
      
      // CRF 28 + Limit bitrate to stay under 100MB
      await execPromise(`${ffmpegPath} -y -i "${inputPath}" -vcodec libx264 -crf 28 -preset faster -maxrate 1.5M -bufsize 3M -acodec aac -b:a 128k "${outputPath}"`)
      
      const optimized = await fs.readFile(outputPath)
      const newSizeMB = (optimized.byteLength / 1024 / 1024).toFixed(1)
      console.log(`✅ Vídeo otimizado: ${newSizeMB}MB (era ${(buffer.byteLength / 1024 / 1024).toFixed(1)}MB)`)
      
      return optimized
    } catch (error) {
      console.warn(`⚠️  Falha ao otimizar vídeo ${fileHint}:`, error)
      return buffer
    } finally {
      await fs.rm(tempDir, { recursive: true, force: true }).catch(() => undefined)
      // Limpar o cache após algum tempo para não acumular buffers na RAM
      setTimeout(() => ongoingOptimizations.delete(cacheKey), 60000)
    }
  })()

  ongoingOptimizations.set(cacheKey, optimizationPromise)
  return optimizationPromise
}

/**
 * Otimiza PDF usando Ghostscript ou QPDF se disponíveis.
 */
export async function optimizePdf(buffer: Buffer, fileHint: string): Promise<Buffer> {
  // Apenas otimiza se for maior que 1MB
  if (buffer.byteLength < 1 * 1024 * 1024) {
    return buffer
  }

  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'pdf-opt-'))
  const inputPath = path.join(tempDir, 'input.pdf')
  const outputPath = path.join(tempDir, 'output.pdf')

  try {
    await fs.writeFile(inputPath, buffer)

    // Tentar Ghostscript primeiro (ênfase em reduzir para baixo de 10MB para o Cloudinary)
    try {
      await execPromise(`gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=/screen -dColorImageResolution=72 -dGrayImageResolution=72 -dMonoImageResolution=72 -dNOPAUSE -dQUIET -dBATCH -sOutputFile="${outputPath}" "${inputPath}"`)
    } catch {
      // Se falhar gs, tenta qpdf
      try {
        await execPromise(`qpdf --linearize "${inputPath}" "${outputPath}"`)
      } catch {
        return buffer
      }
    }

    const optimized = await fs.readFile(outputPath)
    if (optimized.byteLength >= buffer.byteLength) {
      return buffer
    }

    return optimized
  } catch (error) {
    console.warn(`⚠️  Erro na otimização do PDF ${fileHint}:`, error)
    return buffer
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true }).catch(() => undefined)
  }
}
