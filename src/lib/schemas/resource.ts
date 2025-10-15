import { z } from 'zod'

export const ResourcesQueryDTO = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().min(1).max(50).default(12),
  subjectId: z.string().min(1).optional(),
  educationLevelId: z.string().min(1).optional(),
  q: z.string().trim().max(200).optional(),
  bnccCodes: z.preprocess(
    v => Array.isArray(v) ? v : typeof v === 'string' ? v.split(',') : [],
    z.array(z.string().min(1)).optional()
  )
})

// 🔹 RESPOSTA SIMPLIFICADA
export const ResourcesResponseDTO = z.object({
  resources: z.array(z.object({
    id: z.string(),
    title: z.string(),
    imageUrl: z.string(),
    isFree: z.boolean(),
    subjectId: z.string(),
    educationLevelId: z.string(),
    hasAccess: z.boolean()
  })),
  pagination: z.object({
    total: z.number().int().nonnegative(),
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    hasMore: z.boolean()
  })
})

export type ResourcesQuery = z.infer<typeof ResourcesQueryDTO>
export type ResourcesResponse = z.infer<typeof ResourcesResponseDTO>
