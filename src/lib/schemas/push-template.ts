import { z } from 'zod';

/**
 * Schema para criação de PushTemplate
 */
export const PushTemplateCreateSchema = z.object({
  name: z
    .string()
    .min(1, 'Nome é obrigatório')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  slug: z
    .string()
    .max(100)
    .regex(
      /^[a-z0-9-]+$/,
      'Slug deve conter apenas letras minúsculas, números e hífens'
    )
    .optional(),
  title: z
    .string()
    .min(1, 'Título é obrigatório')
    .max(100, 'Título deve ter no máximo 100 caracteres'),
  body: z
    .string()
    .min(1, 'Mensagem é obrigatória')
    .max(500, 'Mensagem deve ter no máximo 500 caracteres'),
  icon: z.string().max(500).optional().nullable(),
  badge: z.string().max(500).optional().nullable(),
  image: z.string().max(500).optional().nullable(),
  url: z.string().max(500).optional().nullable(),
  tag: z.string().max(100).optional().nullable(),
  eventType: z.string().min(1, 'Tipo de evento é obrigatório'),
  description: z.string().max(500).optional().nullable(),
  isActive: z.boolean().optional().default(true),
});

/**
 * Schema para atualização de PushTemplate
 */
export const PushTemplateUpdateSchema = PushTemplateCreateSchema.partial();

/**
 * Schema para lista de PushTemplates com filtros
 */
export const PushTemplateListSchema = z.object({
  eventType: z.string().optional(),
  isActive: z.boolean().optional(),
  search: z.string().optional(),
});

// Types exportados
export type PushTemplateCreate = z.infer<typeof PushTemplateCreateSchema>;
export type PushTemplateUpdate = z.infer<typeof PushTemplateUpdateSchema>;
export type PushTemplateList = z.infer<typeof PushTemplateListSchema>;
