import { NextResponse } from 'next/server'
import { auth } from '@/server/auth/auth'
import { logger } from '@/server/logger'
import { getCommunityUsage } from '@/lib/community/queries'

/**
 * GET /api/v1/community/usage
 * Returns the monthly usage (requests) for the authenticated user.
 */
export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })

    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const usage = await getCommunityUsage(session.user.id)

    return NextResponse.json({
      success: true,
      data: usage,
    })
  } catch (error) {
    logger.error(
      { route: '/api/v1/community/usage', error: error instanceof Error ? error.message : String(error) },
      'Failed to fetch community usage'
    )
    return NextResponse.json({ success: false, error: 'Erro ao buscar uso da comunidade' }, { status: 500 })
  }
}
