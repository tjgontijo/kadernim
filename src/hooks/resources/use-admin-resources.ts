'use client'

import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  createAdminResource,
  deleteAdminResource,
  fetchAdminResources,
  updateAdminResource,
} from '@/lib/resources/api-client'
import type {
  AdminResourceListResponse as ResourceListResponse,
  CreateResourceInput,
  ListResourcesFilter,
  UpdateResourceInput,
} from '@/lib/resources/types'

interface UseAdminResourcesOptions {
  filters?: Partial<ListResourcesFilter>
}

/**
 * Hook to fetch admin resources with pagination and filtering
 */
export function useAdminResources(options?: UseAdminResourcesOptions) {
  const filters = options?.filters || {}
  const limit = filters.limit || 20
  const q = filters.q || ''
  const educationLevel = filters.educationLevel || ''
  const grade = filters.grade || ''
  const subject = filters.subject || ''
  const isFree = filters.isFree !== undefined ? filters.isFree : ''
  const sortBy = filters.sortBy || 'updatedAt'
  const order = filters.order || 'desc'

  const query = useInfiniteQuery<ResourceListResponse>({
    queryKey: ['admin-resources', { limit, q, educationLevel, grade, subject, isFree, sortBy, order }],
    queryFn: ({ pageParam = 1 }) =>
      fetchAdminResources({
        page: pageParam as number,
        limit,
        q: q || undefined,
        educationLevel: educationLevel || undefined,
        grade: grade || undefined,
        subject: subject || undefined,
        isFree: isFree === '' ? undefined : Boolean(isFree),
        sortBy,
        order,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      return lastPage.pagination.hasMore ? lastPage.pagination.page + 1 : undefined
    },
  })

  return {
    ...query,
    data: query.data?.pages.flatMap(page => page.data) || [],
    pagination: query.data?.pages[query.data.pages.length - 1]?.pagination,
  }
}

/**
 * Hook to create a new admin resource
 */
export function useCreateAdminResource() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateResourceInput) => createAdminResource(data),
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
    mutationFn: (data: UpdateResourceInput) => updateAdminResource(resourceId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-resources'] })
      queryClient.invalidateQueries({ queryKey: ['admin-resource-detail', resourceId] })
    },
  })
}

/**
 * Hook to delete an admin resource
 */
export function useDeleteAdminResource() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (resourceId: string) => deleteAdminResource(resourceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-resources'] })
    },
  })
}
