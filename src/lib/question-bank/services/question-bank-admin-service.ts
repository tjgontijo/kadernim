import { prisma } from '@/lib/db'

export async function listQuestionBankStatusCounts() {
  const grouped = await prisma.questionBankQuestion.groupBy({
    by: ['status'],
    _count: { _all: true },
  })

  return grouped.map((row) => ({
    status: row.status,
    count: row._count._all,
  }))
}

export async function updateQuestionBankQuestionStatus(
  questionId: string,
  status: 'DRAFT_AI' | 'APPROVED_AI' | 'APPROVED_TEACHER' | 'FLAGGED' | 'REJECTED' | 'ARCHIVED',
  approvedById?: string
) {
  return prisma.questionBankQuestion.update({
    where: { id: questionId },
    data: {
      status,
      approvedById: approvedById ?? null,
      approvedAt: status === 'APPROVED_AI' || status === 'APPROVED_TEACHER' ? new Date() : null,
    },
  })
}
