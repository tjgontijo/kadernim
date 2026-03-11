import { z } from 'zod'

export const BnccThemeSuggestionsQuerySchema = z.object({
  educationLevelSlug: z.string().min(1, 'educationLevelSlug é obrigatório'),
  gradeSlug: z.string().optional(),
  subjectSlug: z.string().optional(),
})

export type BnccThemeSuggestionsQuery = z.infer<typeof BnccThemeSuggestionsQuerySchema>
