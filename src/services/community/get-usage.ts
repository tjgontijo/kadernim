import { prisma } from '@/lib/db'
import { getCurrentYearMonth, getNextMonthFirstDay } from '@/lib/utils/date'

export const COMMUNITY_VOTE_MONTHLY_LIMIT = 5

/**
 * Returns the current month's voting usage for a user.
 */
export async function getCommunityVoteUsage(userId: string) {
    const currentMonth = getCurrentYearMonth()

    const votesUsed = await prisma.communityRequestVote.count({
        where: {
            userId,
            votingMonth: currentMonth,
        },
    })

    const resetsAt = getNextMonthFirstDay(currentMonth)

    return {
        used: votesUsed,
        limit: COMMUNITY_VOTE_MONTHLY_LIMIT,
        remaining: Math.max(0, COMMUNITY_VOTE_MONTHLY_LIMIT - votesUsed),
        resetsAt,
        yearMonth: currentMonth,
    }
}
