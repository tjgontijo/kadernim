import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/server/auth/auth'
import { getResourceMeta } from '@/services/resources/catalog/meta-service'
import { isStaff } from '@/lib/auth/roles'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: request.headers })
        const userId = session?.user?.id ?? null
        const role = session?.user?.role ?? null

        const subscription = userId ? await prisma.subscription.findFirst({
            where: {
                userId,
                isActive: true,
                OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
            },
            select: { id: true },
        }) : null

        const isAdmin = isStaff(role as any)
        const isSubscriber = Boolean(subscription)

        const meta = await getResourceMeta({
            filters: {}, // Not used for fetching all options
            user: {
                role,
                isAdmin,
                isSubscriber,
            }
        })

        return NextResponse.json(meta)
    } catch (error) {
        console.error('Erro ao buscar metadados:', error)
        return NextResponse.json({ error: 'Erro ao buscar metadados' }, { status: 500 })
    }
}
