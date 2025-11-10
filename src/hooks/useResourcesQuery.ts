import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'

import type { Resource, ResourceListResponse } from '@/lib/schemas/resource'

export type ResourceTab = 'mine' | 'free' | 'all'

export interface ResourcesFilters {
  q?: string
  educationLevel?: string
  subject?: string
}

export interface UseResourcesQueryParams {
  tab: ResourceTab
  filters: ResourcesFilters
  pageSize?: number
}

export function useResourcesQuery({ tab, filters, pageSize = 20 }: UseResourcesQueryParams) {
  const queryClient = useQueryClient()
  const normalizedFilters = useMemo(() => {
    const nf: ResourcesFilters = {}
    if (filters.q && filters.q.length >= 2) nf.q = filters.q
    if (filters.educationLevel) nf.educationLevel = filters.educationLevel
    if (filters.subject) nf.subject = filters.subject
    return nf
  }, [filters.q, filters.educationLevel, filters.subject])

  const queryKey = ['resources', `tab:${tab}`, normalizedFilters, pageSize] as const

  const query = useInfiniteQuery<{ data: Resource[]; pagination: { page: number; limit: number; hasMore: boolean } }, Error>({
    queryKey,
    queryFn: async ({ pageParam = 1 }) => {
      const params = new URLSearchParams()
      params.set('page', String(pageParam))
      params.set('limit', String(pageSize))
      params.set('tab', tab)
      if (normalizedFilters.q) params.set('q', normalizedFilters.q)
      if (normalizedFilters.educationLevel) params.set('educationLevel', normalizedFilters.educationLevel)
      if (normalizedFilters.subject) params.set('subject', normalizedFilters.subject)

      const res = await fetch(`/api/v1/resources?${params.toString()}`)
      if (res.status === 401) {
        queryClient.clear()
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
      if (!res.ok) throw new Error('Falha ao buscar recursos')
      const json: ResourceListResponse = await res.json()
      return json
    },
    getNextPageParam: (lastPage) => (lastPage.pagination.hasMore ? lastPage.pagination.page + 1 : undefined),
    initialPageParam: 1,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: (failureCount, error: unknown) => {
      const status = (error as { status?: number } | undefined)?.status
      if (status === 429 || status === 401) return false
      return failureCount < 2
    },
  })

  const items = useMemo(() => (query.data?.pages ?? []).flatMap((p) => p.data), [query.data?.pages])

  return {
    items,
    pages: query.data?.pages ?? [],
    fetchNextPage: query.fetchNextPage,
    hasNextPage: query.hasNextPage ?? false,
    isFetching: query.isFetching,
    isFetchingNextPage: query.isFetchingNextPage,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  }
}
