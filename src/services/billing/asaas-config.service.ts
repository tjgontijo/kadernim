import {
  detectAsaasEnvironmentFromBaseUrl,
  getAsaasBaseUrl,
  normalizeAsaasEnvironment,
  normalizeAsaasSecret,
  type AsaasEnvironment,
} from '@/lib/billing/asaas-config'
import { getConfig, setConfig } from '@/services/config/system-config'
import { billingLog } from './logger'

const ASAAS_ENVIRONMENT_CONFIG_KEY = 'billing.asaas.environment'
const ASAAS_API_KEY_CONFIG_KEY = 'billing.asaas.apiKey'
const ASAAS_BASE_URL_CONFIG_KEY = 'billing.asaas.baseUrl'
const ASAAS_WEBHOOK_TOKEN_CONFIG_KEY = 'billing.asaas.webhookToken'

export interface BillingAsaasRuntimeConfig {
  apiKey: string | null
  baseUrl: string
  webhookToken: string | null
}

export interface BillingAsaasAdminConfig {
  environment: AsaasEnvironment
  hasApiKey: boolean
  hasWebhookToken: boolean
}

export interface BillingAsaasConfigUpdate {
  environment: AsaasEnvironment
  apiKey?: string
  webhookToken?: string
}

export class BillingAsaasConfigService {
  static async getRuntimeConfig(): Promise<BillingAsaasRuntimeConfig> {
    const [environment, apiKey, legacyBaseUrl, webhookToken] = await Promise.all([
      getConfig<string | null>(ASAAS_ENVIRONMENT_CONFIG_KEY, null),
      getConfig<string | null>(ASAAS_API_KEY_CONFIG_KEY, null),
      getConfig<string | null>(ASAAS_BASE_URL_CONFIG_KEY, null),
      getConfig<string | null>(ASAAS_WEBHOOK_TOKEN_CONFIG_KEY, null),
    ])

    const resolvedEnvironment = normalizeAsaasEnvironment(environment)
      ?? detectAsaasEnvironmentFromBaseUrl(legacyBaseUrl)

    return {
      apiKey: normalizeAsaasSecret(apiKey),
      baseUrl: getAsaasBaseUrl(resolvedEnvironment),
      webhookToken: normalizeAsaasSecret(webhookToken),
    }
  }

  static async getAdminConfig(): Promise<BillingAsaasAdminConfig> {
    const [environment, apiKey, legacyBaseUrl, webhookToken] = await Promise.all([
      getConfig<string | null>(ASAAS_ENVIRONMENT_CONFIG_KEY, null),
      getConfig<string | null>(ASAAS_API_KEY_CONFIG_KEY, null),
      getConfig<string | null>(ASAAS_BASE_URL_CONFIG_KEY, null),
      getConfig<string | null>(ASAAS_WEBHOOK_TOKEN_CONFIG_KEY, null),
    ])

    const resolvedEnvironment = normalizeAsaasEnvironment(environment)
      ?? detectAsaasEnvironmentFromBaseUrl(legacyBaseUrl)

    return {
      environment: resolvedEnvironment,
      hasApiKey: !!apiKey,
      hasWebhookToken: !!webhookToken,
    }
  }

  static async updateConfig(data: BillingAsaasConfigUpdate): Promise<BillingAsaasAdminConfig> {
    const environment = data.environment
    const apiKey = normalizeAsaasSecret(data.apiKey)
    const webhookToken = normalizeAsaasSecret(data.webhookToken)

    await setConfig(ASAAS_ENVIRONMENT_CONFIG_KEY, environment, 'string')

    if (apiKey) {
      await setConfig(ASAAS_API_KEY_CONFIG_KEY, apiKey, 'string')
    }

    if (webhookToken) {
      await setConfig(ASAAS_WEBHOOK_TOKEN_CONFIG_KEY, webhookToken, 'string')
    }

    const nextConfig = await this.getAdminConfig()

    billingLog('info', 'Billing Asaas configuration updated', {
      environment: nextConfig.environment,
      baseUrl: getAsaasBaseUrl(nextConfig.environment),
      hasApiKey: nextConfig.hasApiKey,
      hasWebhookToken: nextConfig.hasWebhookToken,
    })

    return nextConfig
  }
}
