'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { ListResourcesFilter, ResourceListResponse, CreateResourceInput, UpdateResourceInput } from '@/lib/schemas/admin/resources'

interface UseAdminResourcesOptions {
  filters?: Partial<ListResourcesFilter>
}

/**
 * Hook to fetch admin resources with pagination and filtering
 */
export function useAdminResources(options?: UseAdminResourcesOptions) {
  const filters = options?.filters || {}
  const page = filters.page || 1
  const limit = filters.limit || 20
  const q = filters.q || ''
  const educationLevel = filters.educationLevel || ''
  const subject = filters.subject || ''
  const isFree = filters.isFree !== undefined ? filters.isFree : ''
  const sortBy = filters.sortBy || 'updatedAt'
  const order = filters.order || 'desc'

  return useQuery<ResourceListResponse>({
    queryKey: ['admin-resources', { page, limit, q, educationLevel, subject, isFree, sortBy, order }],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      })

      if (q) params.append('q', q)
      if (educationLevel) params.append('educationLevel', educationLevel)
      if (subject) params.append('subject', subject)
      if (isFree !== '') params.append('isFree', String(isFree))
      params.append('sortBy', sortBy)
      params.append('order', order)

      const response = await fetch(`/api/v1/admin/resources?${params.toString()}`)
      if (!response.ok) {
        throw new Error('Failed to fetch resources')
      }
      return response.json()
    },
  })
}

/**
 * Hook to create a new admin resource
 */
export function useCreateAdminResource() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateResourceInput) => {
      const response = await fetch('/api/v1/admin/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create resource')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-resources'] })
    },
  })
}

/**
 * Hook to update an admin resource
 */
export function useUpdateAdminResource(resourceId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: UpdateResourceInput) => {
      const response = await fetch(`/api/v1/admin/resources/${resourceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update resource')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-resources'] })
    },
  })
}

/**
 * Hook to delete an admin resource
 */
export function useDeleteAdminResource(resourceId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/v1/admin/resources/${resourceId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete resource')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-resources'] })
    },
  })
}
