import { useMemo } from 'react'
import {
  useQueries,
  type UseQueryOptions,
  type UseQueryResult,
} from '@tanstack/react-query'

import type { ResourceTab } from '@/hooks/useResourcesQuery'

const TABS: ResourceTab[] = ['mine', 'free', 'all']

export interface ResourceCountFilters {
  q?: string
  educationLevel?: string
  subject?: string
}

interface ResourceCountResponse {
  data: {
    tab: ResourceTab
    count: number
  }
}

interface UseResourceCountsParams {
  filtersByTab: Record<ResourceTab, ResourceCountFilters>
}

export interface ResourceCountsResult {
  counts: Partial<Record<ResourceTab, number>>
  isLoading: boolean
  isFetching: boolean
  queries: UseQueryResult<number, Error>[]
}

export function useResourceCounts({ filtersByTab }: UseResourceCountsParams): ResourceCountsResult {
  const queryOptions = useMemo<UseQueryOptions<number, Error>[]>(() => {
    return TABS.map((tab) => {
      const filters = filtersByTab[tab]
      const queryKey = [
        'resource-count',
        tab,
        filters.q ?? '',
        filters.educationLevel ?? '',
        filters.subject ?? '',
      ] as const

      return {
        queryKey,
        queryFn: async () => {
          const params = new URLSearchParams()
          params.set('tab', tab)
          if (filters.q) params.set('q', filters.q)
          if (filters.educationLevel) params.set('educationLevel', filters.educationLevel)
          if (filters.subject) params.set('subject', filters.subject)

          const res = await fetch(`/api/v1/resources/counts?${params.toString()}`)
          if (res.status === 401) {
            window.location.href = '/login/otp'
            const err = new Error('Unauthorized (401)') as Error & { status?: number }
            err.status = 401
            throw err
          }
          if (res.status === 429) {
            const err = new Error('Rate limited (429)') as Error & { status?: number }
            err.status = 429
            throw err
          }
          if (!res.ok) {
            throw new Error('Falha ao buscar contagem de recursos')
          }

          const json = (await res.json()) as ResourceCountResponse
          return json.data.count
        },
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
      } satisfies UseQueryOptions<number, Error>
    })
  }, [filtersByTab])

  const queries = useQueries({ queries: queryOptions }) as UseQueryResult<number, Error>[]

  const counts: Partial<Record<ResourceTab, number>> = {}
  queries.forEach((query, index) => {
    const tab = TABS[index]
    if (typeof query.data === 'number') counts[tab] = query.data
  })

  const isLoading = queries.some((query) => query.isLoading)
  const isFetching = queries.some((query) => query.isFetching)

  return {
    counts,
    isLoading,
    isFetching,
    queries,
  }
}
