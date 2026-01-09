import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentYearMonth, getNextYearMonth } from '@/lib/utils/date'
import { deleteCommunityReference } from '@/server/clients/cloudinary'
import { emitEvent } from '@/lib/events/emit'

/**
 * Monthly Processing Job
 * Triggered on the 1st day of each month at 00:00 BRT.
 */
export async function POST(request: Request) {
    // TODO: Add cron secret validation
    // const authHeader = request.headers.get('authorization')
    // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) { ... }

    const currentMonth = getCurrentYearMonth()
    const nextMonth = getNextYearMonth()

    try {
        const result = await prisma.$transaction(async (tx) => {
            // 1. Permanently delete requests with 0 votes
            const failedOnVotes = await tx.communityRequest.findMany({
                where: { votingMonth: currentMonth, voteCount: 0, status: 'voting' },
                select: {
                    id: true,
                    references: { select: { cloudinaryPublicId: true } }
                }
            })

            for (const req of failedOnVotes) {
                // Delete each reference from Cloudinary
                for (const ref of req.references) {
                    await deleteCommunityReference(ref.cloudinaryPublicId)
                }
            }

            await tx.communityRequest.deleteMany({
                where: { id: { in: failedOnVotes.map(r => r.id) } }
            })

            // 2. Select Top 10 (with at least 1 vote)
            const top10 = await tx.communityRequest.findMany({
                where: { votingMonth: currentMonth, status: 'voting', voteCount: { gte: 1 } },
                orderBy: [{ voteCount: 'desc' }, { createdAt: 'asc' }],
                take: 10,
                select: { id: true }
            })

            await tx.communityRequest.updateMany({
                where: { id: { in: top10.map(r => r.id) } },
                data: { status: 'selected', selectedAt: new Date() }
            })

            // Emit specific events for top 10 (can be handled by automation for congrats emails)
            for (const req of top10) {
                await emitEvent({ type: 'community.request.selected', payload: { requestId: req.id, title: 'Selected' } })
            }

            // 3. Survivors (position 11-30)
            const survivors = await tx.communityRequest.findMany({
                where: {
                    votingMonth: currentMonth,
                    status: 'voting',
                    voteCount: { gte: 1 },
                    id: { notIn: top10.map(r => r.id) }
                },
                orderBy: [{ voteCount: 'desc' }, { createdAt: 'asc' }],
                take: 20,
                select: { id: true, survivedMonths: true }
            })

            for (const req of survivors) {
                if (req.survivedMonths >= 2) {
                    // 3 strikes - Permanent Delete
                    const toDelete = await tx.communityRequest.findUnique({
                        where: { id: req.id },
                        select: { references: { select: { cloudinaryPublicId: true } } }
                    })
                    if (toDelete) {
                        for (const ref of toDelete.references) {
                            await deleteCommunityReference(ref.cloudinaryPublicId)
                        }
                    }
                    await tx.communityRequest.delete({ where: { id: req.id } })
                } else {
                    // Survived - Move to next month and reset votes
                    await tx.communityRequest.update({
                        where: { id: req.id },
                        data: {
                            votingMonth: nextMonth,
                            voteCount: 0,
                            survivedMonths: req.survivedMonths + 1
                        }
                    })
                }
            }

            // 4. Delete the rest (position 31+)
            const leftOver = await tx.communityRequest.findMany({
                where: { votingMonth: currentMonth, status: 'voting' },
                select: { id: true, references: { select: { cloudinaryPublicId: true } } }
            })

            for (const req of leftOver) {
                for (const ref of req.references) {
                    await deleteCommunityReference(ref.cloudinaryPublicId)
                }
            }

            await tx.communityRequest.deleteMany({
                where: { id: { in: leftOver.map(r => r.id) } }
            })

            return {
                deletedZeroVotes: failedOnVotes.length,
                selectedTop10: top10.length,
                survivors: survivors.length,
                deletedLeftover: leftOver.length
            }
        })

        return NextResponse.json({ success: true, month: currentMonth, result })
    } catch (error) {
        console.error('[CRON MonthEnd] Error:', error)
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
    }
}
