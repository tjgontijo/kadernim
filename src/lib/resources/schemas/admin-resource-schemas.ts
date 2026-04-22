import { z } from 'zod'

const ResourceObjectiveInputSchema = z.object({
  id: z.string().uuid().optional(),
  text: z.string(),
  order: z.number(),
})

const ResourceStepInputSchema = z.object({
  id: z.string().uuid().optional(),
  type: z.string(),
  title: z.string(),
  duration: z.string().optional().nullable(),
  content: z.string(),
  order: z.number(),
})

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
  thumbUrl: z.string()
    .url('thumbUrl deve ser uma URL válida')
    .optional()
    .nullable(),
  thumbPublicId: z.string()
    .optional()
    .nullable(),
  grades: z.array(z.string()),
  resourceType: z.string().optional(),
  pagesCount: z.number().int().nonnegative().optional().nullable(),
  estimatedDurationMinutes: z.number().int().nonnegative().optional().nullable(),
  googleDriveUrl: z.string().url('URL do Google Drive inválida').optional().nullable(),
  bnccCodes: z.array(z.string()).default([]),
  objectives: z.array(ResourceObjectiveInputSchema).optional(),
  steps: z.array(ResourceStepInputSchema).optional(),
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
  thumbUrl: z.string()
    .url('thumbUrl deve ser uma URL válida')
    .optional()
    .nullable(),
  thumbPublicId: z.string()
    .optional()
    .nullable(),
  grades: z.array(z.string()).optional(),
  resourceType: z.string().optional(),
  pagesCount: z.number().int().nonnegative().optional().nullable(),
  estimatedDurationMinutes: z.number().int().nonnegative().optional().nullable(),
  googleDriveUrl: z.string().url('URL do Google Drive inválida').optional().nullable(),
  bnccCodes: z.array(z.string()).optional(),
  objectives: z.array(ResourceObjectiveInputSchema).optional(),
  steps: z.array(ResourceStepInputSchema).optional(),
  archivedAt: z.union([z.string(), z.date()]).optional().nullable(),
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
  thumbUrl: z.string().nullable(),
  thumbPublicId: z.string().nullable().optional(),
  grades: z.array(z.string()),
  resourceType: z.string().optional(),
  pagesCount: z.number().nullable().optional(),
  estimatedDurationMinutes: z.number().nullable().optional(),
  googleDriveUrl: z.string().nullable().optional(),
  bnccCodes: z.array(z.string()).default([]),
  objectives: z.array(z.object({
    id: z.string(),
    text: z.string(),
    order: z.number(),
  })).default([]),
  steps: z.array(z.object({
    id: z.string(),
    type: z.string(),
    title: z.string(),
    duration: z.string().nullable(),
    content: z.string(),
    order: z.number(),
  })).default([]),
  createdAt: z.string(),
  updatedAt: z.string(),
  files: z.array(z.object({
    id: z.string(),
    name: z.string(),
    cloudinaryPublicId: z.string().optional(),
    url: z.string(),
    fileType: z.string().nullable(),
    sizeBytes: z.number().nullable(),
    createdAt: z.string(),
    images: z.array(z.object({
      id: z.string(),
      cloudinaryPublicId: z.string().optional(),
      url: z.string().nullable(),
      alt: z.string().nullable(),
      order: z.number(),
    })).default([]),
  })),
  images: z.array(z.object({
    id: z.string(),
    cloudinaryPublicId: z.string().optional(),
    url: z.string().nullable(),
    alt: z.string().nullable(),
    order: z.number(),
    createdAt: z.string(),
  })),
  videos: z.array(z.object({
    id: z.string(),
    title: z.string(),
    cloudinaryPublicId: z.string().optional(),
    url: z.string().nullable(),
    thumbnail: z.string().nullable(),
    duration: z.number().nullable(),
    order: z.number(),
    createdAt: z.string(),
  })),
  stats: z.object({
    totalDownloads: z.number().optional(),
    averageRating: z.number().optional(),
  }).optional(),

})

export type ResourceDetailResponse = z.infer<typeof ResourceDetailResponseSchema>

export const ResourceListResponseSchema = z.object({
  data: z.array(z.object({
    id: z.string(),
    title: z.string(),
    description: z.string().nullable().optional(),
    educationLevel: z.string(),
    subject: z.string(),
    thumbUrl: z.string().nullable(),
    fileCount: z.number(),
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

export const ReorderResourceImagesSchema = z.object({
  updates: z.array(
    z.object({
      id: z.string(),
      order: z.number().int().nonnegative(),
    })
  ),
})

export type ReorderResourceImagesInput = z.infer<typeof ReorderResourceImagesSchema>

export const UpdateResourceImageSchema = z.object({
  alt: z.string().trim().max(255).optional().nullable(),
  order: z.number().int().nonnegative().optional(),
})

export type UpdateResourceImageInput = z.infer<typeof UpdateResourceImageSchema>

export const UpdateResourceVideoSchema = z.object({
  title: z.string().trim().min(1).max(255).optional(),
  order: z.number().int().nonnegative().optional(),
})

export type UpdateResourceVideoInput = z.infer<typeof UpdateResourceVideoSchema>
