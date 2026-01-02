'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { ListUsersFilter, UserListResponse, UpdateUserInput } from '@/lib/schemas/admin/users'

interface UseAdminUsersOptions {
    filters?: Partial<ListUsersFilter>
}

/**
 * Hook to fetch admin users with pagination and filtering
 */
export function useAdminUsers(options?: UseAdminUsersOptions) {
    const filters = options?.filters || {}
    const page = filters.page || 1
    const limit = filters.limit || 15
    const q = filters.q || ''
    const role = filters.role || ''
    const banned = filters.banned
    const emailVerified = filters.emailVerified
    const hasSubscription = filters.hasSubscription
    const subscriptionActive = filters.subscriptionActive
    const sortBy = filters.sortBy || 'createdAt'
    const order = filters.order || 'desc'

    return useQuery<UserListResponse>({
        queryKey: ['admin-users', { page, limit, q, role, banned, emailVerified, hasSubscription, subscriptionActive, sortBy, order }],
        queryFn: async () => {
            const params = new URLSearchParams({
                page: String(page),
                limit: String(limit),
            })

            if (q) params.append('q', q)
            if (role) params.append('role', role)
            if (banned !== undefined) params.append('banned', String(banned))
            if (emailVerified !== undefined) params.append('emailVerified', String(emailVerified))
            if (hasSubscription !== undefined) params.append('hasSubscription', String(hasSubscription))
            if (subscriptionActive !== undefined) params.append('subscriptionActive', String(subscriptionActive))
            params.append('sortBy', sortBy)
            params.append('order', order)

            const response = await fetch(`/api/v1/admin/users?${params.toString()}`)
            if (!response.ok) {
                throw new Error('Failed to fetch users')
            }
            return response.json()
        },
    })
}

/**
 * Hook to update an admin user
 */
export function useUpdateAdminUser() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ userId, data }: { userId: string; data: UpdateUserInput }) => {
            const response = await fetch(`/api/v1/admin/users/${userId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Failed to update user')
            }

            return response.json()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-users'] })
        },
    })
}

/**
 * Hook to upload a user avatar
 */
export function useUploadUserAvatar() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ userId, file }: { userId: string; file: File }) => {
            const formData = new FormData()
            formData.append('file', file)

            const response = await fetch(`/api/v1/admin/users/${userId}/avatar`, {
                method: 'POST',
                body: formData,
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Failed to upload avatar')
            }

            return response.json()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-users'] })
        },
    })
}

/**
 * Hook to delete an admin user
 */
export function useDeleteAdminUser() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (userId: string) => {
            const response = await fetch(`/api/v1/admin/users/${userId}`, {
                method: 'DELETE',
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Failed to delete user')
            }

            return response.json()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-users'] })
        },
    })
}

/**
 * Hook to fetch user resource access
 */
export function useUserAccess(userId: string) {
    return useQuery({
        queryKey: ['admin-user-access', userId],
        queryFn: async () => {
            const response = await fetch(`/api/v1/admin/users/${userId}/access`)
            if (!response.ok) throw new Error('Failed to fetch user access')
            return response.json() as Promise<Array<{
                id: string
                title: string
                isFree: boolean
                educationLevel: string
                subject: string
                hasAccess: boolean
            }>>
        },
        enabled: !!userId
    })
}

/**
 * Hook to toggle user resource access
 */
export function useToggleUserAccess() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ userId, resourceId, hasAccess }: { userId: string, resourceId: string, hasAccess: boolean }) => {
            const response = await fetch(`/api/v1/admin/users/${userId}/access`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resourceId, hasAccess })
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Failed to toggle access')
            }

            return response.json()
        },
        onSuccess: (_, { userId }) => {
            queryClient.invalidateQueries({ queryKey: ['admin-user-access', userId] })
            queryClient.invalidateQueries({ queryKey: ['admin-users'] })
        }
    })
}
