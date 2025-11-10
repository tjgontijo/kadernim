import type { ResourceFilter } from '@/lib/schemas/resource'

export type ResourceCacheFilters = Pick<
  ResourceFilter,
  'q' | 'educationLevel' | 'subject' | 'tab' | 'page' | 'limit'
>

export interface BuildResourceCacheKeyParams {
  userId: string
  isSubscriber: boolean
  filters: ResourceCacheFilters
}

export function buildResourceCacheKey({
  userId,
  isSubscriber,
  filters,
}: BuildResourceCacheKeyParams): string[] {
  return [
    'resources',
    userId,
    isSubscriber ? 'sub:1' : 'sub:0',
    `tab:${filters.tab}`,
    filters.q ?? '',
    filters.educationLevel ?? '',
    filters.subject ?? '',
    `page:${filters.page}`,
    `limit:${filters.limit}`,
  ]
}

export function buildResourceCacheTag(userId: string): string {
  return `resources:${userId}`
}
