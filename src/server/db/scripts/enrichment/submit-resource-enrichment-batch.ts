import 'dotenv/config'
import * as fs from 'node:fs'
import * as path from 'node:path'
import OpenAI from 'openai'

async function main() {
  if (!process.env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY nao configurada')

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

  const arg = process.argv[2]
  const files = fs
    .readdirSync(process.cwd())
    .filter((f) => f.startsWith('resource_enrichment_batch_') && f.endsWith('.jsonl'))
    .sort()
    .reverse()

  const fileName = arg ?? files[0]
  if (!fileName) throw new Error('Nenhum batch file encontrado')

  const filePath = path.join(process.cwd(), fileName)
  if (!fs.existsSync(filePath)) throw new Error(`Arquivo nao encontrado: ${filePath}`)

  const file = await openai.files.create({
    file: fs.createReadStream(filePath),
    purpose: 'batch',
  })

  const batch = await openai.batches.create({
    input_file_id: file.id,
    endpoint: '/v1/chat/completions',
    completion_window: '24h',
  })

  console.log(`File ID: ${file.id}`)
  console.log(`Batch ID: ${batch.id}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
