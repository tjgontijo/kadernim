'use client'

import { useQuery, useInfiniteQuery, useMutation, useQueryClient, type InfiniteData } from '@tanstack/react-query'
import { fetchResourceCounts, fetchResourceHighlights, fetchResourceMeta, fetchResourcesSummary, toggleResourceFavorite } from '@/lib/resources/api-client'
import type {
    Resource,
    ResourceDetail,
    ResourceHighlightsResponse,
    ResourceMetaResponse,
    ResourcesSummaryResponse,
} from '@/lib/resources/types'

// Types from use-resources-summary-query.ts
interface Filters {
    q?: string
    educationLevel?: string
    grade?: string
    subject?: string
}

export type SummaryTab = 'all' | 'mine' | 'favorites'

export interface UseResourcesSummaryQueryParams {
    tab: SummaryTab
    pageSize: number
    filters: Filters
}

/**
 * Hook to fetch resource metadata (education levels, subjects, grades)
 */
export function useResourceMeta() {
    return useQuery<ResourceMetaResponse>({
        queryKey: ['resource-meta'],
        queryFn: fetchResourceMeta,
        staleTime: 1000 * 60 * 60, // 1 hour
    })
}

/**
 * Hook to fetch library and user favorites counts
 */
export function useResourceCounts() {
    return useQuery({
        queryKey: ['resource-counts'],
        queryFn: fetchResourceCounts,
        staleTime: 1000 * 60 * 60, // 1 hour (as requested)
    })
}

/**
 * Hook to fetch paginated resources with filters and summary counts
 */
export function useResourcesSummaryQuery({
    tab,
    pageSize,
    filters,
}: UseResourcesSummaryQueryParams) {
    const query = useInfiniteQuery<ResourcesSummaryResponse, Error>({
        queryKey: ['resources-summary', tab, filters],

        queryFn: ({ pageParam = 1 }) =>
            fetchResourcesSummary({
                page: Number(pageParam),
                limit: pageSize,
                tab,
                q: filters.q?.trim().length && filters.q.trim().length >= 2 ? filters.q.trim() : undefined,
                educationLevel: filters.educationLevel,
                grade: filters.grade,
                subject: filters.subject,
            }),

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

export function useResourceHighlightsQuery() {
    return useQuery<ResourceHighlightsResponse>({
        queryKey: ['resources-highlights'],
        queryFn: fetchResourceHighlights,
        staleTime: 60_000,
        gcTime: 5 * 60_000,
        refetchOnWindowFocus: false,
    })
}

/**
 * Hook to toggle a resource as favorite
 */
export function useToggleFavorite() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (resourceId: string) => toggleResourceFavorite(resourceId),
        onMutate: async (resourceId) => {
            // Cancelar queries para não sobrescrever o update otimista
            await queryClient.cancelQueries({ queryKey: ['resources-summary'] })
            await queryClient.cancelQueries({ queryKey: ['resource-detail', resourceId] })

            // Snapshot de todas as listagens que podem conter este recurso
            const previousQueries = queryClient.getQueriesData<InfiniteData<ResourcesSummaryResponse>>({ 
                queryKey: ['resources-summary'] 
            })
            
            const previousDetail = queryClient.getQueryData<ResourceDetail>(['resource-detail', resourceId])

            // 1. Atualizar listagens otimisticamente
            queryClient.setQueriesData<InfiniteData<ResourcesSummaryResponse>>(
                { queryKey: ['resources-summary'] },
                (old) => {
                    if (!old) return old
                    return {
                        ...old,
                        pages: old.pages.map(page => ({
                            ...page,
                            items: page.items.map(item => 
                                item.id === resourceId 
                                    ? { ...item, isFavorite: !item.isFavorite } 
                                    : item
                            )
                        }))
                    }
                }
            )

            // 2. Atualizar detalhe otimisticamente
            if (previousDetail) {
                queryClient.setQueryData<ResourceDetail>(
                    ['resource-detail', resourceId],
                    { ...previousDetail, isFavorite: !previousDetail.isFavorite }
                )
            }

            return { previousQueries, previousDetail }
        },
        onError: (err, resourceId, context) => {
            // Rollback de todas as listagens afetadas
            context?.previousQueries?.forEach(([queryKey, data]) => {
                queryClient.setQueryData(queryKey, data)
            })
            
            // Rollback do detalhe
            if (context?.previousDetail) {
                queryClient.setQueryData(['resource-detail', resourceId], context.previousDetail)
            }
        },
        onSettled: (_, __, resourceId) => {
            queryClient.invalidateQueries({ queryKey: ['resources-summary'] })
            queryClient.invalidateQueries({ queryKey: ['resource-detail', resourceId] })
            queryClient.invalidateQueries({ queryKey: ['resource-counts'] })
        },
    })
}
