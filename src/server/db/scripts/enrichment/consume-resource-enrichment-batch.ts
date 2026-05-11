import 'dotenv/config'
import OpenAI from 'openai'
import { prisma } from '@/lib/db'
import { getResourceIdFromCustomId } from './shared'

type PedagogicalPayload = {
  description: string
  objectives: string[]
  bnccCodes: string[]
  grades: string[]
  steps: Array<{ type: string; title: string; duration: string; content: string }>
}

async function applyResourceEnrichment(resourceId: string, payload: PedagogicalPayload) {
  const skillsInDb = await prisma.bnccSkill.findMany({
    where: { code: { in: payload.bnccCodes } },
    select: { id: true, code: true },
  })
  const uniqueSkillIds = Array.from(new Map(skillsInDb.map((s) => [s.code, s.id])).values())

  const allGrades = await prisma.grade.findMany({ select: { id: true, slug: true } })
  const gradesInDb = allGrades.filter((g) => payload.grades.includes(g.slug))

  await prisma.$transaction([
    prisma.resourceBnccSkill.deleteMany({ where: { resourceId } }),
    prisma.resourceGrade.deleteMany({ where: { resourceId } }),
    prisma.resourceObjective.deleteMany({ where: { resourceId } }),
    prisma.resourceStep.deleteMany({ where: { resourceId } }),
    prisma.resource.update({
      where: { id: resourceId },
      data: {
        description: payload.description,
        objectives: {
          create: payload.objectives.map((text, idx) => ({ order: idx + 1, text })),
        },
        steps: {
          create: payload.steps.map((step, idx) => ({
            order: idx + 1,
            type: step.type as
              | 'WARMUP'
              | 'DISTRIBUTION'
              | 'PRACTICE'
              | 'CONCLUSION'
              | 'DISCUSSION'
              | 'ACTIVITY'
              | 'REFLECTION',
            title: step.title,
            duration: step.duration,
            content: step.content,
          })),
        },
        bnccSkills: { create: uniqueSkillIds.map((id) => ({ bnccSkillId: id })) },
        grades: { create: gradesInDb.map((g) => ({ gradeId: g.id })) },
      },
    }),
  ])
}

async function main() {
  if (!process.env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY nao configurada')
  const batchId = process.argv[2]
  if (!batchId) throw new Error('Uso: ...consume-resource-enrichment-batch.ts <batchId>')

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

  const fileResponse = await openai.files.content(batch.output_file_id)
  const text = await fileResponse.text()
  const lines = text.split('\n').filter(Boolean)

  let ok = 0
  let fail = 0

  for (const line of lines) {
    try {
      const result = JSON.parse(line)
      const resourceId = getResourceIdFromCustomId(result.custom_id)

      const choice = result.response?.body?.choices?.[0]
      const content = choice?.message?.content
      if (!content) throw new Error('Resposta vazia')

      const parsed = JSON.parse(content) as PedagogicalPayload
      await applyResourceEnrichment(resourceId, parsed)
      ok += 1
    } catch (err) {
      fail += 1
      console.error(err)
    }
  }

  console.log(`Sucesso: ${ok}`)
  console.log(`Falhas: ${fail}`)
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
