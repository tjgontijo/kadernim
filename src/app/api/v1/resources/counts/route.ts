import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db'
import { auth } from "@/server/auth/auth"

export async function GET(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: request.headers
        })

        const [libraryCount, favoriteCount] = await Promise.all([
            // Conta apenas materiais ativos (não arquivados)
            prisma.resource.count({
                where: {}
            }),
            // Conta favoritos se houver sessão
            session?.user?.id
                ? prisma.userResourceInteraction.count({
                    where: {
                        userId: session.user.id,
                        isSaved: true
                    }
                })
                : Promise.resolve(0)
        ])

        return NextResponse.json({
            library: libraryCount,
            favorites: favoriteCount
        }, {
            headers: {
                'Cache-Control': 'private, no-cache, no-store, max-age=0, must-revalidate',
                'Vary': 'Cookie'
            }
        })
    } catch (error) {
        console.error('[API] Erro ao buscar contadores:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
