import type { ResourceFilter } from '@/lib/schemas/resource'

import type { ResourceListResult } from './resourceListService'
import { getResourceList } from './resourceListService'
import type { ResourceCountsResult } from './resourceCountService'
import { getResourceCounts } from './resourceCountService'
import type { ResourceMetaResult, ResourceMetaUser } from './resourceMetaService'
import { getResourceMeta } from './resourceMetaService'
import type { SubscriptionContext, UserAccessContext } from './accessService'

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
  const { q, educationLevel, subject } = filters

  const [listResult, countsResult, metaResult] = await Promise.all([
    getResourceList({
      user,
      subscription,
      filters,
    }),
    getResourceCounts({
      user,
      subscription,
      filters: { q, educationLevel, subject },
    }),
    Promise.resolve(
      getResourceMeta({
        filters: { educationLevel, subject },
        user: userMeta,
      })
    ),
  ])

  return {
    items: listResult.items,
    pagination: listResult.pagination,
    counts: countsResult,
    meta: metaResult,
  }
}
