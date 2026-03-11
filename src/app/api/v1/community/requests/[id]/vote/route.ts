import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/server/auth/auth'
import { voteForRequest } from '@/services/community/request-service'
import { getUserRole } from '@/services/users/get-user-role'

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

        return NextResponse.json({ success: true, data: result })
    } catch (error: any) {
        if (error instanceof Error && error.message === 'User not found') {
            return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
        }

        console.error('[Community Vote POST] Error:', error)
        return NextResponse.json({
            success: false,
            error: error.message || 'Erro ao votar no pedido'
        }, { status: 400 })
    }
}
