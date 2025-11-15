import { useInfiniteQuery, type InfiniteData } from '@tanstack/react-query'

import type { Resource } from '@/lib/schemas/resource'

interface Filters {
  q?: string
  educationLevel?: string
  subject?: string
}

export type SummaryTab = 'all' | 'mine' | 'free'

export interface UseResourcesSummaryQueryParams {
  tab: SummaryTab
  pageSize: number
  filters: Filters
}

export interface ResourcesSummaryResponse {
  items: Resource[]
  pagination: {
    page: number
    limit: number
    hasMore: boolean
  }
  counts: {
    all: number
    mine: number
    free: number
  }
  meta: {
    educationLevels: { key: string; label: string }[]
    subjects: { key: string; label: string }[]
    user: {
      role: string | null
      isAdmin: boolean
      isSubscriber: boolean
    }
  }
}

export function useResourcesSummaryQuery({
  tab,
  pageSize,
  filters,
}: UseResourcesSummaryQueryParams) {
  const query = useInfiniteQuery<ResourcesSummaryResponse, Error>({
    queryKey: ['resources-summary', tab, filters],

    queryFn: async ({ pageParam = 1 }) => {
      const params = new URLSearchParams()

      params.set('page', String(pageParam))
      params.set('limit', String(pageSize))
      params.set('tab', tab)

      if (filters.q && filters.q.trim().length >= 2) {
        params.set('q', filters.q.trim())
      }
      if (filters.educationLevel) {
        params.set('educationLevel', filters.educationLevel)
      }
      if (filters.subject) {
        params.set('subject', filters.subject)
      }

      const res = await fetch('/api/v1/resources/summary?' + params.toString())
      if (!res.ok) {
        throw new Error('Erro ao carregar recursos')
      }

      const json: ResourcesSummaryResponse = await res.json()
      return json
    },

    getNextPageParam: lastPage => {
      return lastPage.pagination.hasMore
        ? lastPage.pagination.page + 1
        : undefined
    },

    initialPageParam: 1,

    staleTime: 30_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: (failureCount, error) => {
      // Em caso de erros não relacionados a auth/rate limit, tentar poucas vezes
      const message = (error as Error | undefined)?.message ?? ''
      if (message.includes('401') || message.includes('429')) return false
      return failureCount < 2
    },
  })

  const data = query.data as InfiniteData<ResourcesSummaryResponse> | undefined

  const items = data?.pages.flatMap((p) => p.items) ?? []
  const counts = data?.pages[0]?.counts
  const meta = data?.pages[0]?.meta

  return {
    items,
    counts,
    meta,
    fetchNextPage: query.fetchNextPage,
    hasNextPage: query.hasNextPage,
    isLoading: query.isLoading,
    isFetchingNextPage: query.isFetchingNextPage,
  }
}
