import { prisma } from '@/lib/db'
import { getCurrentYearMonth, getNextMonthFirstDay } from '@/lib/utils/date'
import { getCommunityConfig } from '@/services/config/system-config'

/**
 * Returns the current month's community usage (requests) for a user.
 */
export async function getCommunityUsage(userId: string) {
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
        limit: limit,
        remaining: Math.max(0, limit - requestsUsed),
        resetsAt,
        yearMonth: currentMonth,
        type: 'requests' // Indicador para o frontend
    }
}
