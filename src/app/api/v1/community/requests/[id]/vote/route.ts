import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/server/auth/auth'
import { voteForRequest } from '@/services/community/request-service'

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

        const result = await voteForRequest(session.user.id, id)

        return NextResponse.json({ success: true, data: result })
    } catch (error: any) {
        console.error('[Community Vote POST] Error:', error)
        return NextResponse.json({
            success: false,
            error: error.message || 'Erro ao votar no pedido'
        }, { status: 400 })
    }
}
