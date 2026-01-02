import { prisma } from '@/lib/db'
import { Prisma } from '@db/client'
import { ListUsersFilter } from '@/lib/schemas/admin/users'

interface ListUsersResponse {
    data: Array<{
        id: string
        name: string
        email: string
        phone: string | null
        image: string | null
        role: 'user' | 'subscriber' | 'admin'
        emailVerified: boolean
        banned: boolean
        subscription: {
            isActive: boolean
            expiresAt: Date | null
        } | null
        resourceAccessCount: number
        createdAt: Date
        updatedAt: Date
    }>
    pagination: {
        page: number
        limit: number
        total: number
        totalPages: number
        hasMore: boolean
    }
}

/**
 * List users with filters and pagination for admin (client)
 */
export async function listUsersService(
    filters: ListUsersFilter
): Promise<ListUsersResponse> {
    const {
        page,
        limit,
        q,
        role,
        banned,
        emailVerified,
        hasSubscription,
        subscriptionActive,
        sortBy,
        order
    } = filters

    const whereConditions: Prisma.UserWhereInput = {}

    // Search by name or email
    if (q) {
        whereConditions.OR = [
            { name: { contains: q, mode: 'insensitive' } },
            { email: { contains: q, mode: 'insensitive' } },
        ]
    }

    // Filter by role
    if (role) {
        whereConditions.role = role
    }

    // Filter by banned status
    if (banned !== undefined) {
        whereConditions.banned = banned
    }

    // Filter by email verification status
    if (emailVerified !== undefined) {
        whereConditions.emailVerified = emailVerified
    }

    // Filter by subscription existence
    if (hasSubscription !== undefined) {
        if (hasSubscription) {
            whereConditions.subscription = { isNot: null }
        } else {
            whereConditions.subscription = { is: null }
        }
    }

    // Filter by subscription active status
    if (subscriptionActive !== undefined) {
        whereConditions.subscription = {
            ...((whereConditions.subscription as any) || {}),
            isActive: subscriptionActive
        }
    }

    const total = await prisma.user.count({ where: whereConditions })
    const skip = (page - 1) * limit
    const totalPages = Math.ceil(total / limit)
    const hasMore = page < totalPages

    const users = await prisma.user.findMany({
        where: whereConditions,
        orderBy: { [sortBy]: order },
        skip,
        take: limit,
        include: {
            subscription: {
                select: {
                    isActive: true,
                    expiresAt: true,
                },
            },
            _count: {
                select: {
                    resourceAccesses: true,
                },
            },
        },
    })

    const data = users.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        image: user.image,
        role: user.role as 'user' | 'subscriber' | 'admin',
        emailVerified: user.emailVerified,
        banned: user.banned,
        subscription: user.subscription,
        resourceAccessCount: user._count.resourceAccesses,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    }))

    return {
        data,
        pagination: {
            page,
            limit,
            total,
            totalPages,
            hasMore,
        },
    }
}
