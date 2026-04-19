import { prisma } from '@/lib/db'
import { Prisma } from '@db/client'
import type { ListUsersFilter } from '@/lib/users/schemas'

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

export async function listUsersService(filters: ListUsersFilter): Promise<ListUsersResponse> {
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
    order,
  } = filters

  const whereConditions: Prisma.UserWhereInput = {}

  if (q) {
    whereConditions.OR = [
      { name: { contains: q, mode: 'insensitive' } },
      { email: { contains: q, mode: 'insensitive' } },
    ]
  }

  if (role) {
    whereConditions.role = role
  }

  if (banned !== undefined) {
    whereConditions.banned = banned
  }

  if (emailVerified !== undefined) {
    whereConditions.emailVerified = emailVerified
  }

  if (hasSubscription !== undefined) {
    whereConditions.subscription = hasSubscription ? { isNot: null } : { is: null }
  }

  if (subscriptionActive !== undefined) {
    whereConditions.subscription = {
      is: {
        isActive: subscriptionActive,
      },
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
