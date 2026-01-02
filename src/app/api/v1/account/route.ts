import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/services/auth/session-service'
import { prisma } from '@/lib/db'

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

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                image: true,
                role: true,
                emailVerified: true,
                createdAt: true,
                subscription: {
                    select: {
                        id: true,
                        isActive: true,
                        purchaseDate: true,
                        expiresAt: true,
                    },
                },
            },
        })

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        return NextResponse.json(user)
    } catch (error) {
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
        const { name, phone } = body

        const user = await prisma.user.update({
            where: { id: session.user.id },
            data: {
                ...(name && { name }),
                ...(phone !== undefined && { phone: phone || null }),
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                image: true,
                role: true,
            },
        })

        return NextResponse.json(user)
    } catch (error) {
        console.error('[PUT /api/v1/account]', error)
        return NextResponse.json(
            { error: 'Erro ao atualizar dados' },
            { status: 500 }
        )
    }
}
