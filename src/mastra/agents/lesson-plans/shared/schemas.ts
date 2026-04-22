import { z } from 'zod'

export const LessonPlanContextSchema = z.object({
  resourceSummary: z.string().min(1),
  mustUseStepIds: z.array(z.string()),
  mustKeepBnccCodes: z.array(z.string()),
  constraints: z.array(z.string()).min(1),
})

export type LessonPlanContext = z.infer<typeof LessonPlanContextSchema>

export const LessonPlanReviewSchema = z.object({
  shouldRefine: z.boolean(),
  issues: z.array(
    z.object({
      severity: z.enum(['HIGH', 'MEDIUM', 'LOW']),
      message: z.string().min(1),
    })
  ),
  fixBrief: z.string().min(1),
})

export type LessonPlanReview = z.infer<typeof LessonPlanReviewSchema>
