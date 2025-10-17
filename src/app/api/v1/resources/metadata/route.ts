// src/app/api/v1/resources/metadata/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { getFilterMetadata, getLibraryStats } from '@/services/resources.service'
import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    // Autenticação (opcional para metadados básicos)
    const session = await auth.api.getSession({ headers: req.headers })
    const userId = session?.user?.id

    // Buscar metadados de filtros (cache longo - 6 horas)
    const getCachedMetadata = unstable_cache(
      async () => {
        return await getFilterMetadata()
      },
      ['filter-metadata'],
      {
        revalidate: 21600, // 6 horas (mudam raramente)
        tags: ['subjects', 'education-levels']
      }
    )

    // Buscar stats gerais de recursos (cache 6 horas)
    const getCachedResourceStats = unstable_cache(
      async () => {
        const [total, free, premium] = await Promise.all([
          prisma.resource.count(),
          prisma.resource.count({ where: { isFree: true } }),
          prisma.resource.count({ where: { isFree: false } }),
        ])
        return { total, free, premium }
      },
      ['resource-counts'],
      {
        revalidate: 21600, // 6 horas
        tags: ['resources']
      }
    )

    const [metadata, resourceStats] = await Promise.all([
      getCachedMetadata(),
      getCachedResourceStats()
    ])

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

    // Headers de cache (6 horas para dados que mudam raramente)
    const headers = {
      'Cache-Control': userId
        ? 'private, max-age=60, stale-while-revalidate=300'
        : 'public, max-age=21600, stale-while-revalidate=43200', // 6h + 12h stale
      'CDN-Cache-Control': userId ? 'private, max-age=60' : 'public, max-age=21600'
    }

    return NextResponse.json(
      {
        subjects: metadata.subjects,
        educationLevels: metadata.educationLevels,
        resourceStats, // ← Adiciona stats gerais
        stats // ← Stats do usuário (isPremium, isAdmin)
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
