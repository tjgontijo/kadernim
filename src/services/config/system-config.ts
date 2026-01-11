import { prisma } from '@/lib/db'
import { type UserRoleType } from '@/types/user-role'

// Cache em memória (5 minutos)
const configCache = new Map<string, { value: any; expiresAt: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutos

/**
 * Busca uma configuração do sistema com cache
 */
export async function getConfig<T>(key: string, defaultValue: T): Promise<T> {
  // Verificar cache
  const cached = configCache.get(key)
  if (cached && cached.expiresAt > Date.now()) {
    return cached.value as T
  }

  // Buscar do banco
  const config = await prisma.systemConfig.findUnique({
    where: { key }
  })

  if (!config) return defaultValue

  // Parse baseado no tipo
  let value: any
  switch (config.type) {
    case 'number':
      value = Number(config.value)
      break
    case 'boolean':
      value = config.value === 'true'
      break
    case 'json':
      value = JSON.parse(config.value)
      break
    default:
      value = config.value
  }

  // Atualizar cache
  configCache.set(key, { value, expiresAt: Date.now() + CACHE_TTL })

  return value as T
}

/**
 * Atualiza uma configuração do sistema e limpa o cache
 */
export async function setConfig(key: string, value: any, type: 'string' | 'number' | 'boolean' | 'json') {
  const stringValue = type === 'json' ? JSON.stringify(value) : String(value)

  await prisma.systemConfig.upsert({
    where: { key },
    create: {
      key,
      value: stringValue,
      type
    },
    update: {
      value: stringValue,
      type
    }
  })

  // Limpar cache
  configCache.delete(key)
}

/**
 * Limpa todo o cache de configurações
 */
export function clearConfigCache() {
  configCache.clear()
}

// ============================================
// Community Config Helpers
// ============================================

/**
 * Retorna as configurações da comunidade que ainda são relevantes.
 * Removemos limites de votos e outras restrições desnecessárias.
 */
export async function getCommunityConfig() {
  const [
    requestsLimit,
    uploadsMaxFiles,
    uploadsMaxSizeMB,
  ] = await Promise.all([
    getConfig('community.requests.limit', 2),
    getConfig('community.uploads.maxFiles', 5),
    getConfig('community.uploads.maxSizeMB', 2),
  ])

  return {
    requests: {
      limit: requestsLimit,
    },
    uploads: {
      maxFiles: uploadsMaxFiles,
      maxSizeMB: uploadsMaxSizeMB,
    }
  }
}

// getVoteLimitByRole removed - votes are now unlimited for subscribers
