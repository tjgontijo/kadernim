import { z } from 'zod'

export const QuestionBankDifficultySchema = z.enum(['EASY', 'MEDIUM', 'HARD'])
export const QuestionBankStatusSchema = z.enum([
  'DRAFT_AI',
  'APPROVED_AI',
  'APPROVED_TEACHER',
  'FLAGGED',
  'REJECTED',
  'ARCHIVED',
])

export const QuestionBankFeedbackRatingSchema = z.enum(['POSITIVE', 'NEGATIVE'])
export const QuestionBankFeedbackReasonSchema = z.enum([
  'TOO_EASY',
  'TOO_HARD',
  'UNCLEAR',
  'CONCEPTUAL_ERROR',
  'OUT_OF_BNCC',
  'BAD_ANSWER_KEY',
  'GRADE_MISMATCH',
  'LANGUAGE_PROBLEM',
  'OTHER',
])

export const CreateQuestionBankRequestSchema = z.object({
  gradeSlug: z.string().trim().min(1),
  subjectSlug: z.string().trim().min(1),
  count: z.number().int().min(1).max(50),
  difficulty: z.enum(['easy', 'medium', 'hard', 'mixed']).optional(),
  difficultyMix: z.object({
    easy: z.number().int().min(0),
    medium: z.number().int().min(0),
    hard: z.number().int().min(0),
  }).optional(),
  questionTypeCodes: z.array(z.string().trim().min(1)).max(20).optional(),
  bnccSkillIds: z.array(z.string().uuid()).max(20).optional(),
})

export const QuestionBankListFilterSchema = z.object({
  gradeSlug: z.string().trim().min(1).optional(),
  subjectSlug: z.string().trim().min(1).optional(),
  difficulty: QuestionBankDifficultySchema.optional(),
  status: QuestionBankStatusSchema.optional(),
  questionTypeCode: z.string().trim().min(1).optional(),
  bnccSkillId: z.string().uuid().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

export const CreateQuestionBankFeedbackSchema = z.object({
  rating: QuestionBankFeedbackRatingSchema,
  reason: QuestionBankFeedbackReasonSchema.optional(),
  comment: z.string().trim().max(1000).optional(),
})

export const QuestionBankQuestionDtoSchema = z.object({
  id: z.string().uuid(),
  prompt: z.string(),
  instruction: z.string().nullable(),
  difficulty: QuestionBankDifficultySchema,
  status: QuestionBankStatusSchema,
  questionTypeCode: z.string(),
  questionTypeName: z.string(),
  questionSourceCode: z.string(),
  questionSourceName: z.string(),
  payload: z.unknown(),
  answerKey: z.unknown(),
  explanation: z.string().nullable(),
})

export const QuestionBankRequestResponseSchema = z.object({
  requestId: z.string().uuid(),
  reusedCount: z.number().int().nonnegative(),
  generatedCount: z.number().int().nonnegative(),
  items: z.array(QuestionBankQuestionDtoSchema),
})

export const QuestionBankDocxExportSchema = z.object({
  questionIds: z.array(z.string().uuid()).min(1).max(100),
  title: z.string().trim().min(1).max(160).optional(),
})

export type QuestionBankDifficulty = z.infer<typeof QuestionBankDifficultySchema>
export type QuestionBankStatus = z.infer<typeof QuestionBankStatusSchema>
export type CreateQuestionBankRequestInput = z.infer<typeof CreateQuestionBankRequestSchema>
export type QuestionBankListFilter = z.infer<typeof QuestionBankListFilterSchema>
export type CreateQuestionBankFeedbackInput = z.infer<typeof CreateQuestionBankFeedbackSchema>
export type QuestionBankQuestionDto = z.infer<typeof QuestionBankQuestionDtoSchema>
export type QuestionBankDocxExportInput = z.infer<typeof QuestionBankDocxExportSchema>
