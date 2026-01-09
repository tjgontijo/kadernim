import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { subDays } from 'date-fns'
import { deleteCommunityReference } from '@/server/clients/cloudinary'

/**
 * Weekly/Daily Cleanup Job
 * Deletes unfeasible requests after 30 days.
 */
export async function POST(request: Request) {
    const thirtyDaysAgo = subDays(new Date(), 30)

    try {
        // 1. Find unfeasible requests older than 30 days
        const staleUnfeasible = await prisma.communityRequest.findMany({
            where: {
                status: 'unfeasible',
                unfeasibleAt: { lte: thirtyDaysAgo }
            },
            include: { references: true }
        })

        // 2. Delete from Cloudinary and DB
        for (const req of staleUnfeasible) {
            for (const ref of req.references) {
                await deleteCommunityReference(ref.cloudinaryPublicId)
            }
        }

        const deleteResult = await prisma.communityRequest.deleteMany({
            where: { id: { in: staleUnfeasible.map(r => r.id) } }
        })

        return NextResponse.json({
            success: true,
            deleted: deleteResult.count
        })
    } catch (error) {
        console.error('[CRON Cleanup] Error:', error)
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
    }
}
