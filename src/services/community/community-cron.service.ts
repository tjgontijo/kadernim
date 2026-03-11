import { prisma } from '@/lib/db'
import { subDays } from 'date-fns'
import { getCurrentYearMonth, getNextYearMonth } from '@/lib/utils/date'
import { deleteCommunityReference } from '@/server/clients/cloudinary'
import { emitEvent } from '@/lib/events/emit'

export async function cleanupStaleCommunityRequests() {
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

  return deleteResult.count
}

export async function processCommunityMonthEnd() {
  const currentMonth = getCurrentYearMonth()
  const nextMonth = getNextYearMonth()

  const result = await prisma.$transaction(async (tx) => {
    const failedOnVotes = await tx.communityRequest.findMany({
      where: { votingMonth: currentMonth, voteCount: 0, status: 'voting' },
      select: {
        id: true,
        references: { select: { cloudinaryPublicId: true } },
      },
    })

    for (const request of failedOnVotes) {
      for (const reference of request.references) {
        await deleteCommunityReference(reference.cloudinaryPublicId)
      }
    }

    await tx.communityRequest.deleteMany({
      where: { id: { in: failedOnVotes.map((request) => request.id) } },
    })

    const top10 = await tx.communityRequest.findMany({
      where: { votingMonth: currentMonth, status: 'voting', voteCount: { gte: 1 } },
      orderBy: [{ voteCount: 'desc' }, { createdAt: 'asc' }],
      take: 10,
      select: { id: true },
    })

    await tx.communityRequest.updateMany({
      where: { id: { in: top10.map((request) => request.id) } },
      data: { status: 'selected', selectedAt: new Date() },
    })

    for (const request of top10) {
      await emitEvent({
        type: 'community.request.selected',
        payload: { requestId: request.id, title: 'Selected' },
      })
    }

    const survivors = await tx.communityRequest.findMany({
      where: {
        votingMonth: currentMonth,
        status: 'voting',
        voteCount: { gte: 1 },
        id: { notIn: top10.map((request) => request.id) },
      },
      orderBy: [{ voteCount: 'desc' }, { createdAt: 'asc' }],
      take: 20,
      select: { id: true, survivedMonths: true },
    })

    for (const request of survivors) {
      if (request.survivedMonths >= 2) {
        const toDelete = await tx.communityRequest.findUnique({
          where: { id: request.id },
          select: { references: { select: { cloudinaryPublicId: true } } },
        })

        if (toDelete) {
          for (const reference of toDelete.references) {
            await deleteCommunityReference(reference.cloudinaryPublicId)
          }
        }

        await tx.communityRequest.delete({ where: { id: request.id } })
      } else {
        await tx.communityRequest.update({
          where: { id: request.id },
          data: {
            votingMonth: nextMonth,
            voteCount: 0,
            survivedMonths: request.survivedMonths + 1,
          },
        })
      }
    }

    const leftOver = await tx.communityRequest.findMany({
      where: { votingMonth: currentMonth, status: 'voting' },
      select: { id: true, references: { select: { cloudinaryPublicId: true } } },
    })

    for (const request of leftOver) {
      for (const reference of request.references) {
        await deleteCommunityReference(reference.cloudinaryPublicId)
      }
    }

    await tx.communityRequest.deleteMany({
      where: { id: { in: leftOver.map((request) => request.id) } },
    })

    return {
      deletedZeroVotes: failedOnVotes.length,
      selectedTop10: top10.length,
      survivors: survivors.length,
      deletedLeftover: leftOver.length,
    }
  })

  return {
    month: currentMonth,
    result,
  }
}
