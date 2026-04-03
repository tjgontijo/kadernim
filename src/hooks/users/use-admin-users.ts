'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
    fetchAdminUserAccess,
    listAdminUsers,
    toggleAdminUserAccess,
    updateAdminUser,
    uploadAdminUserAvatar,
    deleteAdminUser,
} from '@/lib/users/api-client'
import type { ListUsersFilter, UserListResponse, UpdateUserInput, UserResourceAccessItem } from '@/lib/users/types'

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

            return listAdminUsers(params)
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
            return updateAdminUser(userId, data)
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
            return uploadAdminUserAvatar(userId, file)
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
            return deleteAdminUser(userId)
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
            return fetchAdminUserAccess(userId) as Promise<UserResourceAccessItem[]>
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
            return toggleAdminUserAccess(userId, { resourceId, hasAccess })
        },
        onSuccess: (_, { userId }) => {
            queryClient.invalidateQueries({ queryKey: ['admin-user-access', userId] })
            queryClient.invalidateQueries({ queryKey: ['admin-users'] })
        }
    })
}
