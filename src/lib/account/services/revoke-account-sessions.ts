import { prisma } from '@/server/db'
import { logger } from '@/server/logger'
import { fail, ok, type Result } from '@/lib/shared/result'

export async function revokeAccountSessions(
  userId: string,
  currentSessionId: string,
  revokeAll: boolean
): Promise<Result<{ count: number }, 'Failed to revoke account sessions'>> {
  try {
    const result = await prisma.session.deleteMany({
      where: revokeAll
        ? { userId }
        : {
            userId,
            id: { not: currentSessionId },
          },
    })

    return ok({ count: result.count })
  } catch (error) {
    logger.error(
      { domain: 'account', userId, currentSessionId, revokeAll, error: error instanceof Error ? error.message : String(error) },
      'Failed to revoke account sessions'
    )
    return fail('Failed to revoke account sessions')
  }
}
