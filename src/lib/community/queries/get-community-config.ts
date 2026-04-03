import { getCommunityConfig as getSystemCommunityConfig } from '@/services/config/system-config'
import type { CommunityConfig } from '@/lib/community/types'

export async function getCommunityConfig(): Promise<CommunityConfig> {
  return getSystemCommunityConfig()
}
