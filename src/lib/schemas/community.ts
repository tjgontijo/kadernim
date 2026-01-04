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
    educationLevelId: z.string().cuid(),
    gradeId: z.string().cuid().optional().nullable(),
    subjectId: z.string().cuid(),
})

export const CommunityFilterSchema = z.object({
    page: z.coerce.number().default(1),
    limit: z.coerce.number().default(20),
    status: CommunityRequestStatusSchema.optional(),
    votingMonth: z.string().regex(/^\d{4}-\d{2}$/).optional(),
    educationLevelId: z.string().optional(),
    subjectId: z.string().optional(),
})

export type CommunityRequestInput = z.infer<typeof CommunityRequestSchema>
export type CommunityFilters = z.infer<typeof CommunityFilterSchema>
