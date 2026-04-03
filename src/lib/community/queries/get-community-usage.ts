import { prisma } from '@/server/db'
import { getCurrentYearMonth, getNextMonthFirstDay } from '@/lib/utils/date'
import { getCommunityConfig } from '@/lib/community/queries/get-community-config'
import type { CommunityUsage } from '@/lib/community/types'

export async function getCommunityUsage(userId: string): Promise<CommunityUsage> {
  const currentMonth = getCurrentYearMonth()
  const config = await getCommunityConfig()

  const requestsUsed = await prisma.communityRequest.count({
    where: {
      userId,
      votingMonth: currentMonth,
    },
  })

  const resetsAt = getNextMonthFirstDay(currentMonth)
  const limit = config.requests.limit

  return {
    used: requestsUsed,
    limit,
    remaining: Math.max(0, limit - requestsUsed),
    resetsAt: resetsAt.toISOString(),
    yearMonth: currentMonth,
    type: 'requests',
  }
}
