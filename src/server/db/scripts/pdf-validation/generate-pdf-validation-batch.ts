import 'dotenv/config'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { prisma } from '@/lib/db'
import {
  buildChunkCustomId,
  PDF_VALIDATE_MODEL,
  PDF_VALIDATE_PROMPT_VERSION,
  responseSchema,
} from './shared'

const CHUNK_SIZE = 18000

function chunkText(value: string, size: number) {
  const chunks: string[] = []
  let start = 0
  while (start < value.length) {
    chunks.push(value.slice(start, start + size))
    start += size
  }
  return chunks
}

async function main() {
  const rawLimit = process.argv[2]
  const limitArg = Number(rawLimit ?? '0')
  const limit = rawLimit && Number.isFinite(limitArg) && limitArg > 0 ? Math.floor(limitArg) : undefined

  const docs = await prisma.pdfKnowledgeDocument.findMany({
    where: { sourceType: 'RESOURCE_FILE' },
    orderBy: { updatedAt: 'desc' },
    take: limit,
    select: { id: true, pdfName: true, contentMarkdown: true },
  })

  const lines: string[] = []
  for (const doc of docs) {
    const chunks = chunkText(doc.contentMarkdown, CHUNK_SIZE)
    const chunkCount = chunks.length
    for (let i = 0; i < chunkCount; i++) {
      lines.push(
        JSON.stringify({
          custom_id: buildChunkCustomId(doc.id, i, chunkCount),
          method: 'POST',
          url: '/v1/chat/completions',
          body: {
            model: PDF_VALIDATE_MODEL,
            messages: [
              {
                role: 'system',
                content:
                  'Voce valida e normaliza markdown extraido de PDF. Preserve TODO o conteudo do trecho recebido, sem resumir. Responda apenas JSON valido no schema.',
              },
              {
                role: 'user',
                content: `Trecho ${i + 1} de ${chunkCount} do documento ${doc.pdfName}:\n\n${chunks[i]}`,
              },
            ],
            response_format: {
              type: 'json_schema',
              json_schema: {
                name: 'pdf_validation',
                strict: true,
                schema: responseSchema,
              },
            },
            temperature: 0,
            max_completion_tokens: 6000,
          },
        })
      )
    }
  }

  const fileName = `pdf_validation_batch_${Date.now()}.jsonl`
  fs.writeFileSync(path.join(process.cwd(), fileName), `${lines.join('\n')}\n`, 'utf8')
  console.log(`Batch gerado: ${fileName}`)
  console.log(`Itens: ${lines.length}`)
  console.log(`Prompt version: ${PDF_VALIDATE_PROMPT_VERSION}`)
}

main().catch((err) => { console.error(err); process.exit(1) }).finally(async () => { await prisma.$disconnect() })
