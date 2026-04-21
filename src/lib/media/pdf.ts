import { exec } from 'node:child_process'
import { promisify } from 'node:util'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

const execPromise = promisify(exec)

/**
 * Otimiza PDF usando QPDF (Linearização) ou Ghostscript básico.
 * Linearização é instantânea e ideal para web view.
 */
export async function optimizePdf(buffer: Buffer, fileHint: string): Promise<Buffer> {
  // Apenas tenta otimizar se for maior que 1MB (linearização ainda vale a pena)
  if (buffer.byteLength < 1 * 1024 * 1024) {
    return buffer
  }

  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'pdf-opt-'))
  const inputPath = path.join(tempDir, 'input.pdf')
  const outputPath = path.join(tempDir, 'output.pdf')

  try {
    await fs.writeFile(inputPath, buffer)

    // Tentar QPDF primeiro (Linearização é quase instantânea)
    try {
      await execPromise(`qpdf --linearize "${inputPath}" "${outputPath}"`)
    } catch {
      // Se falhar qpdf, Ghostscript rápido (reorganiza o arquivo sem re-processar imagens pesado)
      try {
        let gsPath = 'gs'
        try { await execPromise('gs -version') } catch { gsPath = '/opt/homebrew/bin/gs' }
        
        await execPromise(`${gsPath} -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dNOPAUSE -dQUIET -dBATCH -sOutputFile="${outputPath}" "${inputPath}"`)
      } catch {
        return buffer
      }
    }

    const optimized = await fs.readFile(outputPath)
    return optimized
  } catch (error) {
    console.warn(`⚠️  Erro na otimização do PDF ${fileHint}:`, error)
    return buffer
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true }).catch(() => undefined)
  }
}

/**
 * Extrai páginas específicas de um PDF localmente usando Ghostscript.
 * Retorna um array de buffers (JPEG).
 */
export async function extractPdfPages(
  buffer: Buffer,
  pages: number[],
  fileHint: string
): Promise<Buffer[]> {
  if (pages.length === 0) return []

  let gsPath = 'gs'
  try {
    await execPromise('gs -version')
  } catch (e) {
    try {
      await execPromise('/opt/homebrew/bin/gs -version')
      gsPath = '/opt/homebrew/bin/gs'
    } catch {
      throw new Error('Ghostscript não encontrado para extração local de páginas.')
    }
  }

  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'pdf-extract-'))
  const inputPath = path.join(tempDir, 'input.pdf')
  
  try {
    await fs.writeFile(inputPath, buffer)
    const images: Buffer[] = []

    for (const page of pages) {
      const outputPath = path.join(tempDir, `page-${page}.jpg`)
      // -r150: Resolução equilibrada
      await execPromise(
        `${gsPath} -sDEVICE=jpeg -dFirstPage=${page} -dLastPage=${page} -r150 -dJPEGQuality=85 -dNOPAUSE -dQUIET -dBATCH -sOutputFile="${outputPath}" "${inputPath}"`
      )

      if (await fs.access(outputPath).then(() => true).catch(() => false)) {
        images.push(await fs.readFile(outputPath))
      }
    }

    return images
  } catch (error) {
    console.error(`❌ Falha ao extrair páginas do PDF ${fileHint}:`, error)
    throw error
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true }).catch(() => undefined)
  }
}
