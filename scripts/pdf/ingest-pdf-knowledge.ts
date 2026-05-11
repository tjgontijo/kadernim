import 'dotenv/config'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { createHash } from 'node:crypto'
import { prisma } from '../../src/lib/db'
import { extractPdfDocument, PDF_EXTRACTOR_VERSION } from '../../src/lib/pdf-knowledge/extractor'

function collectPdfFiles(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  const files: string[] = []

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      if (entry.name === 'analysis' || entry.name === 'mockups') continue
      files.push(...collectPdfFiles(fullPath))
      continue
    }

    if (entry.isFile() && entry.name.toLowerCase().endsWith('.pdf')) {
      files.push(fullPath)
    }
  }

  return files
}

function toResourceNameFromFile(filePath: string) {
  const base = path.basename(filePath, path.extname(filePath))
  return base
    .replace(/_compressed$/i, '')
    .replace(/[_-]+/g, ' ')
    .trim()
}

function sha256(input: string) {
  return createHash('sha256').update(input).digest('hex')
}

async function main() {
  const rootArg = process.argv[2] ?? 'docs/resources'
  const rootDir = path.resolve(process.cwd(), rootArg)

  if (!fs.existsSync(rootDir)) {
    throw new Error(`Diretorio nao encontrado: ${rootDir}`)
  }

  const pdfPaths = collectPdfFiles(rootDir)
  console.log(`📚 PDFs encontrados: ${pdfPaths.length}`)

  let processed = 0
  let failed = 0

  for (const pdfPath of pdfPaths) {
    const relativePath = path.relative(process.cwd(), pdfPath)
    process.stdout.write(`\n→ Extraindo: ${relativePath}\n`)

    try {
      const extracted = extractPdfDocument(pdfPath, process.cwd())
      const markdownHash = sha256(extracted.markdown)
      const sourceKey = relativePath

      const stat = fs.statSync(pdfPath)

      await prisma.pdfKnowledgeDocument.upsert({
        where: {
          sourceType_sourceKey: {
            sourceType: 'LOCAL_FILE',
            sourceKey,
          },
        },
        update: {
          sourcePath: relativePath,
          resourceName: toResourceNameFromFile(pdfPath),
          pdfName: path.basename(pdfPath),
          pageCount: extracted.pageCount,
          extractorVersion: PDF_EXTRACTOR_VERSION,
          contentHash: markdownHash,
          contentMarkdown: extracted.markdown,
          contentRaw: extracted.cleanText,
          metadata: {
            title: extracted.title,
            bytes: stat.size,
            pages: extracted.pages.length,
          },
          extractedAt: new Date(),
        },
        create: {
          sourceType: 'LOCAL_FILE',
          sourceKey,
          sourcePath: relativePath,
          resourceName: toResourceNameFromFile(pdfPath),
          pdfName: path.basename(pdfPath),
          pageCount: extracted.pageCount,
          extractorVersion: PDF_EXTRACTOR_VERSION,
          contentHash: markdownHash,
          contentMarkdown: extracted.markdown,
          contentRaw: extracted.cleanText,
          metadata: {
            title: extracted.title,
            bytes: stat.size,
            pages: extracted.pages.length,
          },
        },
      })

      processed += 1
      process.stdout.write(`  ✅ OK (${extracted.pageCount} pags)\n`)
    } catch (error) {
      failed += 1
      process.stdout.write(
        `  ❌ Falhou: ${error instanceof Error ? error.message : String(error)}\n`
      )
    }
  }

  console.log(`\nResumo:`)
  console.log(`- Processados: ${processed}`)
  console.log(`- Falhas: ${failed}`)
}

main()
  .catch((error) => {
    console.error('Erro fatal:', error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
