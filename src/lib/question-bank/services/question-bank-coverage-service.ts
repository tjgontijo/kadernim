import { prisma } from '@/lib/db'

export async function getQuestionBankCoverageSnapshot() {
  const bySubjectAndGrade = await prisma.questionBankQuestion.groupBy({
    by: ['subjectId', 'gradeId'],
    where: {
      status: {
        in: ['APPROVED_AI', 'APPROVED_TEACHER'],
      },
      archivedAt: null,
    },
    _count: { _all: true },
  })

  return bySubjectAndGrade
}
