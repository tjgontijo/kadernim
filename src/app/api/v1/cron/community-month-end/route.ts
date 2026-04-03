import { NextResponse } from 'next/server'
import { logger } from '@/server/logger'
import { processCommunityMonthEnd } from '@/lib/community/services'

export async function POST(request: Request) {
  // TODO: Add cron secret validation
  // const authHeader = request.headers.get('authorization')
  // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) { ... }

  try {
    const outcome = await processCommunityMonthEnd()

    if (!outcome.success) {
      return NextResponse.json({ success: false, error: outcome.error }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      month: outcome.data.month,
      result: outcome.data.result,
    })
  } catch (error) {
    logger.error(
      { route: '/api/v1/cron/community-month-end', error: error instanceof Error ? error.message : String(error) },
      'Failed to process community month end'
    )
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
  }
}
