import { exec } from 'node:child_process'
import { promisify } from 'node:util'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { CLOUDINARY_VIDEO_MAX_BYTES } from './constants'

const execPromise = promisify(exec)

// Cache simples para evitar processar o mesmo vídeo em paralelo
const ongoingOptimizations = new Map<string, Promise<Buffer>>()

/**
 * Otimiza um buffer de vídeo usando FFmpeg se necessário.
 * Tenta manter o tamanho abaixo do limite recomendado (100MB).
 */
export async function optimizeVideo(buffer: Buffer, fileHint: string): Promise<Buffer> {
  const cacheKey = `${fileHint}-${buffer.byteLength}`
  
  if (ongoingOptimizations.has(cacheKey)) {
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
        console.error(`❌ FFmpeg não encontrado. O vídeo ${fileHint} não será otimizado.`)
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
      
      return await fs.readFile(outputPath)
    } catch (error) {
      console.warn(`⚠️  Falha ao otimizar vídeo ${fileHint}:`, error)
      return buffer
    } finally {
      await fs.rm(tempDir, { recursive: true, force: true }).catch(() => undefined)
      setTimeout(() => ongoingOptimizations.delete(cacheKey), 60000)
    }
  })()

  ongoingOptimizations.set(cacheKey, optimizationPromise)
  return optimizationPromise
}
