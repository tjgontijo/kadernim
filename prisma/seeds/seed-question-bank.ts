import type { PrismaClient } from '@db/client'
import { QUESTION_BANK_SOURCE_SEEDS, QUESTION_BANK_TYPE_SEEDS } from '@/lib/question-bank/types'

export async function seedQuestionBankLookupTables(prisma: PrismaClient) {
  await Promise.all(
    QUESTION_BANK_TYPE_SEEDS.map((item) =>
      prisma.questionBankQuestionType.upsert({
        where: { code: item.code },
        create: {
          code: item.code,
          name: item.name,
          description: item.description ?? null,
          sortOrder: item.sortOrder ?? 0,
          isActive: item.isActive ?? true,
        },
        update: {
          name: item.name,
          description: item.description ?? null,
          sortOrder: item.sortOrder ?? 0,
          isActive: item.isActive ?? true,
        },
      })
    )
  )

  await Promise.all(
    QUESTION_BANK_SOURCE_SEEDS.map((item) =>
      prisma.questionBankSource.upsert({
        where: { code: item.code },
        create: {
          code: item.code,
          name: item.name,
          description: item.description ?? null,
          sortOrder: item.sortOrder ?? 0,
          isActive: item.isActive ?? true,
          appliesToQuestions: item.code !== 'reused',
          appliesToRequestItems: true,
        },
        update: {
          name: item.name,
          description: item.description ?? null,
          sortOrder: item.sortOrder ?? 0,
          isActive: item.isActive ?? true,
          appliesToQuestions: item.code !== 'reused',
          appliesToRequestItems: true,
        },
      })
    )
  )
}
