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
  tab: z.enum(['mine', 'free', 'all']).default('all'),
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
  isFree: z.boolean(),
  hasAccess: z.boolean(),
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

export const ResourceDetailSchema = ResourceSchema.extend({
  files: z.array(ResourceFileMetadataSchema),
  images: z.array(ResourceImageSchema),
  videos: z.array(ResourceVideoSchema),
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
