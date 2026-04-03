import { prisma } from '@/server/db'
import type { AccountSession } from '@/lib/account/types'

export async function listAccountSessions(
  userId: string,
  currentSessionId?: string | null
): Promise<AccountSession[]> {
  const sessions = await prisma.session.findMany({
    where: { userId },
    select: {
      id: true,
      userAgent: true,
      ipAddress: true,
      createdAt: true,
      expiresAt: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  return sessions.map((session) => ({
    ...session,
    isCurrent: session.id === currentSessionId,
  }))
}
