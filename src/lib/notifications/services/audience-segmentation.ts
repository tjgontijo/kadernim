import { Prisma } from '@db/client'
import { prisma } from '@/lib/db'
import type { AudienceFilter } from '@/lib/notifications/types'

export function buildUserFilter(audience: AudienceFilter): Prisma.UserWhereInput {
  const filters: Prisma.UserWhereInput = {
    banned: false,
  }

  if (audience.roles && audience.roles.length > 0) {
    filters.role = {
      in: audience.roles as any[],
    }
  }

  if (audience.hasSubscription === 'subscribers') {
    filters.subscription = {
      is: {
        isActive: true,
      },
    }
  } else if (audience.hasSubscription === 'non-subscribers') {
    filters.OR = [{ subscription: null }, { subscription: { isActive: false } }]
  }

  if (audience.activeInDays && audience.activeInDays > 0) {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - audience.activeInDays)

    filters.sessions = {
      some: {
        createdAt: {
          gte: cutoffDate,
        },
      },
    }
  }

  if (audience.inactiveForDays && audience.inactiveForDays > 0) {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - audience.inactiveForDays)

    filters.sessions = {
      none: {
        createdAt: {
          gte: cutoffDate,
        },
      },
    }
  }

  return filters
}

export async function getAudienceUserIds(audience: AudienceFilter): Promise<string[]> {
  const users = await prisma.user.findMany({
    where: buildUserFilter(audience),
    select: { id: true },
  })

  return users.map((user: { id: string }) => user.id)
}

export async function countAudienceUsers(audience: AudienceFilter): Promise<number> {
  return prisma.user.count({ where: buildUserFilter(audience) })
}

export async function getSegmentedPushSubscriptions(audience: AudienceFilter) {
  return prisma.pushSubscription.findMany({
    where: {
      active: true,
      user: buildUserFilter(audience),
    },
    select: {
      id: true,
      endpoint: true,
      auth: true,
      p256dh: true,
      userId: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  })
}

export async function previewAudience(audience: AudienceFilter) {
  const userFilter = buildUserFilter(audience)

  const [totalUsers, withPushSubscriptions] = await Promise.all([
    countAudienceUsers(audience),
    prisma.pushSubscription.count({
      where: {
        active: true,
        user: userFilter,
      },
    }),
  ])

  const sampleUsers = await prisma.user.findMany({
    where: userFilter,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
    take: 5,
  })

  return {
    totalUsers,
    withPushSubscriptions,
    sampleUsers,
    filters: audience,
  }
}
