import fs from 'node:fs/promises'
import path from 'node:path'

export interface DownloadedDriveFile {
  buffer: Buffer
  fileName: string
  mimeType: string
}

/**
 * Lista IDs de arquivos dentro de uma pasta do Google Drive usando scraping da view pública.
 * Não requer API Key nem a biblioteca googleapis.
 */
export async function listDriveFileIds(folderId: string): Promise<{ id: string, name: string }[]> {
  try {
    const url = `https://drive.google.com/embeddedfolderview?id=${folderId}#list`
    const response = await fetch(url)
    
    if (!response.ok) {
      console.error(`❌ Erro HTTP ao acessar pasta ${folderId}: ${response.status}`)
      return []
    }

    const html = await response.text()
    const filesFromMarkup = parseEmbeddedFolderEntries(html)
    if (filesFromMarkup.length > 0) {
      return dedupeById(filesFromMarkup)
    }

    // Fallback para versão antiga da página, que expunha pares ["id","nome"] no HTML.
    const filesFromLegacy = parseLegacyJsonEntries(html)
    return dedupeById(filesFromLegacy)
  } catch (error) {
    console.error(`❌ Erro ao listar arquivos da pasta ${folderId} no Drive:`, error)
    return []
  }
}

function parseEmbeddedFolderEntries(html: string): { id: string; name: string }[] {
  const entries: { id: string; name: string }[] = []
  const entryRegex = /<a href="https:\/\/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]{20,})\/view[^"]*"[^>]*>[\s\S]*?<div class="flip-entry-title">([\s\S]*?)<\/div>/g

  for (const match of html.matchAll(entryRegex)) {
    const id = match[1]
    const rawTitle = match[2]
    if (!id || !rawTitle) continue
    const name = decodeHtmlEntities(rawTitle).trim()
    if (!name) continue
    entries.push({ id, name })
  }

  return entries
}

function parseLegacyJsonEntries(html: string): { id: string; name: string }[] {
  const entries: { id: string; name: string }[] = []
  const pattern = /\["(?![^"]*folder)([a-zA-Z0-9_-]{25,})","([^"]+)"/g

  for (const match of html.matchAll(pattern)) {
    const id = match[1]
    const rawName = match[2]
    if (!id || !rawName) continue
    entries.push({
      id,
      name: decodeHtmlEntities(rawName).trim(),
    })
  }

  return entries
}

function dedupeById(files: { id: string; name: string }[]) {
  const seen = new Set<string>()
  return files.filter((file) => {
    if (seen.has(file.id)) return false
    seen.add(file.id)
    return true
  })
}

/**
 * Faz o download de um arquivo do Google Drive lidando com confirmações de arquivos grandes.
 */
export async function downloadDriveFile(fileId: string): Promise<DownloadedDriveFile> {
  const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`
  const headers = {
    'user-agent': 'Wget/1.21.1', // UA de robô para pegar HTML mais simples
  }

  let response = await fetch(downloadUrl, { redirect: 'follow', headers })

  if (!response.ok) {
    throw new Error(`Falha no download inicial do Drive (status ${response.status})`)
  }

  // Se o Google devolver um HTML, provavelmente é a página de confirmação de vírus
  if (isHtmlResponse(response.headers.get('content-type'))) {
    const html = await response.text()
    const confirmUrl = extractDriveConfirmUrl(html)

    if (!confirmUrl) {
      // Salvar para debug se falhar
      await fs.writeFile(path.join(process.cwd(), 'debug-google-response.html'), html)
      throw new Error(`Google Drive exigiu confirmação mas não foi possível extrair o link automaticamente. Debug salvo em debug-google-response.html`)
    }

    let finalUrl = confirmUrl
    if (confirmUrl.startsWith('TOKEN:')) {
      const token = confirmUrl.replace('TOKEN:', '')
      finalUrl = `${downloadUrl}&confirm=${token}`
    }

    response = await fetch(finalUrl, { redirect: 'follow', headers })

    if (!response.ok || isHtmlResponse(response.headers.get('content-type'))) {
      throw new Error(`Falha no download após confirmação (status ${response.status})`)
    }
  }

  const contentDisposition = response.headers.get('content-disposition')
  const fileName = extractFileName(contentDisposition) || `file-${fileId}`
  const rawMimeType = response.headers.get('content-type') || 'application/octet-stream'
  const arrayBuffer = await response.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  const mimeType = normalizeMimeType(rawMimeType, fileName, buffer)

  return {
    buffer,
    fileName,
    mimeType,
  }
}

function normalizeMimeType(rawMimeType: string, fileName: string, buffer: Buffer): string {
  const mimeType = rawMimeType.split(';')[0]?.trim().toLowerCase() || 'application/octet-stream'
  if (mimeType !== 'application/octet-stream' && mimeType !== 'application/binary') {
    return mimeType
  }

  if (buffer.byteLength >= 5 && buffer.subarray(0, 5).toString('utf8') === '%PDF-') {
    return 'application/pdf'
  }

  const extension = fileName.split('.').pop()?.toLowerCase()
  if (!extension) return mimeType

  if (extension === 'pdf') return 'application/pdf'
  if (['mp4', 'mov', 'webm', 'avi', 'mkv', 'm4v'].includes(extension)) return `video/${extension === 'm4v' ? 'mp4' : extension}`
  if (extension === 'wmv') return 'video/x-ms-wmv'
  if (extension === 'flv') return 'video/x-flv'

  return mimeType
}

function isHtmlResponse(contentType: string | null): boolean {
  return (contentType ?? '').toLowerCase().includes('text/html')
}

function extractFileName(disposition: string | null): string | null {
  if (!disposition) return null
  const encodedRegex = /filename\*\s*=\s*UTF-8''([^;\n]+)/i
  const encodedMatch = encodedRegex.exec(disposition)
  if (encodedMatch?.[1]) {
    try {
      return decodeURIComponent(encodedMatch[1]).trim()
    } catch {
      return encodedMatch[1].trim()
    }
  }

  const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/i
  const matches = filenameRegex.exec(disposition)
  if (matches?.[1]) {
    const cleaned = matches[1].replace(/['"]/g, '').trim()
    return normalizeHeaderFileName(cleaned)
  }

  return null
}

function normalizeHeaderFileName(fileName: string): string {
  if (!/[ÃÂ]/.test(fileName)) return fileName

  try {
    const fixed = Buffer.from(fileName, 'latin1').toString('utf8')
    return fixed.trim() || fileName
  } catch {
    return fileName
  }
}

function extractDriveConfirmUrl(html: string): string | null {
  const decoded = html
    .replaceAll('\\u003d', '=')
    .replaceAll('\\u0026', '&')
    .replaceAll('\\u002F', '/')
    .replaceAll('\\/', '/')

  // 1. Tentar extrair do formulário de confirmação (Novo padrão com UUID)
  if (decoded.includes('id="download-form"')) {
    const params: string[] = []
    const inputMatches = decoded.matchAll(/<input type="hidden" name="([^"]+)" value="([^"]*)">/g)
    for (const match of inputMatches) {
      params.push(`${match[1]}=${match[2]}`)
    }
    
    if (params.length > 0) {
      const baseUrl = decoded.match(/action="([^"]+)"/)?.[1] || 'https://drive.usercontent.google.com/download'
      return `${baseUrl}?${params.join('&')}`
    }
  }

  // 2. Tentar extrair do link clássico de confirmação
  const confirmLinkMatch = decoded.match(/href="([^"]+confirm=([^"&]+)[^"]+)"/)
  if (confirmLinkMatch?.[1]) {
    let url = confirmLinkMatch[1]
    if (url.startsWith('/')) {
      url = `https://drive.google.com${url}`
    }
    return decodeHtmlEntities(url)
  }

  // 3. Tentar extrair do JSON ou Scripts (Padrão novo)
  const jsonMatch = decoded.match(/"downloadUrl"\s*:\s*"(https:\/\/[^"]+)"/)
  if (jsonMatch?.[1]) {
    return decodeHtmlEntities(jsonMatch[1])
  }

  // 4. Fallback agressivo: procurar por qualquer token de confirmação
  const tokenMatch = decoded.match(/confirm=([a-zA-Z0-9_-]{1,12})/)
  if (tokenMatch?.[1]) {
    return `TOKEN:${tokenMatch[1]}`
  }

  return null
}

function decodeHtmlEntities(value: string): string {
  return value
    .replaceAll('&amp;', '&')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
}
