import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/server/auth/auth'
import { PixAutomaticService } from '@/services/billing/pix-automatic.service'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ authorizationId: string }> }
) {
    try {
        const session = await auth.api.getSession({ headers: request.headers })
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { authorizationId } = await params

        if (!authorizationId) {
            return NextResponse.json({ error: 'Authorization ID is required' }, { status: 400 })
        }

        const authStatus = await PixAutomaticService.getAuthorizationStatus(authorizationId, session.user.id)

        return NextResponse.json({
            id: authStatus.asaasId,
            status: authStatus.status,
        }, { status: 200 })

    } catch (error: any) {
        if (error.message === 'Authorization not found') {
            return NextResponse.json({ error: 'Authorization not found' }, { status: 404 })
        }
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 })
    }
}
