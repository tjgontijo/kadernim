import { NextResponse } from 'next/server'
import { auth } from '@/server/auth/auth'
import { getCommunityUsage } from '@/services/community/get-usage'

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
        console.error('[GET /api/v1/community/usage] Error:', error)
        return NextResponse.json({ success: false, error: 'Erro ao buscar uso da comunidade' }, { status: 500 })
    }
}
