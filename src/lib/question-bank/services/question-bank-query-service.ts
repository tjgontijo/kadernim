import { prisma } from '@/lib/db'
import type { QuestionBankListFilter } from '@/lib/question-bank/schemas'

export async function listQuestionBankQuestions(filters: QuestionBankListFilter) {
  const where: any = {
    archivedAt: null,
  }

  if (filters.difficulty) where.difficulty = filters.difficulty
  if (filters.status) where.status = filters.status
  if (filters.questionTypeCode) where.questionType = { code: filters.questionTypeCode }
  if (filters.bnccSkillId) where.skills = { some: { bnccSkillId: filters.bnccSkillId } }
  if (filters.gradeSlug) where.grade = { slug: filters.gradeSlug }
  if (filters.subjectSlug) where.subject = { slug: filters.subjectSlug }

  const skip = (filters.page - 1) * filters.limit
  const take = filters.limit + 1

  const rows = await prisma.questionBankQuestion.findMany({
    where,
    skip,
    take,
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    include: {
      questionType: true,
      questionSource: true,
    },
  })

  const hasMore = rows.length > filters.limit
  const items = hasMore ? rows.slice(0, filters.limit) : rows

  return {
    items,
    pagination: {
      page: filters.page,
      limit: filters.limit,
      hasMore,
    },
  }
}
