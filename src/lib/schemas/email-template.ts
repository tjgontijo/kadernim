import { z } from 'zod';

/**
 * Schema para criação de EmailTemplate
 */
export const EmailTemplateCreateSchema = z.object({
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
    subject: z
        .string()
        .min(1, 'Assunto é obrigatório')
        .max(200, 'Assunto deve ter no máximo 200 caracteres'),
    preheader: z.string().max(200).optional().nullable(),
    body: z.string().min(1, 'Conteúdo HTML é obrigatório'),
    content: z.any().optional().nullable(),
    eventType: z.string().min(1, 'Tipo de evento é obrigatório'),
    description: z.string().max(500).optional().nullable(),
    isActive: z.boolean().optional().default(true),
});

/**
 * Schema para atualização de EmailTemplate
 */
export const EmailTemplateUpdateSchema = EmailTemplateCreateSchema.partial();

/**
 * Schema para lista de EmailTemplates com filtros
 */
export const EmailTemplateListSchema = z.object({
    eventType: z.string().optional(),
    isActive: z.boolean().optional(),
    search: z.string().optional(),
});

// Types exportados
export type EmailTemplateCreate = z.infer<typeof EmailTemplateCreateSchema>;
export type EmailTemplateUpdate = z.infer<typeof EmailTemplateUpdateSchema>;
export type EmailTemplateList = z.infer<typeof EmailTemplateListSchema>;
