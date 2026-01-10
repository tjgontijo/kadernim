import { z } from 'zod';

/**
 * Schema para criação de WhatsAppTemplate
 */
export const WhatsAppTemplateCreateSchema = z.object({
    slug: z
        .string()
        .min(1, 'Slug é obrigatório')
        .max(100, 'Slug deve ter no máximo 100 caracteres')
        .regex(
            /^[a-z0-9-]+$/,
            'Slug deve conter apenas letras minúsculas, números e hífens'
        ),
    name: z
        .string()
        .min(1, 'Nome é obrigatório')
        .max(100, 'Nome deve ter no máximo 100 caracteres'),
    body: z.string().min(1, 'Conteúdo da mensagem é obrigatório'),
    eventType: z.string().min(1, 'Tipo de evento é obrigatório'),
    description: z.string().max(500).optional().nullable(),
    isActive: z.boolean().optional().default(true),
});

/**
 * Schema para atualização de WhatsAppTemplate
 */
export const WhatsAppTemplateUpdateSchema = WhatsAppTemplateCreateSchema.partial();

/**
 * Schema para lista de WhatsAppTemplates com filtros
 */
export const WhatsAppTemplateListSchema = z.object({
    eventType: z.string().optional(),
    isActive: z.boolean().optional(),
    search: z.string().optional(),
});

// Types exportados
export type WhatsAppTemplateCreate = z.infer<typeof WhatsAppTemplateCreateSchema>;
export type WhatsAppTemplateUpdate = z.infer<typeof WhatsAppTemplateUpdateSchema>;
export type WhatsAppTemplateList = z.infer<typeof WhatsAppTemplateListSchema>;
