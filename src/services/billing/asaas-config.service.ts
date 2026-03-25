import {
  detectAsaasEnvironmentFromBaseUrl,
  getAsaasBaseUrl,
  normalizeAsaasEnvironment,
  normalizeAsaasSecret,
  type AsaasEnvironment,
} from '@/lib/billing/asaas-config'
import { getConfig, setConfig } from '@/services/config/system-config'
import { billingLog } from './logger'
import type { BillingAsaasSettings, BillingAsaasSettingsUpdate } from '@/schemas/billing/asaas-settings-schemas'

// Active environment selector
const KEY_ENVIRONMENT       = 'billing.asaas.environment'

// Per-environment credentials (new keys)
const KEY_SANDBOX_API_KEY   = 'billing.asaas.sandbox.apiKey'
const KEY_SANDBOX_WEBHOOK   = 'billing.asaas.sandbox.webhookToken'
const KEY_PRODUCTION_API_KEY = 'billing.asaas.production.apiKey'
const KEY_PRODUCTION_WEBHOOK = 'billing.asaas.production.webhookToken'

// Legacy single-slot keys (read-only — migration fallback)
const KEY_LEGACY_API_KEY    = 'billing.asaas.apiKey'
const KEY_LEGACY_WEBHOOK    = 'billing.asaas.webhookToken'
const KEY_LEGACY_BASE_URL   = 'billing.asaas.baseUrl'

export interface BillingAsaasRuntimeConfig {
  apiKey: string | null
  baseUrl: string
  webhookToken: string | null
}

/** Returns first N chars + "…" to confirm a value exists without exposing it */
function maskSecret(value: string | null | undefined): string | null {
  const s = normalizeAsaasSecret(value)
  if (!s) return null
  return s.length > 12 ? s.slice(0, 12) + '…' : s
}

async function resolveActiveEnvironment(): Promise<AsaasEnvironment> {
  const [stored, legacyBaseUrl] = await Promise.all([
    getConfig<string | null>(KEY_ENVIRONMENT, null),
    getConfig<string | null>(KEY_LEGACY_BASE_URL, null),
  ])
  return normalizeAsaasEnvironment(stored) ?? detectAsaasEnvironmentFromBaseUrl(legacyBaseUrl)
}

async function resolveKey(envKey: string): Promise<string | null> {
  const stored = await getConfig<string | null>(envKey, null)
  return normalizeAsaasSecret(stored)
}

async function resolveKeyWithLegacyFallback(
  envKey: string,
  legacyKey: string,
): Promise<string | null> {
  return (await resolveKey(envKey)) ?? (await resolveKey(legacyKey))
}

export class BillingAsaasConfigService {
  static async getRuntimeConfig(): Promise<BillingAsaasRuntimeConfig> {
    const environment = await resolveActiveEnvironment()

    const [apiKey, webhookToken] = await Promise.all([
      resolveKeyWithLegacyFallback(
        environment === 'sandbox' ? KEY_SANDBOX_API_KEY : KEY_PRODUCTION_API_KEY,
        KEY_LEGACY_API_KEY,
      ),
      resolveKeyWithLegacyFallback(
        environment === 'sandbox' ? KEY_SANDBOX_WEBHOOK : KEY_PRODUCTION_WEBHOOK,
        KEY_LEGACY_WEBHOOK,
      ),
    ])

    return { apiKey, baseUrl: getAsaasBaseUrl(environment), webhookToken }
  }

  static async getAdminConfig(): Promise<BillingAsaasSettings> {
    const [
      environment,
      sbKey, sbWebhook,
      prodKey, prodWebhook,
      legacyKey, legacyWebhook,
    ] = await Promise.all([
      getConfig<string | null>(KEY_ENVIRONMENT, null),
      getConfig<string | null>(KEY_SANDBOX_API_KEY, null),
      getConfig<string | null>(KEY_SANDBOX_WEBHOOK, null),
      getConfig<string | null>(KEY_PRODUCTION_API_KEY, null),
      getConfig<string | null>(KEY_PRODUCTION_WEBHOOK, null),
      getConfig<string | null>(KEY_LEGACY_API_KEY, null),
      getConfig<string | null>(KEY_LEGACY_WEBHOOK, null),
    ])

    const resolvedEnv = normalizeAsaasEnvironment(environment) ?? detectAsaasEnvironmentFromBaseUrl(null)

    // Sandbox previews: dedicated key first, fallback to legacy if env was sandbox
    const sandboxKey = sbKey || (resolvedEnv === 'sandbox' ? legacyKey : null)
    const sandboxWebhook = sbWebhook || (resolvedEnv === 'sandbox' ? legacyWebhook : null)

    // Production previews: dedicated key first, fallback to legacy if env was production
    const productionKey = prodKey || (resolvedEnv === 'production' ? legacyKey : null)
    const productionWebhook = prodWebhook || (resolvedEnv === 'production' ? legacyWebhook : null)

    return {
      environment: resolvedEnv,
      sandbox: {
        apiKeyPreview: maskSecret(sandboxKey),
        webhookTokenPreview: maskSecret(sandboxWebhook),
      },
      production: {
        apiKeyPreview: maskSecret(productionKey),
        webhookTokenPreview: maskSecret(productionWebhook),
      },
    }
  }

  static async updateConfig(data: BillingAsaasSettingsUpdate): Promise<BillingAsaasSettings> {
    const saves: Promise<void>[] = [
      setConfig(KEY_ENVIRONMENT, data.environment, 'string'),
    ]

    const sbKey     = normalizeAsaasSecret(data.sandbox.apiKey)
    const sbWebhook = normalizeAsaasSecret(data.sandbox.webhookToken)
    const prodKey   = normalizeAsaasSecret(data.production.apiKey)
    const prodWebhook = normalizeAsaasSecret(data.production.webhookToken)

    if (sbKey)      saves.push(setConfig(KEY_SANDBOX_API_KEY, sbKey, 'string'))
    if (sbWebhook)  saves.push(setConfig(KEY_SANDBOX_WEBHOOK, sbWebhook, 'string'))
    if (prodKey)    saves.push(setConfig(KEY_PRODUCTION_API_KEY, prodKey, 'string'))
    if (prodWebhook) saves.push(setConfig(KEY_PRODUCTION_WEBHOOK, prodWebhook, 'string'))

    await Promise.all(saves)

    const next = await this.getAdminConfig()

    billingLog('info', 'Billing Asaas configuration updated', {
      environment: next.environment,
      baseUrl: getAsaasBaseUrl(next.environment),
    })

    return next
  }
}
