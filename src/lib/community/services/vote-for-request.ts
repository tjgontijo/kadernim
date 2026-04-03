import { prisma } from '@/server/db'
import { logger } from '@/server/logger'
import { emitEvent } from '@/lib/events/emit'
import { getCurrentYearMonth } from '@/lib/utils/date'
import { fail, ok, type Result } from '@/lib/shared/result'
import type { UserRoleType } from '@/types/users/user-role'

export async function voteForRequest(
  userId: string,
  userRole: UserRoleType,
  requestId: string
): Promise<Result<{ id: string; voteCount: number }, string>> {
  const currentMonth = getCurrentYearMonth()

  if (userRole === 'user') {
    return fail('Você precisa ser assinante para votar.')
  }

  try {
    const updatedRequest = await prisma.$transaction(async (tx) => {
      const existingVote = await tx.communityRequestVote.findUnique({
        where: {
          requestId_userId: {
            requestId,
            userId,
          },
        },
      })

      if (existingVote) {
        throw new Error('Você já votou neste pedido.')
      }

      const request = await tx.communityRequest.findUnique({
        where: { id: requestId },
        select: { userId: true },
      })

      if (!request) {
        throw new Error('Pedido não encontrado.')
      }

      if (request.userId === userId) {
        throw new Error('Você não pode votar na sua própria solicitação.')
      }

      await tx.communityRequestVote.create({
        data: {
          requestId,
          userId,
          votingMonth: currentMonth,
        },
      })

      return tx.communityRequest.update({
        where: { id: requestId },
        data: {
          voteCount: { increment: 1 },
        },
        select: { id: true, voteCount: true },
      })
    })

    await emitEvent({
      type: 'community.request.voted',
      payload: {
        requestId,
        userId,
        newVoteCount: updatedRequest.voteCount,
      },
    })

    return ok(updatedRequest)
  } catch (error) {
    logger.error(
      { domain: 'community', userId, requestId, error: error instanceof Error ? error.message : String(error) },
      'Failed to vote for community request'
    )
    return fail(error instanceof Error ? error.message : 'Erro ao votar no pedido')
  }
}
