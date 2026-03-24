import { z } from 'zod'
import { ASAAS_ENVIRONMENT_VALUES } from '@/lib/billing/asaas-config'

export const BillingAsaasSettingsSchema = z.object({
  environment: z.enum(ASAAS_ENVIRONMENT_VALUES, {
    message: 'Ambiente inválido',
  }),
  hasApiKey: z.boolean(),
  hasWebhookToken: z.boolean(),
})

export const BillingAsaasSettingsUpdateSchema = z.object({
  environment: z.enum(ASAAS_ENVIRONMENT_VALUES, {
    message: 'Ambiente inválido',
  }),
  apiKey: z.string().trim().optional(),
  webhookToken: z.string().trim().optional(),
})

export type BillingAsaasSettings = z.infer<typeof BillingAsaasSettingsSchema>
export type BillingAsaasSettingsUpdate = z.infer<typeof BillingAsaasSettingsUpdateSchema>
