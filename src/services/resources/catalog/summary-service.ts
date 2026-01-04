import type { ResourceFilter } from '@/lib/schemas/resource'

import type { ResourceListResult } from './list-service'
import { getResourceList } from './list-service'
import type { ResourceCountsResult } from './count-service'
import { getResourceCounts } from './count-service'
import type { ResourceMetaResult, ResourceMetaUser } from './meta-service'
import { getResourceMeta } from './meta-service'
import type { SubscriptionContext, UserAccessContext } from '../../auth/access-service'

export interface ResourceSummaryParams {
  user: UserAccessContext
  subscription: SubscriptionContext
  filters: ResourceFilter
  userMeta: ResourceMetaUser
}

export interface ResourceSummaryResult {
  items: ResourceListResult['items']
  pagination: ResourceListResult['pagination']
  counts: ResourceCountsResult
  meta: ResourceMetaResult
}

/**
 * Service orquestrador que compõe o payload completo esperado pela
 * rota GET /api/v1/resources/summary, conforme PRD.
 */
export async function getResourceSummary({
  user,
  subscription,
  filters,
  userMeta,
}: ResourceSummaryParams): Promise<ResourceSummaryResult> {
  const { q, educationLevel, grade, subject } = filters

  const [listResult, countsResult, metaResult] = await Promise.all([
    getResourceList({
      user,
      subscription,
      filters,
    }),
    getResourceCounts({
      user,
      subscription,
      filters: { q, educationLevel, grade, subject },
    }),
    getResourceMeta({
      filters: { educationLevel, grade, subject },
      user: userMeta,
    }),
  ])

  return {
    items: listResult.items,
    pagination: listResult.pagination,
    counts: countsResult,
    meta: metaResult,
  }
}
