import 'dotenv/config'
import * as fs from 'node:fs'
import * as path from 'node:path'
import * as os from 'node:os'
import { createHash } from 'node:crypto'
import { prisma } from '../../../src/lib/db'
import { getFromR2 } from '../../../src/lib/storage/r2'
import { extractPdfDocument, PDF_EXTRACTOR_VERSION } from '../../../src/lib/pdf-knowledge/extractor'

type Subject = 'portugues' | 'matematica'

function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function sha256(input: string) {
  return createHash('sha256').update(input).digest('hex')
}

function toDbSubject(subject: Subject) {
  return subject === 'portugues' ? 'lingua-portuguesa' : 'matematica'
}

export async function runHardcodedR2Subject(subject: Subject) {
  const dbSubject = toDbSubject(subject)
  const outputDir = path.resolve(process.cwd(), `docs/resources/analysis/markdown/fundamental/${subject}`)
  fs.mkdirSync(outputDir, { recursive: true })

  const files = await prisma.resourceFile.findMany({
    where: {
      fileType: { contains: 'pdf' },
      resource: {
        educationLevel: { slug: { in: ['ensino-fundamental-1', 'ensino-fundamental-2'] } },
        subject: { slug: dbSubject },
      },
    },
    include: {
      resource: {
        select: { id: true, slug: true, title: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  if (files.length === 0) {
    console.log('Nenhum ResourceFile PDF encontrado no R2 para filtro hardcoded.')
    console.log(`- disciplina: ${subject}`)
    return
  }

  let ok = 0
  let fail = 0

  for (const file of files) {
    const key = file.cloudinaryPublicId
    if (!key) continue

    const tempPdfPath = path.join(os.tmpdir(), `kadernim-${file.id}.pdf`)

    try {
      const pdfBuffer = await getFromR2(key)
      fs.writeFileSync(tempPdfPath, pdfBuffer)

      const extracted = extractPdfDocument(tempPdfPath, process.cwd())
      const nameBase = slugify(file.name || file.resource?.title || file.id)
      const outPath = path.join(outputDir, `${nameBase}.md`)
      fs.writeFileSync(outPath, extracted.markdown, 'utf8')

      const sourceKey = `resource-file:${file.id}`
      const contentHash = sha256(extracted.markdown)

      await prisma.pdfKnowledgeDocument.upsert({
        where: {
          sourceType_sourceKey: {
            sourceType: 'RESOURCE_FILE',
            sourceKey,
          },
        },
        update: {
          sourcePath: key,
          resourceName: file.resource?.title ?? file.name,
          pdfName: file.name,
          resourceId: file.resourceId,
          resourceFileId: file.id,
          pageCount: extracted.pageCount,
          extractorVersion: PDF_EXTRACTOR_VERSION,
          contentHash,
          contentMarkdown: extracted.markdown,
          contentRaw: extracted.cleanText,
          metadata: {
            hardcodedFilter: { segment: 'fundamental', subject },
            r2Key: key,
          },
          extractedAt: new Date(),
        },
        create: {
          sourceType: 'RESOURCE_FILE',
          sourceKey,
          sourcePath: key,
          resourceName: file.resource?.title ?? file.name,
          pdfName: file.name,
          resourceId: file.resourceId,
          resourceFileId: file.id,
          pageCount: extracted.pageCount,
          extractorVersion: PDF_EXTRACTOR_VERSION,
          contentHash,
          contentMarkdown: extracted.markdown,
          contentRaw: extracted.cleanText,
          metadata: {
            hardcodedFilter: { segment: 'fundamental', subject },
            r2Key: key,
          },
        },
      })

      ok += 1
      console.log(`OK  ${file.name} -> ${path.relative(process.cwd(), outPath)}`)
    } catch (error) {
      fail += 1
      console.error(`ERR ${file.name}`)
      console.error(error instanceof Error ? error.message : String(error))
    } finally {
      fs.rmSync(tempPdfPath, { force: true })
    }
  }

  console.log('Resumo R2:')
  console.log(`- Sucesso: ${ok}`)
  console.log(`- Erros:   ${fail}`)

  await prisma.$disconnect()
}
