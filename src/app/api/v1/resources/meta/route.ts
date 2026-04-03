import { NextRequest, NextResponse } from 'next/server'
import { getResourceMeta, getResourceMetaForUser } from '@/lib/resources/services/catalog'
import { auth } from '@/server/auth/auth'

export async function GET(request: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: request.headers })
        const userId = session?.user?.id ?? null
        const role = session?.user?.role ?? null

        const userMeta = await getResourceMetaForUser(userId, role)

        const meta = await getResourceMeta({
            filters: {}, // Not used for fetching all options
            user: userMeta,
        })

        return NextResponse.json(meta)
    } catch (error) {
        console.error('Erro ao buscar metadados:', error)
        return NextResponse.json({ error: 'Erro ao buscar metadados' }, { status: 500 })
    }
}
