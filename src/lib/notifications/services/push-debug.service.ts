import { prisma } from '@/lib/db'

export async function getPushDebugStatus(userId: string) {
  const [userSubscriptions, totalActiveSubscriptions, staleSubscriptions] = await Promise.all([
    prisma.pushSubscription.findMany({
      where: { userId },
      select: {
        id: true,
        endpoint: true,
        active: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.pushSubscription.count({
      where: { active: true },
    }),
    prisma.pushSubscription.count({
      where: {
        active: true,
        updatedAt: {
          lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
    }),
  ])

  return {
    totalActiveSubscriptions,
    staleSubscriptions,
    userSubscriptions,
  }
}

export async function listTargetPushSubscriptions(params: {
  role?: string
  userId?: string
}) {
  const audienceFilters: Array<Record<string, unknown>> = []

  if (params.userId) {
    audienceFilters.push({ userId: params.userId })
  }

  if (params.role) {
    audienceFilters.push({ user: { role: params.role as 'user' | 'subscriber' | 'admin' } })
  }

  return prisma.pushSubscription.findMany({
    where: {
      active: true,
      OR: audienceFilters,
    },
  })
}
