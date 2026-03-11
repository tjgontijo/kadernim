import { NextResponse } from 'next/server'
import { cleanupStaleCommunityRequests } from '@/services/community/community-cron.service'

/**
 * Weekly/Daily Cleanup Job
 * Deletes unfeasible requests after 30 days.
 */
export async function POST(request: Request) {
    try {
        const deleted = await cleanupStaleCommunityRequests()

        return NextResponse.json({
            success: true,
            deleted
        })
    } catch (error) {
        console.error('[CRON Cleanup] Error:', error)
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
    }
}
