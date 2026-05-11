import * as fs from 'node:fs'
import * as path from 'node:path'
import { createHash } from 'node:crypto'
import { prisma } from '../../../src/lib/db'
import { extractPdfDocument } from '../../../src/lib/pdf-knowledge/extractor'

type Subject = 'portugues' | 'matematica'

interface RunOptions {
  subject: Subject
  inputDir: string
  outputDir: string
}

function walkPdfFiles(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  const files: string[] = []

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...walkPdfFiles(fullPath))
      continue
    }

    if (entry.isFile() && /\.pdf$/i.test(entry.name)) {
      files.push(fullPath)
    }
  }

  return files
}

function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function isFundamentalPdf(filePath: string) {
  const normalized = slugify(filePath)
  return normalized.includes('fundamental')
}

function isSubjectPdf(filePath: string, subject: Subject) {
  const normalized = slugify(filePath)
  if (subject === 'portugues') {
    return normalized.includes('portugues') || normalized.includes('lingua-portuguesa')
  }
  return normalized.includes('matematica')
}

function sha256(input: string) {
  return createHash('sha256').update(input).digest('hex')
}

async function run(options: RunOptions) {
  if (!fs.existsSync(options.inputDir)) {
    throw new Error(`Diretorio de entrada nao encontrado: ${options.inputDir}`)
  }

  fs.mkdirSync(options.outputDir, { recursive: true })

  const allPdfs = walkPdfFiles(options.inputDir)
  const selected = allPdfs.filter(
    (filePath) => isFundamentalPdf(filePath) && isSubjectPdf(filePath, options.subject)
  )

  if (selected.length === 0) {
    console.log('Nenhum PDF encontrado com os filtros hardcoded:')
    console.log(`- segmento: fundamental`)
    console.log(`- disciplina: ${options.subject}`)
    console.log(`- pasta: ${options.inputDir}`)
    return
  }

  console.log(`PDFs encontrados: ${selected.length}`)

  let ok = 0
  let fail = 0

  for (const pdfPath of selected) {
    try {
      const extracted = extractPdfDocument(pdfPath, process.cwd())
      const fileName = `${slugify(path.basename(pdfPath, path.extname(pdfPath)))}.md`
      const outPath = path.join(options.outputDir, fileName)
      fs.writeFileSync(outPath, extracted.markdown, 'utf8')
      const relativePath = path.relative(process.cwd(), pdfPath)
      const stat = fs.statSync(pdfPath)
      const contentHash = sha256(extracted.markdown)

      await prisma.pdfKnowledgeDocument.upsert({
        where: {
          sourceType_sourceKey: {
            sourceType: 'LOCAL_FILE',
            sourceKey: relativePath,
          },
        },
        update: {
          sourcePath: relativePath,
          resourceName: path.basename(pdfPath, path.extname(pdfPath)),
          pdfName: path.basename(pdfPath),
          pageCount: extracted.pageCount,
          extractorVersion: 'gs-txtwrite-v2',
          contentHash,
          contentMarkdown: extracted.markdown,
          contentRaw: extracted.cleanText,
          metadata: {
            hardcodedFilter: {
              segment: 'fundamental',
              subject: options.subject,
            },
            title: extracted.title,
            bytes: stat.size,
            pages: extracted.pages.length,
          },
          extractedAt: new Date(),
        },
        create: {
          sourceType: 'LOCAL_FILE',
          sourceKey: relativePath,
          sourcePath: relativePath,
          resourceName: path.basename(pdfPath, path.extname(pdfPath)),
          pdfName: path.basename(pdfPath),
          pageCount: extracted.pageCount,
          extractorVersion: 'gs-txtwrite-v2',
          contentHash,
          contentMarkdown: extracted.markdown,
          contentRaw: extracted.cleanText,
          metadata: {
            hardcodedFilter: {
              segment: 'fundamental',
              subject: options.subject,
            },
            title: extracted.title,
            bytes: stat.size,
            pages: extracted.pages.length,
          },
        },
      })

      ok += 1
      console.log(`OK  ${path.relative(process.cwd(), pdfPath)} -> ${path.relative(process.cwd(), outPath)}`)
    } catch (error) {
      fail += 1
      console.error(`ERR ${path.relative(process.cwd(), pdfPath)}`)
      console.error(error instanceof Error ? error.message : String(error))
    }
  }

  console.log('Resumo:')
  console.log(`- Sucesso: ${ok}`)
  console.log(`- Erros:   ${fail}`)
}

function parseInputDirArg() {
  const inputArg = process.argv[2]
  if (!inputArg) {
    console.error('Uso: npx tsx <script> <diretorio-com-pdfs>')
    process.exit(1)
  }

  return path.resolve(process.cwd(), inputArg)
}

export function runHardcodedSubject(subject: Subject) {
  const inputDir = parseInputDirArg()
  const outputDir = path.resolve(
    process.cwd(),
    `docs/resources/analysis/markdown/fundamental/${subject}`
  )

  run({ subject, inputDir, outputDir })
    .catch((error) => {
      console.error(error instanceof Error ? error.message : String(error))
      process.exitCode = 1
    })
    .finally(async () => {
      await prisma.$disconnect()
    })
}
