import { z } from 'zod'

// ============================================
// LIST USERS FILTER SCHEMA
// ============================================
export const ListUsersFilterSchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(15),
    q: z.string().trim().max(100).optional(),
    role: z.enum(['user', 'subscriber', 'admin']).optional(),
    banned: z.preprocess((val) => (val === 'true' ? true : val === 'false' ? false : undefined), z.boolean().optional()),
    emailVerified: z.preprocess((val) => (val === 'true' ? true : val === 'false' ? false : undefined), z.boolean().optional()),
    hasSubscription: z.preprocess((val) => (val === 'true' ? true : val === 'false' ? false : undefined), z.boolean().optional()),
    subscriptionActive: z.preprocess((val) => (val === 'true' ? true : val === 'false' ? false : undefined), z.boolean().optional()),
    sortBy: z.enum(['name', 'email', 'createdAt', 'role']).default('createdAt'),
    order: z.enum(['asc', 'desc']).default('desc'),
})

export type ListUsersFilter = z.infer<typeof ListUsersFilterSchema>

// ============================================
// UPDATE USER SCHEMA
// ============================================
export const UpdateUserSchema = z.object({
    name: z.string().min(2).max(100).optional(),
    email: z.string().email().max(100).optional(),
    phone: z.string().max(30).optional().nullable(),
    role: z.enum(['user', 'subscriber', 'admin']).optional(),
    banned: z.boolean().optional(),
})

export type UpdateUserInput = z.infer<typeof UpdateUserSchema>

// ============================================
// USER LIST RESPONSE SCHEMA
// ============================================
export const UserListResponseSchema = z.object({
    data: z.array(z.object({
        id: z.string(),
        name: z.string(),
        email: z.string(),
        phone: z.string().nullable(),
        image: z.string().nullable(),
        role: z.enum(['user', 'subscriber', 'admin']),
        emailVerified: z.boolean(),
        banned: z.boolean(),
        subscription: z.object({
            isActive: z.boolean(),
            expiresAt: z.string().nullable(),
        }).nullable(),
        resourceAccessCount: z.number(),
        createdAt: z.string(),
        updatedAt: z.string(),
    })),
    pagination: z.object({
        page: z.number().int().positive(),
        limit: z.number().int().positive(),
        total: z.number().int().nonnegative(),
        totalPages: z.number().int().nonnegative(),
        hasMore: z.boolean(),
    }),
})

export type UserListResponse = z.infer<typeof UserListResponseSchema>
