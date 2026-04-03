import { NextResponse } from 'next/server'
import { logger } from '@/server/logger'
import { cleanupStaleCommunityRequests } from '@/lib/community/services'

export async function POST(request: Request) {
  try {
    const result = await cleanupStaleCommunityRequests()

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      deleted: result.data.deleted,
    })
  } catch (error) {
    logger.error(
      { route: '/api/v1/cron/community-cleanup', error: error instanceof Error ? error.message : String(error) },
      'Failed to cleanup community cron'
    )
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
  }
}
