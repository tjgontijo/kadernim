import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/server/auth/auth'
import { getCommunityRequests, createCommunityRequest } from '@/services/community/request-service'
import { CommunityFilterSchema, CommunityRequestSchema } from '@/lib/schemas/community'

/**
 * GET /api/v1/community/requests
 * Lists community requests with filters.
 */
export async function GET(request: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: request.headers })
        const userId = session?.user?.id

        const searchParams = request.nextUrl.searchParams
        const parsed = CommunityFilterSchema.safeParse({
            page: searchParams.get('page'),
            limit: searchParams.get('limit'),
            status: searchParams.get('status'),
            votingMonth: searchParams.get('votingMonth'),
            educationLevelId: searchParams.get('educationLevelId'),
            subjectId: searchParams.get('subjectId'),
        })

        if (!parsed.success) {
            return NextResponse.json({ error: 'Parâmetros inválidos', details: parsed.error.format() }, { status: 400 })
        }

        const result = await getCommunityRequests({
            ...parsed.data,
            currentUserId: userId
        })

        return NextResponse.json({ success: true, data: result })
    } catch (error) {
        console.error('[Community GET] Error:', error)
        return NextResponse.json({ success: false, error: 'Erro ao buscar pedidos' }, { status: 500 })
    }
}

/**
 * POST /api/v1/community/requests
 * Creates a new community request.
 */
export async function POST(request: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: request.headers })
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const parsed = CommunityRequestSchema.safeParse(body)

        if (!parsed.success) {
            return NextResponse.json({ error: 'Dados inválidos', details: parsed.error.format() }, { status: 400 })
        }

        const result = await createCommunityRequest(session.user.id, parsed.data)

        return NextResponse.json({ success: true, data: result })
    } catch (error: any) {
        console.error('[Community POST] Error:', error)
        return NextResponse.json({
            success: false,
            error: error.message || 'Erro ao criar pedido'
        }, { status: 400 })
    }
}
