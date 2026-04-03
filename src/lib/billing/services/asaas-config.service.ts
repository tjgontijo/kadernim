import {
  detectAsaasEnvironmentFromBaseUrl,
  getAsaasBaseUrl,
  normalizeAsaasEnvironment,
  normalizeAsaasSecret,
  type AsaasEnvironment,
} from '@/lib/billing/asaas-config'
import type { BillingAsaasSettings, BillingAsaasSettingsUpdate } from '@/lib/billing/schemas'
import { billingLog } from './logger'

export interface BillingAsaasRuntimeConfig {
  apiKey: string | null
  baseUrl: string
  webhookToken: string | null
}

function resolveEnvRuntimeConfig() {
  const baseUrl = process.env.ASAAS_BASE_URL?.trim() || getAsaasBaseUrl('sandbox')
  const apiKey = normalizeAsaasSecret(process.env.ASAAS_API_KEY ?? null)
  const webhookToken = normalizeAsaasSecret(process.env.ASAAS_WEBHOOK_TOKEN ?? null)
  const environment = detectAsaasEnvironmentFromBaseUrl(baseUrl)

  return {
    environment,
    baseUrl,
    apiKey,
    webhookToken,
  }
}

export class BillingAsaasConfigService {
  static async getRuntimeConfig(): Promise<BillingAsaasRuntimeConfig> {
    const config = resolveEnvRuntimeConfig()
    return {
      apiKey: config.apiKey,
      baseUrl: config.baseUrl,
      webhookToken: config.webhookToken,
    }
  }

  static async getAdminConfig(): Promise<BillingAsaasSettings> {
    const config = resolveEnvRuntimeConfig()
    const isSandbox = config.environment === 'sandbox'

    return {
      environment: config.environment,
      sandbox: {
        apiKey: isSandbox ? config.apiKey : null,
        webhookToken: isSandbox ? config.webhookToken : null,
      },
      production: {
        apiKey: isSandbox ? null : config.apiKey,
        webhookToken: isSandbox ? null : config.webhookToken,
      },
    }
  }

  static async updateConfig(_data: BillingAsaasSettingsUpdate): Promise<BillingAsaasSettings> {
    billingLog('warn', 'Attempt to update Asaas configuration via API while env-managed')
    throw new Error('As configurações do Asaas agora são gerenciadas via variáveis de ambiente (.env).')
  }
}
