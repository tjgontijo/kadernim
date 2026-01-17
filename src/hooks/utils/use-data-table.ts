'use client'

import { useState, useEffect, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { ViewType } from '@/components/admin/crud'

interface FetchParams {
    page: number
    limit: number
    q: string
    [key: string]: any
}

interface useDataTableOptions<T> {
    queryKey: string[]
    endpoint: string
    initialLimit?: number
    onSuccess?: () => void
}

export function useDataTable<T>({
    queryKey,
    endpoint,
    initialLimit = 15,
    onSuccess
}: useDataTableOptions<T>) {
    const queryClient = useQueryClient()
    const [page, setPage] = useState(1)
    const [limit, setLimit] = useState(initialLimit)
    const [searchInput, setSearchInput] = useState('')
    const [searchQuery, setSearchQuery] = useState('')
    const [view, setView] = useState<ViewType>('list')
    const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false)
    const [itemToEdit, setItemToEdit] = useState<T | null>(null)
    const [filters, setFilters] = useState<Record<string, any>>({})

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setSearchQuery(searchInput)
            setPage(1)
        }, 400)
        return () => clearTimeout(timer)
    }, [searchInput])

    const { data, isLoading, error, refetch } = useQuery({
        queryKey: [...queryKey, { page, limit, q: searchQuery, ...filters }],
        queryFn: async () => {
            const params = new URLSearchParams({
                page: page.toString(),
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
        }
    })

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

    const handlePageChange = useCallback((newPage: number) => {
        setPage(newPage)
    }, [])

    const handleLimitChange = useCallback((newLimit: number) => {
        setLimit(newLimit)
        setPage(1)
    }, [])

    const handleFilterChange = useCallback((newFilters: Record<string, any>) => {
        setFilters(prev => ({ ...prev, ...newFilters }))
        setPage(1)
    }, [])

    const clearFilters = useCallback(() => {
        setFilters({})
        setSearchInput('')
        setSearchQuery('')
        setPage(1)
    }, [])

    return {
        // Data & State
        data: data?.data ?? [],
        pagination: data?.pagination,
        isLoading,
        error,
        view,
        setView,

        // Search & Filter
        searchInput,
        setSearchInput,
        filters,
        handleFilterChange,
        clearFilters,

        // Pagination
        page,
        limit,
        handlePageChange,
        handleLimitChange,

        // Actions
        isEditDrawerOpen,
        setIsEditDrawerOpen,
        itemToEdit,
        openCreate,
        openEdit,
        deleteItem: deleteMutation.mutate,
        isDeleting: deleteMutation.isPending,
        refetch
    }
}
