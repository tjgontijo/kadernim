import { z } from 'zod'

// ============================================
// CREATE RESOURCE SCHEMA
// ============================================
export const CreateResourceSchema = z.object({
  title: z.string()
    .min(3, { message: 'Título deve ter pelo menos 3 caracteres' })
    .max(255, { message: 'Título deve ter no máximo 255 caracteres' })
    .trim(),
  description: z.string()
    .max(5000, { message: 'Descrição deve ter no máximo 5000 caracteres' })
    .trim()
    .optional()
    .nullable(),
  educationLevel: z.string().min(1, { message: 'Nível de educação é obrigatório' }),
  subject: z.string().min(1, { message: 'Matéria é obrigatória' }),
  externalId: z.number()
    .int()
    .positive('externalId deve ser positivo')
    .optional()
    .nullable(),
  isFree: z.boolean(),
  thumbUrl: z.string()
    .url('thumbUrl deve ser uma URL válida')
    .optional()
    .nullable(),
  grades: z.array(z.string()),
})

export type CreateResourceInput = z.infer<typeof CreateResourceSchema>

// ============================================
// UPDATE RESOURCE SCHEMA
// ============================================
export const UpdateResourceSchema = z.object({
  title: z.string()
    .min(3, { message: 'Título deve ter pelo menos 3 caracteres' })
    .max(255, { message: 'Título deve ter no máximo 255 caracteres' })
    .trim()
    .optional(),
  description: z.string()
    .max(5000, { message: 'Descrição deve ter no máximo 5000 caracteres' })
    .trim()
    .optional()
    .nullable(),
  educationLevel: z.string().optional(),
  subject: z.string().optional(),
  externalId: z.number().int().positive().optional().nullable(),
  isFree: z.boolean().optional(),
  thumbUrl: z.string()
    .url('thumbUrl deve ser uma URL válida')
    .optional()
    .nullable(),
  grades: z.array(z.string()).optional(),
})

export type UpdateResourceInput = z.infer<typeof UpdateResourceSchema>

// ============================================
// LIST RESOURCES FILTER SCHEMA
// ============================================
export const ListResourcesFilterSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  q: z
    .string()
    .trim()
    .max(100)
    .optional(),
  educationLevel: z.string().optional(),
  grade: z.string().optional(),
  subject: z.string().optional(),
  isFree: z.boolean().optional(),
  sortBy: z.enum(['title', 'createdAt', 'updatedAt']).default('updatedAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
})

export type ListResourcesFilter = z.infer<typeof ListResourcesFilterSchema>

// ============================================
// BULK UPDATE SCHEMA
// ============================================
export const BulkUpdateResourcesSchema = z.object({
  ids: z.array(z.string())
    .min(1, { message: 'Deve haver pelo menos 1 ID' })
    .max(100, { message: 'Máximo 100 IDs por operação' }),
  updates: UpdateResourceSchema.strict(),
})

export type BulkUpdateResourcesInput = z.infer<typeof BulkUpdateResourcesSchema>

// ============================================
// BULK DELETE SCHEMA
// ============================================
export const BulkDeleteResourcesSchema = z.object({
  ids: z.array(z.string())
    .min(1, { message: 'Deve haver pelo menos 1 ID' })
    .max(100, { message: 'Máximo 100 IDs por operação' }),
})

export type BulkDeleteResourcesInput = z.infer<typeof BulkDeleteResourcesSchema>

// ============================================
// RESPONSE SCHEMAS
// ============================================
export const ResourceDetailResponseSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  educationLevel: z.string(),
  subject: z.string(),
  externalId: z.number().nullable(),
  isFree: z.boolean(),
  thumbUrl: z.string().nullable(),
  grades: z.array(z.string()),
  createdAt: z.string(),
  updatedAt: z.string(),
  files: z.array(z.object({
    id: z.string(),
    name: z.string(),
    cloudinaryPublicId: z.string(),
    url: z.string(),
    fileType: z.string().nullable(),
    sizeBytes: z.number().nullable(),
    createdAt: z.string(),
  })),
  images: z.array(z.object({
    id: z.string(),
    cloudinaryPublicId: z.string(),
    url: z.string(),
    alt: z.string().nullable(),
    order: z.number(),
    createdAt: z.string(),
  })),
  videos: z.array(z.object({
    id: z.string(),
    title: z.string(),
    cloudinaryPublicId: z.string(),
    thumbnail: z.string().nullable(),
    duration: z.number().nullable(),
    order: z.number(),
    createdAt: z.string(),
  })),
  stats: z.object({
    totalUsers: z.number(),
    accessGrants: z.number(),
    subscriberAccess: z.number(),
  }),
})

export type ResourceDetailResponse = z.infer<typeof ResourceDetailResponseSchema>

export const ResourceListResponseSchema = z.object({
  data: z.array(z.object({
    id: z.string(),
    title: z.string(),
    description: z.string().nullable().optional(),
    educationLevel: z.string(),
    subject: z.string(),
    externalId: z.number().nullable(),
    isFree: z.boolean(),
    thumbUrl: z.string().nullable(),
    fileCount: z.number(),
    accessCount: z.number(),
    grades: z.array(z.string()),
    createdAt: z.string(),
    updatedAt: z.string(),
  })),
  pagination: z.object({
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    total: z.number().int().nonnegative(),
    totalPages: z.number().int().nonnegative(),
    hasMore: z.boolean(),
  }),
})

export type ResourceListResponse = z.infer<typeof ResourceListResponseSchema>

export const BulkOperationResultSchema = z.object({
  updated: z.number(),
  failed: z.number(),
  deleted: z.number().optional(),
  errors: z.array(z.object({
    id: z.string(),
    error: z.string(),
  })).optional(),
})

export type BulkOperationResult = z.infer<typeof BulkOperationResultSchema>
