// src/app/api/v1/resources/metadata/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { getFilterMetadata, getLibraryStats } from '@/services/resources.service'
import { unstable_cache } from 'next/cache'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    // Autenticação (opcional para metadados básicos)
    const session = await auth.api.getSession({ headers: req.headers })
    const userId = session?.user?.id

    // Buscar metadados de filtros (cache longo - 1 hora)
    const getCachedMetadata = unstable_cache(
      async () => {
        return await getFilterMetadata()
      },
      ['filter-metadata'],
      {
        revalidate: 3600, // 1 hora
        tags: ['subjects', 'education-levels']
      }
    )

    const metadata = await getCachedMetadata()

    // Se usuário autenticado, buscar estatísticas
    let stats = null
    if (userId) {
      const getCachedStats = unstable_cache(
        async () => {
          return await getLibraryStats(userId)
        },
        [`library-stats-${userId}`],
        {
          revalidate: 60, // 1 minuto
          tags: [`user-${userId}`, 'resources']
        }
      )
      stats = await getCachedStats()
    }

    // Headers de cache
    const headers = {
      'Cache-Control': userId
        ? 'private, max-age=60, stale-while-revalidate=300'
        : 'public, max-age=3600, stale-while-revalidate=7200',
      'CDN-Cache-Control': userId ? 'private, max-age=60' : 'public, max-age=3600'
    }

    return NextResponse.json(
      {
        subjects: metadata.subjects,
        educationLevels: metadata.educationLevels,
        stats
      },
      { headers }
    )
  } catch (error) {
    console.error('Erro ao buscar metadados:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar metadados' },
      { status: 500 }
    )
  }
}
