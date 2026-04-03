import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/server/auth/auth'
import { logger } from '@/server/logger'
import { voteForRequest } from '@/lib/community/services'
import { getUserRole } from '@/lib/users/queries'

/**
 * POST /api/v1/community/requests/[id]/vote
 * Casts a vote for a specific request.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth.api.getSession({ headers: request.headers })

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRole = await getUserRole(session.user.id)
    const result = await voteForRequest(session.user.id, userRole, id)

    if (!result.success) {
      const status = result.error === 'User not found' ? 404 : 400
      return NextResponse.json({
        success: false,
        error: result.error,
      }, { status })
    }

    return NextResponse.json({ success: true, data: result.data })
  } catch (error) {
    logger.error(
      { route: '/api/v1/community/requests/[id]/vote', error: error instanceof Error ? error.message : String(error) },
      'Failed to vote for community request'
    )
    return NextResponse.json({
      success: false,
      error: 'Erro ao votar no pedido',
    }, { status: 500 })
  }
}
