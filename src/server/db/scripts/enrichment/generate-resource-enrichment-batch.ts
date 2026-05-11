import 'dotenv/config'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { prisma } from '@/lib/db'
import { buildPrompt, CUSTOM_ID_PREFIX, ENRICH_MODEL, ENRICH_PROMPT_VERSION, responseSchema } from './shared'

const MAX_MARKDOWN_CHARS = 60000

async function main() {
  const limitArg = Number(process.argv[2] ?? '0')
  const limit = Number.isFinite(limitArg) && limitArg > 0 ? Math.floor(limitArg) : undefined

  const resources = await prisma.resource.findMany({
    where: { archivedAt: null },
    include: { subject: true, educationLevel: true },
    take: limit,
    orderBy: { createdAt: 'desc' },
  })

  const allGrades = await prisma.grade.findMany({ select: { slug: true } })
  const gradeSlugs = allGrades.map((g) => g.slug)

  const lines: string[] = []
  for (const resource of resources) {
    const knowledgeDoc = await prisma.pdfKnowledgeDocument.findFirst({
      where: { resourceId: resource.id },
      orderBy: { updatedAt: 'desc' },
      select: { contentMarkdown: true },
    })
    const materialMarkdown =
      (knowledgeDoc?.contentMarkdown?.slice(0, MAX_MARKDOWN_CHARS) ?? '').trim() ||
      'Sem material markdown extraido.'

    const body = {
      model: ENRICH_MODEL,
      messages: [
        {
          role: 'system',
          content:
            'Voce e um especialista pedagogico senior. Responda somente JSON valido conforme schema. Nao use markdown fora do JSON. Seja rigoroso com BNCC e coerencia didatica.',
        },
        {
          role: 'user',
          content: buildPrompt({
            title: resource.title,
            subjectName: resource.subject?.name ?? 'Geral',
            educationLevelName: resource.educationLevel?.name ?? 'Geral',
            availableGrades: gradeSlugs,
            materialMarkdown,
          }),
        },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'resource_enrichment',
          strict: true,
          schema: responseSchema,
        },
      },
      temperature: 0.2,
      max_completion_tokens: 2200,
    }

    lines.push(
      JSON.stringify({
        custom_id: `${CUSTOM_ID_PREFIX}${resource.id}`,
        method: 'POST',
        url: '/v1/chat/completions',
        body,
      })
    )
  }

  const fileName = `resource_enrichment_batch_${Date.now()}.jsonl`
  const filePath = path.join(process.cwd(), fileName)
  fs.writeFileSync(filePath, `${lines.join('\n')}\n`, 'utf8')

  console.log(`Batch gerado: ${fileName}`)
  console.log(`Itens: ${lines.length}`)
  console.log(`Prompt version: ${ENRICH_PROMPT_VERSION}`)
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
