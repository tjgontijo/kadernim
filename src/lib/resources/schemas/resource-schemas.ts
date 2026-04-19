import { z } from 'zod'

export const ResourceFilterSchema = z.object({
  q: z
    .string()
    .trim()
    .min(2, { message: 'query muito curta' })
    .max(100)
    .optional(),
  educationLevel: z.string().optional(),
  grade: z.string().optional(),
  subject: z.string().optional(),
  tab: z.enum(['mine', 'all']).default('all'),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
})

export type ResourceFilter = z.infer<typeof ResourceFilterSchema>

export const ResourceSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable().optional(),
  thumbUrl: z.string().nullable().optional(),
  educationLevel: z.string(),
  subject: z.string(),
  hasAccess: z.boolean(),
  isFavorite: z.boolean().default(false),
})

export type Resource = z.infer<typeof ResourceSchema>

export const ResourceFileMetadataSchema = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.string(),
})

export type ResourceFileMetadata = z.infer<typeof ResourceFileMetadataSchema>

export const ResourceImageSchema = z.object({
  id: z.string(),
  cloudinaryPublicId: z.string().optional(),
  url: z.string().nullable(),
  alt: z.string().nullable().optional(),
  order: z.number(),
})

export type ResourceImage = z.infer<typeof ResourceImageSchema>

export const ResourceVideoSchema = z.object({
  id: z.string(),
  title: z.string(),
  cloudinaryPublicId: z.string().optional(),
  url: z.string().nullable(),
  thumbnail: z.string().nullable().optional(),
  duration: z.number().nullable().optional(),
  order: z.number(),
})

export type ResourceVideo = z.infer<typeof ResourceVideoSchema>

export const AuthorSchema = z.object({
  id: z.string(),
  displayName: z.string(),
  displayRole: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  verified: z.boolean(),
})

export type Author = z.infer<typeof AuthorSchema>

export const BnccSkillSchema = z.object({
  id: z.string(),
  code: z.string(),
  description: z.string(),
})

export type BnccSkill = z.infer<typeof BnccSkillSchema>

export const PedagogicalContentSchema = z.object({
  objectives: z.array(z.object({
    id: z.string(),
    text: z.string(),
    order: z.number(),
  })),
  steps: z.array(z.object({
    id: z.string(),
    type: z.string(),
    title: z.string(),
    duration: z.string().nullable(),
    content: z.string(),
    order: z.number(),
  })),
}).nullable()

export type PedagogicalContent = z.infer<typeof PedagogicalContentSchema>

export const ResourceDetailSchema = ResourceSchema.extend({
  files: z.array(ResourceFileMetadataSchema),
  images: z.array(ResourceImageSchema),
  videos: z.array(ResourceVideoSchema),
  
  // NOVOS CAMPOS
  slug: z.string().nullable(),
  isCurated: z.boolean(),
  curatedAt: z.string().nullable(),
  resourceType: z.string(),
  pagesCount: z.number().nullable(),
  estimatedDurationMinutes: z.number().nullable(),
  
  reviewCount: z.number(),
  averageRating: z.number(),
  downloadCount: z.number(),
  
  author: AuthorSchema.nullable(),
  bnccSkills: z.array(BnccSkillSchema),
  pedagogicalContent: PedagogicalContentSchema,
})

export type ResourceDetail = z.infer<typeof ResourceDetailSchema>

export const ResourceListResponseSchema = z.object({
  data: z.array(ResourceSchema),
  pagination: z.object({
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    hasMore: z.boolean(),
  }),
})

export type ResourceListResponse = z.infer<typeof ResourceListResponseSchema>
