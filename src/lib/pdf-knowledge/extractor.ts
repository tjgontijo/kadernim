import { execFileSync } from 'node:child_process'
import * as path from 'node:path'

export const PDF_EXTRACTOR_VERSION = 'gs-txtwrite-v2'

export interface ExtractedPdfPage {
  page: number
  rawText: string
  cleanText: string
}

export interface ExtractedPdfDocument {
  title: string
  pageCount: number
  pages: ExtractedPdfPage[]
  rawText: string
  cleanText: string
  markdown: string
}

function escapePostScriptString(value: string) {
  return value.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)')
}

function runGs(args: string[]) {
  return execFileSync('gs', args, {
    encoding: 'utf8',
    maxBuffer: 1024 * 1024 * 30,
  })
}

export function getPdfPageCount(pdfPath: string) {
  const escapedPath = escapePostScriptString(pdfPath)
  const output = runGs([
    '-q',
    '-dNOSAFER',
    '-dNODISPLAY',
    '-c',
    `(${escapedPath}) (r) file runpdfbegin pdfpagecount = quit`,
  ])

  const pageCount = Number(output.trim())
  if (!Number.isFinite(pageCount) || pageCount < 1) {
    throw new Error(`Nao foi possivel ler total de paginas do PDF: ${pdfPath}`)
  }
  return pageCount
}

function normalizeInlineSpaces(line: string) {
  return line
    .replace(/\t/g, ' ')
    .replace(/[ ]{2,}/g, ' ')
    .trim()
}

function postProcessLines(lines: string[]) {
  const result: string[] = []

  for (const currentLine of lines) {
    if (result.length === 0) {
      result.push(currentLine)
      continue
    }

    const prev = result[result.length - 1]
    if (
      prev.endsWith('-') &&
      currentLine.length > 0 &&
      /^[A-ZÁÀÂÃÉÊÍÓÔÕÚÇ]/.test(currentLine)
    ) {
      result[result.length - 1] = `${prev}${currentLine}`
      continue
    }

    result.push(currentLine)
  }

  return result
}

function normalizePageText(rawText: string) {
  const lines = rawText
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => normalizeInlineSpaces(line))

  const compacted = postProcessLines(lines)
  const cleaned = compacted
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+\n/g, '\n')
    .trim()

  return cleaned
}

function extractRawPageText(pdfPath: string, page: number) {
  return runGs([
    '-q',
    '-dNOSAFER',
    '-dSAFER',
    '-dBATCH',
    '-dNOPAUSE',
    '-sDEVICE=txtwrite',
    `-dFirstPage=${page}`,
    `-dLastPage=${page}`,
    '-o',
    '-',
    pdfPath,
  ]).trim()
}

function toTitleFromFileName(filePath: string) {
  const base = path.basename(filePath, path.extname(filePath))
  return base.replace(/[_-]+/g, ' ').trim()
}

function pageTextToMarkdown(text: string) {
  return text
    .split('\n')
    .map((line) => (line.length > 0 ? `${line}  ` : ''))
    .join('\n')
}

export function buildMarkdown(params: {
  title: string
  relativePath: string
  pageCount: number
  pages: ExtractedPdfPage[]
}) {
  const lines: string[] = []

  lines.push(`# ${params.title}`)
  lines.push('')
  lines.push(`- Arquivo: \`${params.relativePath}\``)
  lines.push(`- Total de paginas: **${params.pageCount}**`)
  lines.push(`- Extrator: \`${PDF_EXTRACTOR_VERSION}\``)
  lines.push('')
  lines.push('---')
  lines.push('')

  for (const page of params.pages) {
    lines.push(`## Pagina ${page.page}`)
    lines.push('')
    if (page.cleanText.length === 0) {
      lines.push('_Sem texto extraivel nesta pagina._')
    } else {
      lines.push(pageTextToMarkdown(page.cleanText))
    }
    lines.push('')
  }

  return `${lines.join('\n').trimEnd()}\n`
}

export function extractPdfDocument(pdfPath: string, baseDir: string): ExtractedPdfDocument {
  const pageCount = getPdfPageCount(pdfPath)
  const pages: ExtractedPdfPage[] = []

  for (let page = 1; page <= pageCount; page++) {
    const rawText = extractRawPageText(pdfPath, page)
    const cleanText = normalizePageText(rawText)
    pages.push({ page, rawText, cleanText })
  }

  const title = toTitleFromFileName(pdfPath)
  const relativePath = path.relative(baseDir, pdfPath)
  const markdown = buildMarkdown({
    title,
    relativePath,
    pageCount,
    pages,
  })

  return {
    title,
    pageCount,
    pages,
    rawText: pages.map((page) => `## Pagina ${page.page}\n${page.rawText}`).join('\n\n'),
    cleanText: pages.map((page) => `## Pagina ${page.page}\n${page.cleanText}`).join('\n\n'),
    markdown,
  }
}
