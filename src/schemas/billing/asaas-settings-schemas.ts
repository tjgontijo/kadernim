import { z } from 'zod'
import { ASAAS_ENVIRONMENT_VALUES } from '@/lib/billing/asaas-config'

// Shape returned to the admin (previews for display, not full secrets)
const EnvironmentStatusSchema = z.object({
  apiKeyPreview: z.string().nullable(),       // e.g. "$aact_hm…" or null
  webhookTokenPreview: z.string().nullable(), // e.g. "whsec_PH…" or null
})

// Shape sent by the admin form (blank = keep existing)
const EnvironmentUpdateSchema = z.object({
  apiKey: z.string().trim().optional(),
  webhookToken: z.string().trim().optional(),
})

export const BillingAsaasSettingsSchema = z.object({
  environment: z.enum(ASAAS_ENVIRONMENT_VALUES),
  sandbox: EnvironmentStatusSchema,
  production: EnvironmentStatusSchema,
})

export const BillingAsaasSettingsUpdateSchema = z.object({
  environment: z.enum(ASAAS_ENVIRONMENT_VALUES, { message: 'Ambiente inválido' }),
  sandbox: EnvironmentUpdateSchema,
  production: EnvironmentUpdateSchema,
})

export type BillingAsaasSettings = z.infer<typeof BillingAsaasSettingsSchema>
export type BillingAsaasSettingsUpdate = z.infer<typeof BillingAsaasSettingsUpdateSchema>
