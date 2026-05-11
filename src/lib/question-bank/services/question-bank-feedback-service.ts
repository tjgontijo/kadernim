import { prisma } from '@/lib/db'
import type { CreateQuestionBankFeedbackInput } from '@/lib/question-bank/schemas'

export async function createQuestionBankFeedback(params: {
  questionId: string
  userId: string
  input: CreateQuestionBankFeedbackInput
}) {
  const feedback = await prisma.questionBankFeedback.create({
    data: {
      questionId: params.questionId,
      userId: params.userId,
      rating: params.input.rating,
      reason: params.input.reason ?? null,
      comment: params.input.comment ?? null,
    },
  })

  await prisma.questionBankQuestion.update({
    where: { id: params.questionId },
    data: {
      positiveCount: params.input.rating === 'POSITIVE' ? { increment: 1 } : undefined,
      negativeCount: params.input.rating === 'NEGATIVE' ? { increment: 1 } : undefined,
      flaggedCount: params.input.rating === 'NEGATIVE' ? { increment: 1 } : undefined,
    },
  })

  return feedback
}
