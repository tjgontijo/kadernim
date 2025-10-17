// src/app/api/v1/resources/recently-added/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getRecentlyAdded } from '@/services/resources.service'
import { unstable_cache } from 'next/cache'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    // Parâmetros
    const searchParams = req.nextUrl.searchParams
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 20)

    // Cache com TTL médio (5 minutos) para recursos recém-adicionados
    const getCachedData = unstable_cache(
      async () => {
        return await getRecentlyAdded(limit)
      },
      [`recently-added-${limit}`],
      {
        revalidate: 300, // 5 minutos
        tags: [`resources`, `recently-added`]
      }
    )

    const data = await getCachedData()

    // Headers de cache público (pode ser compartilhado)
    const headers = {
      'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
      'CDN-Cache-Control': 'public, max-age=300'
    }

    return NextResponse.json({ resources: data }, { headers })
  } catch (error) {
    console.error('Erro ao buscar recursos recém-adicionados:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar recursos recém-adicionados' },
      { status: 500 }
    )
  }
}
