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
    
    // Regex para capturar ID e Nome no JSON da view embutida
    // O padrão observado é ["id", "nome", ...]
    const pattern = /\["(?![^"]*folder)([a-zA-Z0-9_-]{25,})","([^"]+)"/g
    const matches = Array.from(html.matchAll(pattern))
    
    const files = matches.map(m => ({
      id: m[1],
      name: m[2]
    }))

    // Filtro básico para evitar duplicatas e IDs inválidos
    const seen = new Set()
    return files.filter(f => {
      if (seen.has(f.id)) return false
      seen.add(f.id)
      return true
    })
  } catch (error) {
    console.error(`❌ Erro ao listar arquivos da pasta ${folderId} no Drive:`, error)
    return []
  }
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
  const mimeType = response.headers.get('content-type') || 'application/octet-stream'
  const arrayBuffer = await response.arrayBuffer()

  return {
    buffer: Buffer.from(arrayBuffer),
    fileName,
    mimeType,
  }
}

function isHtmlResponse(contentType: string | null): boolean {
  return (contentType ?? '').toLowerCase().includes('text/html')
}

function extractFileName(disposition: string | null): string | null {
  if (!disposition) return null
  const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
  const matches = filenameRegex.exec(disposition)
  if (matches?.[1]) {
    return matches[1].replace(/['"]/g, '')
  }
  return null
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
