import { z } from 'zod'

const NotificationTemplateTypeSchema = z.enum(['email', 'whatsapp'])

export const NotificationTemplateCreateSchema = z.object({
  slug: z
    .string()
    .min(1, 'Slug é obrigatório')
    .regex(
      /^[a-z0-9-]+$/,
      'Slug deve conter apenas letras minúsculas, números e hífens'
    ),
  name: z.string().min(1, 'Nome é obrigatório'),
  type: NotificationTemplateTypeSchema,
  eventType: z.string().min(1, 'Tipo de evento é obrigatório'),
  subject: z.string().nullable().optional(),
  body: z.string().min(1, 'Conteúdo é obrigatório'),
  description: z.string().nullable().optional(),
  variables: z.array(z.string()).nullable().optional(),
})

export const NotificationTemplateUpdateSchema = NotificationTemplateCreateSchema.partial().extend({
  isActive: z.boolean().optional(),
})

export type NotificationTemplateCreateInput = z.infer<
  typeof NotificationTemplateCreateSchema
>
export type NotificationTemplateUpdateInput = z.infer<
  typeof NotificationTemplateUpdateSchema
>
