import { z } from 'zod'

export const AutomationRuleSchema = z.object({
    name: z.string().min(3, 'Nome muito curto'),
    eventType: z.string().min(1, 'Evento é obrigatório'),
    isActive: z.boolean().default(true),
    description: z.string().optional(),
    conditions: z.any().optional(),
    actions: z.array(z.object({
        type: z.string(),
        config: z.any().default({}),
        order: z.number().optional(),
    })).min(1, 'Pelo menos uma ação é necessária'),
})

export type AutomationRuleInput = z.infer<typeof AutomationRuleSchema>

export const UpdateAutomationRuleSchema = z.object({
    name: z.string().min(3).optional(),
    isActive: z.boolean().optional(),
    description: z.string().optional(),
    eventType: z.string().optional(),
    conditions: z.any().optional(),
    actions: z.array(z.object({
        type: z.string(),
        config: z.any().default({}),
        order: z.number().optional(),
    })).optional(),
})

export type UpdateAutomationRuleInput = z.infer<typeof UpdateAutomationRuleSchema>
