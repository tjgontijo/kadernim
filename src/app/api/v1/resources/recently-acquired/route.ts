// src/app/api/v1/resources/recently-acquired/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { getRecentlyAcquired } from '@/services/resources.service'
import { unstable_cache } from 'next/cache'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    // Autenticação
    const session = await auth.api.getSession({ headers: req.headers })
    const userId = session?.user?.id

    if (!userId) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    // Parâmetros
    const searchParams = req.nextUrl.searchParams
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 20)

    // Cache com TTL curto (30 segundos) para recursos recentes
    const getCachedData = unstable_cache(
      async () => {
        return await getRecentlyAcquired(userId, limit)
      },
      [`recently-acquired-${userId}-${limit}`],
      {
        revalidate: 30, // 30 segundos
        tags: [`resources`, `user-${userId}`, `recent-purchases`]
      }
    )

    const data = await getCachedData()

    // Headers de cache privado
    const headers = {
      'Cache-Control': 'private, max-age=30, stale-while-revalidate=60',
      'CDN-Cache-Control': 'private, max-age=30'
    }

    return NextResponse.json({ resources: data }, { headers })
  } catch (error) {
    console.error('Erro ao buscar recursos recentes:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar recursos recentes' },
      { status: 500 }
    )
  }
}
