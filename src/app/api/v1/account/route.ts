import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/services/auth/session-service'
import { UpdateAccountSchema } from '@/schemas/account/account-schemas'
import {
    getAccountProfile,
    updateAccountProfile,
} from '@/services/account/account-service'

export const dynamic = 'force-dynamic'

/**
 * GET /api/v1/account
 * Retorna dados completos da conta do usuário logado
 */
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession()

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const user = await getAccountProfile(session.user.id)
        return NextResponse.json(user)
    } catch (error) {
        if (error instanceof Error && error.message === 'User not found') {
            return NextResponse.json({ error: error.message }, { status: 404 })
        }

        console.error('[GET /api/v1/account]', error)
        return NextResponse.json(
            { error: 'Erro ao buscar dados da conta' },
            { status: 500 }
        )
    }
}

/**
 * PUT /api/v1/account
 * Atualiza dados do perfil do usuário
 */
export async function PUT(request: NextRequest) {
    try {
        const session = await getServerSession()

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const parsed = UpdateAccountSchema.safeParse(body)

        if (!parsed.success) {
            return NextResponse.json(
                { error: 'Dados inválidos', details: parsed.error.flatten() },
                { status: 400 }
            )
        }

        const user = await updateAccountProfile(session.user.id, parsed.data)

        return NextResponse.json(user)
    } catch (error) {
        console.error('[PUT /api/v1/account]', error)
        return NextResponse.json(
            { error: 'Erro ao atualizar dados' },
            { status: 500 }
        )
    }
}
