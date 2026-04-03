import { subDays } from 'date-fns'
import { deleteCommunityReference } from '@/server/clients/cloudinary'
import { prisma } from '@/server/db'
import { logger } from '@/server/logger'
import { fail, ok, type Result } from '@/lib/shared/result'

export async function cleanupStaleCommunityRequests(): Promise<Result<{ deleted: number }, string>> {
  try {
    const staleUnfeasible = await prisma.communityRequest.findMany({
      where: {
        status: 'unfeasible',
        unfeasibleAt: { lte: subDays(new Date(), 30) },
      },
      include: { references: true },
    })

    for (const request of staleUnfeasible) {
      for (const reference of request.references) {
        await deleteCommunityReference(reference.cloudinaryPublicId)
      }
    }

    const deleteResult = await prisma.communityRequest.deleteMany({
      where: { id: { in: staleUnfeasible.map((request) => request.id) } },
    })

    return ok({ deleted: deleteResult.count })
  } catch (error) {
    logger.error(
      { domain: 'community', error: error instanceof Error ? error.message : String(error) },
      'Failed to cleanup stale community requests'
    )
    return fail('Internal Server Error')
  }
}
