import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/server/auth/auth'
import { logger } from '@/server/logger'
import { getCommunityConfig } from '@/lib/community/queries'

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const config = await getCommunityConfig()

    return NextResponse.json({
      success: true,
      data: config,
    })
  } catch (error) {
    logger.error(
      { route: '/api/v1/community/config', error: error instanceof Error ? error.message : String(error) },
      'Failed to fetch community config'
    )
    return NextResponse.json({ success: false, error: 'Erro ao buscar configurações' }, { status: 500 })
  }
}
