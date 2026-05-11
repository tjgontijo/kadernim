import 'dotenv/config'
import OpenAI from 'openai'
import { prisma } from '@/lib/db'
import { getDocIdFromCustomId, PDF_VALIDATE_CHUNK_SEPARATOR, PDF_VALIDATE_MODEL } from './shared'

type ValidationResult = {
  hasContent: boolean
  quality: number
  issues: string[]
  cleanedMarkdown: string
}

function sanitizeText(value: string) {
  return value.replace(/\u0000/g, '')
}

async function registerFailure(docId: string, errorMessage: string) {
  const current = await prisma.pdfKnowledgeDocument.findUnique({
    where: { id: docId },
    select: { metadata: true },
  })
  const oldMeta = (current?.metadata ?? {}) as Record<string, unknown>

  await prisma.pdfKnowledgeDocument.update({
    where: { id: docId },
    data: {
      metadata: {
        ...oldMeta,
        llmValidation: {
          model: PDF_VALIDATE_MODEL,
          ranAt: new Date().toISOString(),
          status: 'failed',
          error: errorMessage.slice(0, 1200),
        },
      },
    },
  })
}

async function main() {
  if (!process.env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY nao configurada')
  const batchId = process.argv[2]
  if (!batchId) throw new Error('Uso: ...consume-pdf-validation-batch.ts <batchId>')

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  const batch = await openai.batches.retrieve(batchId)
  if (batch.status !== 'completed') {
    console.log(`Batch ainda nao concluido. Status: ${batch.status}`)
    return
  }
  if (!batch.output_file_id) {
    console.log('Batch concluido sem output_file_id')
    return
  }

  const response = await openai.files.content(batch.output_file_id)
  const text = await response.text()
  const lines = text.split('\n').filter(Boolean)
  const chunkMap = new Map<string, { chunkCount: number; chunks: Map<number, ValidationResult>; issues: string[] }>()

  let ok = 0
  let fail = 0
  for (const line of lines) {
    try {
      const item = JSON.parse(line)
      const parsedCustomId = getDocIdFromCustomId(item.custom_id)
      const docId = parsedCustomId.docId
      const statusCode = item.response?.status_code as number | undefined
      if (statusCode !== 200) {
        const message = `status_code ${statusCode ?? 'unknown'} (chunk ${parsedCustomId.chunkIndex + 1}/${parsedCustomId.chunkCount})`
        await registerFailure(docId, message)
        fail += 1
        continue
      }

      const choice = item.response?.body?.choices?.[0]
      const finishReason = choice?.finish_reason as string | undefined
      if (finishReason === 'length') {
        await registerFailure(
          docId,
          `completion truncated (finish_reason=length) chunk ${parsedCustomId.chunkIndex + 1}/${parsedCustomId.chunkCount}`
        )
        fail += 1
        continue
      }

      const content = choice?.message?.content
      if (!content) {
        await registerFailure(docId, 'resposta vazia')
        fail += 1
        continue
      }

      let parsed: ValidationResult
      try {
        parsed = JSON.parse(content) as ValidationResult
      } catch (parseError) {
        await registerFailure(
          docId,
          `json_parse_error: ${parseError instanceof Error ? parseError.message : String(parseError)}`
        )
        fail += 1
        continue
      }

      const existing = chunkMap.get(docId) ?? {
        chunkCount: parsedCustomId.chunkCount,
        chunks: new Map<number, ValidationResult>(),
        issues: [],
      }
      existing.chunks.set(parsedCustomId.chunkIndex, parsed)
      existing.issues.push(...parsed.issues)
      chunkMap.set(docId, existing)
    } catch (err) {
      fail += 1
      console.error(err)
    }
  }

  for (const [docId, aggregate] of chunkMap.entries()) {
    if (aggregate.chunks.size !== aggregate.chunkCount) {
      await registerFailure(
        docId,
        `missing chunks (${aggregate.chunks.size}/${aggregate.chunkCount})`
      )
      fail += 1
      continue
    }

    const sorted = Array.from(aggregate.chunks.entries())
      .sort((a, b) => a[0] - b[0])
      .map((entry) => sanitizeText(entry[1].cleanedMarkdown))
    const joinedMarkdown = sorted.join(PDF_VALIDATE_CHUNK_SEPARATOR)
    const qualities = Array.from(aggregate.chunks.values()).map((chunk) => chunk.quality)
    const hasContent = Array.from(aggregate.chunks.values()).some((chunk) => chunk.hasContent)
    const qualityAvg =
      qualities.length > 0 ? qualities.reduce((acc, value) => acc + value, 0) / qualities.length : 0

    const current = await prisma.pdfKnowledgeDocument.findUnique({
      where: { id: docId },
      select: { metadata: true },
    })
    const oldMeta = (current?.metadata ?? {}) as Record<string, unknown>

    await prisma.pdfKnowledgeDocument.update({
      where: { id: docId },
      data: {
        contentMarkdown: joinedMarkdown,
        metadata: {
          ...oldMeta,
          llmValidation: {
            model: PDF_VALIDATE_MODEL,
            ranAt: new Date().toISOString(),
            status: 'ok',
            hasContent,
            quality: Number(qualityAvg.toFixed(3)),
            issues: Array.from(new Set(aggregate.issues)).slice(0, 20),
            chunkCount: aggregate.chunkCount,
          },
        },
      },
    })
    ok += 1
  }

  console.log(`Sucesso: ${ok}`)
  console.log(`Falhas: ${fail}`)
}

main().catch((err) => { console.error(err); process.exit(1) }).finally(async () => { await prisma.$disconnect() })
