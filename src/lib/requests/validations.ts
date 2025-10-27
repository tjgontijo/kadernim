import { z } from 'zod'

export const createResourceRequestSchema = z.object({
  title: z
    .string()
    .min(3, 'Título deve ter pelo menos 3 caracteres')
    .max(100, 'Título deve ter no máximo 100 caracteres'),
  description: z
    .string()
    .min(10, 'Descrição deve ter pelo menos 10 caracteres')
    .max(5000, 'Descrição deve ter no máximo 5000 caracteres'),
  educationLevelId: z
    .string()
    .min(1, 'Selecione um nível de ensino'),
  subjectId: z
    .string()
    .min(1, 'Selecione uma disciplina'),
})

export const updateResourceRequestSchema = createResourceRequestSchema.extend({
  id: z.string().min(1, 'ID da solicitação é obrigatório'),
})

export type CreateResourceRequestInput = z.infer<typeof createResourceRequestSchema>
export type UpdateResourceRequestInput = z.infer<typeof updateResourceRequestSchema>
