import { z } from 'zod'

export const SubjectDTO = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string()
})
export type SubjectDTO = z.infer<typeof SubjectDTO>

export const SubjectCreateInput = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  slug: z.string().min(1).optional()
})

export const SubjectUpdateInput = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  slug: z.string().min(1).optional()
})
