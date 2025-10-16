import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { unstable_cache } from 'next/cache'

/**
 * GET /api/v1/stats/resources
 * 
 * Retorna estatísticas agregadas de recursos para uso em banners/marketing.
 * Cache agressivo (1 hora) pois esses números mudam pouco.
 */

type ResourceStats = {
  total: number
  free: number
  premium: number
  bySubject: Array<{ subjectId: string; subjectName: string; count: number }>
  byEducationLevel: Array<{ levelId: string; levelName: string; count: number }>
  lastUpdated: string
}

const getResourceStats = unstable_cache(
  async (): Promise<ResourceStats> => {
    const [
      total,
      free,
      premium,
      bySubject,
      byEducationLevel
    ] = await Promise.all([
      // Total de recursos
      prisma.resource.count(),
      
      // Recursos gratuitos
      prisma.resource.count({ where: { isFree: true } }),
      
      // Recursos premium
      prisma.resource.count({ where: { isFree: false } }),
      
      // Por disciplina
      prisma.resource.groupBy({
        by: ['subjectId'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } }
      }),
      
      // Por nível de ensino
      prisma.resource.groupBy({
        by: ['educationLevelId'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } }
      })
    ])

    // Enriquecer com nomes das disciplinas
    const subjectIds = bySubject.map(s => s.subjectId)
    const subjects = await prisma.subject.findMany({
      where: { id: { in: subjectIds } },
      select: { id: true, name: true }
    })
    const subjectMap = new Map(subjects.map(s => [s.id, s.name]))

    // Enriquecer com nomes dos níveis
    const levelIds = byEducationLevel.map(l => l.educationLevelId)
    const levels = await prisma.educationLevel.findMany({
      where: { id: { in: levelIds } },
      select: { id: true, name: true }
    })
    const levelMap = new Map(levels.map(l => [l.id, l.name]))

    return {
      total,
      free,
      premium,
      bySubject: bySubject.map(s => ({
        subjectId: s.subjectId,
        subjectName: subjectMap.get(s.subjectId) || 'Desconhecido',
        count: s._count.id
      })),
      byEducationLevel: byEducationLevel.map(l => ({
        levelId: l.educationLevelId,
        levelName: levelMap.get(l.educationLevelId) || 'Desconhecido',
        count: l._count.id
      })),
      lastUpdated: new Date().toISOString()
    }
  },
  ['resource-stats:v1'],
  {
    revalidate: 3600, // 1 hora
    tags: ['resource-stats', 'resources']
  }
)

export async function GET() {
  try {
    const stats = await getResourceStats()
    
    return NextResponse.json(stats, {
      headers: {
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=7200'
      }
    })
  } catch (error) {
    console.error('Erro ao buscar estatísticas de recursos:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar estatísticas' },
      { status: 500 }
    )
  }
}
