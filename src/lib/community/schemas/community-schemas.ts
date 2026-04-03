import { z } from 'zod'

export const CommunityRequestStatusSchema = z.enum([
  'draft',
  'voting',
  'selected',
  'approved',
  'in_production',
  'completed',
  'unfeasible',
])

export const CommunityRequestSchema = z.object({
  title: z.string().min(5, 'Título deve ter pelo menos 5 caracteres').max(100),
  description: z.string().min(20, 'Descrição deve ter pelo menos 20 caracteres').max(1000),
  hasBnccAlignment: z.boolean().default(false),
  educationLevelId: z.string().cuid().optional().nullable(),
  gradeId: z.string().cuid().optional().nullable(),
  subjectId: z.string().cuid().optional().nullable(),
  bnccSkillCodes: z.array(z.string()).default([]),
})

export const CommunityFilterSchema = z.object({
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(12),
  status: CommunityRequestStatusSchema.optional(),
  votingMonth: z.string().regex(/^\d{4}-\d{2}$/).optional(),
  educationLevelId: z.string().optional(),
  subjectId: z.string().optional(),
  educationLevelSlug: z.string().optional(),
  gradeSlug: z.string().optional(),
  subjectSlug: z.string().optional(),
  q: z.string().optional(),
  mine: z.coerce.boolean().optional().default(false),
})

export const RefinedDescriptionsSchema = z.object({
  format: z.string().describe('Versão focada no formato e tipo de material'),
  usability: z.string().describe('Versão focada na aplicação prática em sala'),
  pedagogy: z.string().describe('Versão focada nos objetivos pedagógicos'),
})

export const RefineCommunityRequestSchema = z.object({
  rawDescription: z.string().min(20, 'Descrição muito curta'),
  educationLevelName: z.string(),
  subjectName: z.string(),
  gradeNames: z.array(z.string()),
})

export const GenerateCommunityTitleRequestSchema = z.object({
  description: z.string().min(20, 'Descrição muito curta'),
})

export const CommunityGeneratedTitlesSchema = z.object({
  short: z.string().describe('Título curto e direto (máximo 4 palavras)'),
  descriptive: z.string().describe('Título descritivo que explica o material (máximo 6 palavras)'),
  creative: z.string().describe('Título criativo e atrativo (máximo 6 palavras)'),
})

export type CommunityRequestInput = z.infer<typeof CommunityRequestSchema>
export type CommunityFilters = z.infer<typeof CommunityFilterSchema>
export type RefinedDescriptions = z.infer<typeof RefinedDescriptionsSchema>
export type RefineCommunityRequestInput = z.infer<typeof RefineCommunityRequestSchema>
export type GenerateCommunityTitleRequestInput = z.infer<typeof GenerateCommunityTitleRequestSchema>
