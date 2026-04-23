'use client'

import { useState, useDeferredValue, useCallback, useMemo } from 'react'
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { ViewType } from '@/components/dashboard/crud'

interface useInfiniteDataTableOptions<T> {
    queryKey: string[]
    endpoint: string
    initialLimit?: number
    onSuccess?: () => void
}

export function useInfiniteDataTable<T>({
    queryKey,
    endpoint,
    initialLimit = 15,
    onSuccess
}: useInfiniteDataTableOptions<T>) {
    const queryClient = useQueryClient()
    const [limit, setLimit] = useState(initialLimit)
    const [searchInput, setSearchInput] = useState('')
    const searchQuery = useDeferredValue(searchInput)
    const [view, setView] = useState<ViewType>('list')
    const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false)
    const [itemToEdit, setItemToEdit] = useState<T | null>(null)
    const [filters, setFilters] = useState<Record<string, any>>({})

    const query = useInfiniteQuery({
        queryKey: [...queryKey, { limit, q: searchQuery, ...filters }],
        queryFn: async ({ pageParam = 1 }) => {
            const params = new URLSearchParams({
                page: pageParam.toString(),
                limit: limit.toString(),
                q: searchQuery,
                ...Object.fromEntries(
                    Object.entries(filters).map(([k, v]) => [k, String(v)])
                )
            })
            const response = await fetch(`${endpoint}?${params}`)
            if (!response.ok) throw new Error('Falha ao carregar dados')
            return response.json() as Promise<{
                data: T[]
                pagination: {
                    total: number
                    page: number
                    limit: number
                    totalPages: number
                    hasMore: boolean
                }
            }>
        },
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            return lastPage.pagination.hasMore ? lastPage.pagination.page + 1 : undefined
        }
    })

    const items = useMemo(() => {
        return query.data?.pages.flatMap(page => page.data) ?? []
    }, [query.data])

    const lastPagination = useMemo(() => {
        if (!query.data?.pages.length) return undefined
        return query.data.pages[query.data.pages.length - 1].pagination
    }, [query.data])

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const response = await fetch(`${endpoint}/${id}`, {
                method: 'DELETE'
            })
            if (!response.ok) {
                const err = await response.json().catch(() => ({}))
                throw new Error(err.error || 'Erro ao deletar item')
            }
            return response.status === 204 ? null : response.json()
        },
        onSuccess: () => {
            toast.success('Item removido com sucesso')
            queryClient.invalidateQueries({ queryKey })
            onSuccess?.()
        },
        onError: (err: Error) => {
            toast.error(err.message)
        }
    })

    const openCreate = useCallback(() => {
        setItemToEdit(null)
        setIsEditDrawerOpen(true)
    }, [])

    const openEdit = useCallback((item: T) => {
        setItemToEdit(item)
        setIsEditDrawerOpen(true)
    }, [])

    const handleLimitChange = useCallback((newLimit: number) => {
        setLimit(newLimit)
    }, [])

    const handleFilterChange = useCallback((newFilters: Record<string, any>) => {
        setFilters(prev => ({ ...prev, ...newFilters }))
    }, [])

    const clearFilters = useCallback(() => {
        setFilters({})
        setSearchInput('')
    }, [])

    const handleSearchChange = useCallback((value: string) => {
        setSearchInput(value)
    }, [])

    return {
        // Data & State
        data: items,
        pagination: lastPagination,
        isLoading: query.isLoading,
        isFetching: query.isFetching,
        isFetchingNextPage: query.isFetchingNextPage,
        hasNextPage: query.hasNextPage,
        fetchNextPage: query.fetchNextPage,
        error: query.error,
        view,
        setView,

        // Search & Filter
        searchInput,
        setSearchInput: handleSearchChange,
        filters,
        handleFilterChange,
        clearFilters,

        // Pagination (limit only, page is internal to useInfiniteQuery)
        limit,
        handleLimitChange,

        // Actions
        isEditDrawerOpen,
        setIsEditDrawerOpen,
        itemToEdit,
        openCreate,
        openEdit,
        deleteItem: deleteMutation.mutate,
        isDeleting: deleteMutation.isPending,
        refetch: query.refetch
    }
}
