import type { PoolConfig } from 'pg'

export function createPrismaPgPoolConfig(
  connectionString: string | undefined
): PoolConfig {
  if (!connectionString) {
    return {}
  }

  return { connectionString }
}
