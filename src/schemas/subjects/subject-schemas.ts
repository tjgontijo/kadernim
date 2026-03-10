import { z } from 'zod'

export const SubjectSchema = z.object({
    name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
    slug: z.string().min(2, 'Slug deve ter pelo menos 2 caracteres'),
})

export type SubjectInput = z.infer<typeof SubjectSchema>
