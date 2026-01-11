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

export async function getCommunityConfig() {
  const [
    votesSubscriber,
    votesEditor,
    votesManager,
    votesAdmin,
    requestsLimit,
    requestsMinVotes,
    uploadsMaxFiles,
    uploadsMaxSizeMB,
    bnccMaxSkills,
  ] = await Promise.all([
    getConfig('community.votes.subscriber', 5),
    getConfig('community.votes.editor', 10),
    getConfig('community.votes.manager', 20),
    getConfig('community.votes.admin', 999),
    getConfig('community.requests.limit', 1),
    getConfig('community.requests.minVotes', 1),
    getConfig('community.uploads.maxFiles', 5),
    getConfig('community.uploads.maxSizeMB', 2),
    getConfig('community.bncc.maxSkills', 5),
  ])

  return {
    votes: {
      subscriber: votesSubscriber,
      editor: votesEditor,
      manager: votesManager,
      admin: votesAdmin,
    },
    requests: {
      limit: requestsLimit,
      minVotes: requestsMinVotes,
    },
    uploads: {
      maxFiles: uploadsMaxFiles,
      maxSizeMB: uploadsMaxSizeMB,
    },
    bncc: {
      maxSkills: bnccMaxSkills,
    },
  }
}

export function getVoteLimitByRole(role: UserRoleType, config: Awaited<ReturnType<typeof getCommunityConfig>>) {
  switch (role) {
    case 'admin': return config.votes.admin
    case 'manager': return config.votes.manager
    case 'editor': return config.votes.editor
    case 'subscriber': return config.votes.subscriber
    default: return 0 // user não pode votar
  }
}
