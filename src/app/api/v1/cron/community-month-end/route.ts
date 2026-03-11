import { NextResponse } from 'next/server'
import { processCommunityMonthEnd } from '@/services/community/community-cron.service'

/**
 * Monthly Processing Job
 * Triggered on the 1st day of each month at 00:00 BRT.
 */
export async function POST(request: Request) {
    // TODO: Add cron secret validation
    // const authHeader = request.headers.get('authorization')
    // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) { ... }

    try {
        const outcome = await processCommunityMonthEnd()
        return NextResponse.json({ success: true, month: outcome.month, result: outcome.result })
    } catch (error) {
        console.error('[CRON MonthEnd] Error:', error)
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
    }
}
