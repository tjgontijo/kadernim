export const ASAAS_ENVIRONMENT_VALUES = ['sandbox', 'production'] as const

export type AsaasEnvironment = typeof ASAAS_ENVIRONMENT_VALUES[number]

export const ASAAS_ENVIRONMENT_LABELS: Record<AsaasEnvironment, string> = {
  sandbox: 'Sandbox',
  production: 'Produção',
}

export const ASAAS_BASE_URLS: Record<AsaasEnvironment, string> = {
  sandbox: 'https://api-sandbox.asaas.com/v3',
  production: 'https://api.asaas.com/v3',
}

export const DEFAULT_ASAAS_ENVIRONMENT: AsaasEnvironment = 'sandbox'
export const DEFAULT_ASAAS_BASE_URL = ASAAS_BASE_URLS[DEFAULT_ASAAS_ENVIRONMENT]

export function normalizeAsaasSecret(value?: string | null) {
  const normalized = value?.trim()
  return normalized ? normalized : null
}

export function normalizeAsaasBaseUrl(baseUrl?: string | null) {
  const normalized = baseUrl?.trim().replace(/\/+$/, '')
  return normalized || DEFAULT_ASAAS_BASE_URL
}

export function normalizeAsaasEnvironment(value?: string | null) {
  const normalized = value?.trim().toLowerCase()

  if (normalized === 'sandbox' || normalized === 'production') {
    return normalized as AsaasEnvironment
  }

  return null
}

export function getAsaasBaseUrl(environment?: AsaasEnvironment | null) {
  return ASAAS_BASE_URLS[environment ?? DEFAULT_ASAAS_ENVIRONMENT]
}

export function detectAsaasEnvironmentFromBaseUrl(baseUrl?: string | null): AsaasEnvironment {
  const normalized = normalizeAsaasBaseUrl(baseUrl)

  try {
    const url = new URL(normalized)
    return url.hostname === 'api.asaas.com' ? 'production' : 'sandbox'
  } catch {
    return DEFAULT_ASAAS_ENVIRONMENT
  }
}
