import { z } from 'zod'
import { ASAAS_ENVIRONMENT_VALUES } from '@/lib/billing/asaas-config'

const EnvironmentValuesSchema = z.object({
  apiKey: z.string().nullable(),
  webhookToken: z.string().nullable(),
})

const EnvironmentUpdateSchema = z.object({
  apiKey: z.string().trim().optional(),
  webhookToken: z.string().trim().optional(),
})

export const BillingAsaasSettingsSchema = z.object({
  environment: z.enum(ASAAS_ENVIRONMENT_VALUES),
  sandbox: EnvironmentValuesSchema,
  production: EnvironmentValuesSchema,
})

export const BillingAsaasSettingsUpdateSchema = z.object({
  environment: z.enum(ASAAS_ENVIRONMENT_VALUES, { message: 'Ambiente inválido' }),
  sandbox: EnvironmentUpdateSchema,
  production: EnvironmentUpdateSchema,
})

export type BillingAsaasSettings = z.infer<typeof BillingAsaasSettingsSchema>
export type BillingAsaasSettingsUpdate = z.infer<typeof BillingAsaasSettingsUpdateSchema>
