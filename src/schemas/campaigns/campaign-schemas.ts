import { z } from 'zod'

export const CampaignSchema = z.object({
    title: z.string().min(3, 'Título deve ter pelo menos 3 caracteres').max(100),
    body: z.string().min(3, 'Mensagem deve ter pelo menos 3 caracteres').max(255),
    url: z.string().url('URL inválida').nullable().optional().or(z.literal('')),
    icon: z.string().nullable().optional(),
    imageUrl: z.string().url('URL da imagem inválida').nullable().optional().or(z.literal('')),
    scheduledAt: z.string().nullable().optional(),
    // Segmentação
    audience: z.object({
        roles: z.array(z.string()).optional(), // Array de roles selecionados
        hasSubscription: z.string().optional(), // 'all' | 'subscribers' | 'non-subscribers'
        activeInDays: z.number().nullable().optional(),
        inactiveForDays: z.number().nullable().optional(),
    }).optional(),
})

export type CampaignInput = z.infer<typeof CampaignSchema>
