import type { CreateQuestionBankRequestInput } from '@/lib/question-bank/schemas'

/**
 * Placeholder for Phase 2/3 implementation.
 * This service will orchestrate:
 * 1) Reuse from bank
 * 2) Deficit generation via Mastra
 * 3) Persistence + request tracking
 */
export async function getOrGenerateQuestionBankItems(
  _userId: string,
  _input: CreateQuestionBankRequestInput
) {
  throw new Error('NOT_IMPLEMENTED_PHASE_1')
}
