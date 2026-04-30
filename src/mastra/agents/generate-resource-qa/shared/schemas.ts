import { z } from 'zod'

export const AllowedQaComponentTypeSchema = z.enum([
  'page_header',
  'page_footer',
  'activity_intro',
  'multiple_choice',
  'true_false',
  'matching',
  'fill_blank',
  'ordering',
  'open_short',
  'open_long',
  'comprehension',
  'reasoning',
  'creation',
])

export const ALLOWED_QA_COMPONENT_TYPES = AllowedQaComponentTypeSchema.options

export const SkillGenerationMapSchema = z.object({
  cognitiveVerb: z.string(),
  centralConcepts: z.array(z.string()),
  requiredRelations: z.array(z.string()),
  mustIncludeInStudentMaterial: z.array(z.string()),
  recommendedSituations: z.array(z.string()),
  misconceptionWarnings: z.array(z.string()),
  finalPerformanceTask: z.string(),
  assessmentEvidence: z.array(z.string()),
})

export type SkillGenerationMap = z.infer<typeof SkillGenerationMapSchema>

export const MultiSkillGenerationMapSchema = z.object({
  skills: z.array(z.object({
    code: z.string(),
    map: SkillGenerationMapSchema,
  })),
  crossSkillRelations: z.array(z.string()),
  globalMustInclude: z.array(z.string()),
})

export type MultiSkillGenerationMap = z.infer<typeof MultiSkillGenerationMapSchema>

export const ResourceReviewIssueSchema = z.object({
  severity: z.enum(['HIGH', 'MEDIUM', 'LOW']),
  category: z.enum(['PEDAGOGY', 'STRUCTURE', 'LANGUAGE', 'BNCC']),
  message: z.string().max(260),
})

export const ResourceGenerationReviewSchema = z.object({
  shouldRefine: z.boolean(),
  summary: z.string().max(400),
  issues: z.array(ResourceReviewIssueSchema).max(20),
})

export type ResourceGenerationReview = z.infer<typeof ResourceGenerationReviewSchema>
