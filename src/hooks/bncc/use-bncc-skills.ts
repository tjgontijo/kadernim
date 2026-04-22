'use client'

import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { fetchBnccSkillDetail, fetchBnccSkills } from '@/lib/bncc/api-client/bncc-client'
import type { BnccSkillsListResponse } from '@/lib/bncc/schemas/bncc-schemas'

interface BnccFilters {
  q?: string
  educationLevel?: string
  grades?: string[]
  subject?: string
}

export function useBnccSkills(filters: BnccFilters, pageSize = 30, enabled = true) {
  const query = useInfiniteQuery<BnccSkillsListResponse, Error>({
    queryKey: ['bncc-skills', filters, pageSize],
    queryFn: ({ pageParam = 1 }) =>
      fetchBnccSkills({
        page: Number(pageParam),
        limit: pageSize,
        q: filters.q?.trim() || undefined,
        educationLevel: filters.educationLevel,
        grade: filters.grades,
        subject: filters.subject,
      }),
    getNextPageParam: (lastPage) => (
      lastPage.pagination.hasMore ? lastPage.pagination.page + 1 : undefined
    ),
    initialPageParam: 1,
    enabled,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: false,
  })

  const items = query.data?.pages.flatMap((page) => page.data) ?? []

  return {
    items,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isFetchingNextPage: query.isFetchingNextPage,
    fetchNextPage: query.fetchNextPage,
    hasNextPage: query.hasNextPage,
    error: query.error,
  }
}

export function useBnccSkillDetail(skillId?: string) {
  return useQuery({
    queryKey: ['bncc-skill-detail', skillId],
    queryFn: () => fetchBnccSkillDetail(skillId!),
    enabled: Boolean(skillId),
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: false,
  })
}
