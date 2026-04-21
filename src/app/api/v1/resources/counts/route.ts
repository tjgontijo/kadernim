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
                where: {
                    archivedAt: null
                }
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
                'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=600'
            }
        })
    } catch (error) {
        console.error('[API] Erro ao buscar contadores:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
