import 'dotenv/config'
import { PrismaClient } from '../prisma/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import { embedMany } from 'ai'
import { openai } from '@ai-sdk/openai'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

const prisma = new PrismaClient({
  adapter: new PrismaPg(pool),
})

function buildEmbeddingText(row: {
  code: string
  educationLevelSlug: string
  fieldOfExperience: string | null
  ageRange: string | null
  gradeSlug: string | null
  subjectSlug: string | null
  unitTheme: string | null
  knowledgeObject: string | null
  description: string
}) {
  const parts = [
    `Código: ${row.code}`,
    `Etapa: ${row.educationLevelSlug}`,
    row.gradeSlug ? `Ano: ${row.gradeSlug}` : null,
    row.subjectSlug ? `Componente: ${row.subjectSlug}` : null,
    row.fieldOfExperience ? `Campo de experiência: ${row.fieldOfExperience}` : null,
    row.ageRange ? `Faixa etária: ${row.ageRange}` : null,
    row.unitTheme ? `Unidade temática: ${row.unitTheme}` : null,
    row.knowledgeObject ? `Objeto de conhecimento: ${row.knowledgeObject}` : null,
    `Habilidade: ${row.description}`,
  ].filter(Boolean)

  return parts.join('\n')
}

async function main() {
  const BATCH = Number(process.env.EMBED_BATCH_SIZE ?? 100)
  const MODEL = process.env.EMBED_MODEL ?? 'text-embedding-3-small'
  const DELAY_MS = Number(process.env.EMBED_DELAY_MS ?? 1000) // Delay entre batches (evita rate limit)

  // Contar total de pendentes
  const totalPending = await prisma.bnccSkill.count({
    where: { embedding: null }
  })

  if (totalPending === 0) {
    console.log('✅ Nenhum embedding pendente. Tudo pronto!')
    return
  }

  // Estimativa de custo (text-embedding-3-small: $0.020/1M tokens)
  // Média: ~500 tokens por habilidade
  const estimatedTokens = totalPending * 500
  const estimatedCost = (estimatedTokens / 1_000_000) * 0.020

  console.log(`🔧 Backfill de embeddings`)
  console.log(`   Modelo: ${MODEL}`)
  console.log(`   Batch size: ${BATCH}`)
  console.log(`   Delay entre batches: ${DELAY_MS}ms`)
  console.log(``)
  console.log(`📊 Pendentes: ${totalPending} habilidades`)
  console.log(`💰 Custo estimado: ~$${estimatedCost.toFixed(4)} (${estimatedTokens.toLocaleString()} tokens)`)
  console.log(`⏱️  Tempo estimado: ~${Math.ceil(totalPending / BATCH)} batches × ${DELAY_MS}ms`)
  console.log(``)

  let processed = 0
  let batchNumber = 0

  while (true) {
    const rows = await prisma.bnccSkill.findMany({
      where: { embedding: null },
      select: {
        id: true,
        code: true,
        educationLevelSlug: true,
        fieldOfExperience: true,
        ageRange: true,
        gradeSlug: true,
        subjectSlug: true,
        unitTheme: true,
        knowledgeObject: true,
        description: true,
      },
      take: BATCH,
    })

    if (rows.length === 0) {
      console.log(``)
      console.log(`✅ Concluído! ${processed} embeddings gerados.`)
      break
    }

    batchNumber++
    const values = rows.map(buildEmbeddingText)

    // Gerar embeddings em batch
    const { embeddings } = await embedMany({
      model: openai.embedding(MODEL),
      values,
    })

    // Salvar cada embedding via SQL (Prisma não suporta vector nativamente)
    // pgvector aceita o literal: '[0.1,0.2,...]'
    let savedInBatch = 0
    for (let i = 0; i < rows.length; i++) {
      try {
        const vectorLiteral = `[${embeddings[i].join(',')}]`

        await prisma.$executeRawUnsafe(
          `UPDATE "bncc_skill"
           SET "embedding" = $1::vector(1536),
               "updatedAt" = now()
           WHERE "id" = $2`,
          vectorLiteral,
          rows[i].id,
        )
        savedInBatch++
      } catch (error) {
        console.error(`   ❌ Erro ao salvar embedding ${rows[i].code}:`, error)
        // Continua com os próximos
      }
    }

    processed += savedInBatch
    const percentage = ((processed / totalPending) * 100).toFixed(1)
    const remaining = totalPending - processed

    console.log(`Batch #${batchNumber}: ${savedInBatch}/${rows.length} salvos | Progresso: ${processed}/${totalPending} (${percentage}%) | Restam: ${remaining}`)

    // Delay entre batches (evita rate limit da OpenAI)
    if (remaining > 0) {
      await new Promise(resolve => setTimeout(resolve, DELAY_MS))
    }
  }
}

main()
  .catch((e) => {
    console.error('❌ Erro fatal no backfill:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    console.log('🔌 Conexão com o banco de dados encerrada.')
  })
