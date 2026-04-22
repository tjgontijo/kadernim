import { z } from 'zod'

export const BnccSkillFilterSchema = z.object({
  q: z.string().trim().max(100).optional(),
  educationLevel: z.string().optional(),
  grades: z.array(z.string()).optional(),
  subject: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(30),
})

export type BnccSkillFilter = z.infer<typeof BnccSkillFilterSchema>

export const BnccTaxonomyItemSchema = z.object({
  slug: z.string(),
  name: z.string(),
})

export const BnccSkillListItemSchema = z.object({
  id: z.string(),
  code: z.string(),
  description: z.string(),
  educationLevel: BnccTaxonomyItemSchema,
  grade: BnccTaxonomyItemSchema.nullable(),
  subject: BnccTaxonomyItemSchema.nullable(),
  unitTheme: z.string().nullable(),
  knowledgeObject: z.string().nullable(),
  relatedResourcesCount: z.number().int().nonnegative(),
})

export type BnccSkillListItem = z.infer<typeof BnccSkillListItemSchema>

export const BnccRelatedResourceSchema = z.object({
  id: z.string(),
  title: z.string(),
  thumbUrl: z.string().nullable(),
})

export const BnccSkillDetailSchema = BnccSkillListItemSchema.extend({
  comments: z.string().nullable(),
  curriculumSuggestions: z.string().nullable(),
  relatedResources: z.array(BnccRelatedResourceSchema).default([]),
})

export type BnccSkillDetail = z.infer<typeof BnccSkillDetailSchema>

export const BnccSkillsListResponseSchema = z.object({
  data: z.array(BnccSkillListItemSchema),
  pagination: z.object({
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    hasMore: z.boolean(),
  }),
})

export type BnccSkillsListResponse = z.infer<typeof BnccSkillsListResponseSchema>

export const BnccSkillDetailResponseSchema = z.object({
  data: BnccSkillDetailSchema,
})

export type BnccSkillDetailResponse = z.infer<typeof BnccSkillDetailResponseSchema>
