import 'dotenv/config'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { prisma } from '../../../src/lib/db'
import OpenAI from 'openai'

type Subject = 'portugues' | 'matematica'
type Target = Subject | 'todos'

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function parseSubjectArg(): Target {
  const raw = (process.argv[2] ?? '').trim().toLowerCase()
  if (raw !== 'portugues' && raw !== 'matematica' && raw !== 'todos') {
    console.error(
      'Uso: npx tsx scripts/pdf/pdf-extractions/validate-with-llm.ts <portugues|matematica|todos> [limite]'
    )
    process.exit(1)
  }
  return raw
}

function parseLimitArg(): number {
  const raw = process.argv[3]
  if (!raw) return 20
  const n = Number(raw)
  if (!Number.isFinite(n) || n < 1) return 20
  return Math.floor(n)
}

async function main() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY nao configurada no ambiente')
  }

  const subject = parseSubjectArg()
  const limit = parseLimitArg()
  const whereBase =
    subject === 'todos'
      ? {
          sourceType: 'RESOURCE_FILE' as const,
        }
      : {
          sourceType: 'RESOURCE_FILE' as const,
          metadata: {
            path: ['hardcodedFilter', 'subject'],
            equals: subject,
          },
        }

  const docs = await prisma.pdfKnowledgeDocument.findMany({
    where: whereBase,
    orderBy: { updatedAt: 'desc' },
    take: limit,
  })

  if (docs.length === 0) {
    console.log('Nenhum documento encontrado para validacao LLM com esse filtro.')
    return
  }

  let ok = 0
  let fail = 0

  for (const doc of docs) {
    try {
      const response = await client.responses.create({
        model: 'gpt-4.1-mini',
        input: [
          {
            role: 'system',
            content: [
              {
                type: 'input_text',
                text: 'Voce valida texto extraido de PDF. Retorne JSON com: hasContent(boolean), quality(score 0..1), issues(string[]), cleanedMarkdown(string).',
              },
            ],
          },
          {
            role: 'user',
            content: [
              {
                type: 'input_text',
                text: doc.contentMarkdown.slice(0, 120000),
              },
            ],
          },
        ],
        text: {
          format: {
            type: 'json_schema',
            name: 'pdf_validation',
            schema: {
              type: 'object',
              additionalProperties: false,
              properties: {
                hasContent: { type: 'boolean' },
                quality: { type: 'number', minimum: 0, maximum: 1 },
                issues: { type: 'array', items: { type: 'string' } },
                cleanedMarkdown: { type: 'string' },
              },
              required: ['hasContent', 'quality', 'issues', 'cleanedMarkdown'],
            },
            strict: true,
          },
        },
      })

      const text = response.output_text
      const parsed = JSON.parse(text) as {
        hasContent: boolean
        quality: number
        issues: string[]
        cleanedMarkdown: string
      }

      const oldMetadata = (doc.metadata ?? {}) as Record<string, unknown>

      await prisma.pdfKnowledgeDocument.update({
        where: { id: doc.id },
        data: {
          metadata: {
            ...oldMetadata,
            llmValidation: {
              model: 'gpt-4.1-mini',
              ranAt: new Date().toISOString(),
              hasContent: parsed.hasContent,
              quality: parsed.quality,
              issues: parsed.issues,
            },
          },
          contentMarkdown: parsed.cleanedMarkdown,
        },
      })

      const subjectFromMetadata =
        subject === 'todos'
          ? ((doc.metadata as { hardcodedFilter?: { subject?: string } } | null)?.hardcodedFilter
              ?.subject ?? 'sem-categoria')
          : subject
      const baseName = slugify(path.basename(doc.pdfName, path.extname(doc.pdfName)))
      const outputDir = path.resolve(
        process.cwd(),
        `docs/resources/analysis/markdown_formatted/fundamental/${subjectFromMetadata}`
      )
      fs.mkdirSync(outputDir, { recursive: true })
      const formattedPath = path.join(outputDir, `${baseName}_formatted.md`)
      fs.writeFileSync(formattedPath, parsed.cleanedMarkdown, 'utf8')

      ok += 1
      console.log(`OK  ${doc.pdfName}`)
    } catch (error) {
      fail += 1
      console.error(`ERR ${doc.pdfName}`)
      console.error(error instanceof Error ? error.message : String(error))
    }
  }

  console.log('Resumo LLM:')
  console.log(`- Sucesso: ${ok}`)
  console.log(`- Erros:   ${fail}`)
}

main()
  .catch((error) => {
    console.error('Erro fatal:', error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
