import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getPlannerAccess, hasPlannerAccess } from '@/lib/lesson-plans/services'

export async function GET(request: NextRequest) {
  try {
    const access = await getPlannerAccess(request)

    if (!access) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!hasPlannerAccess(access)) {
      return NextResponse.json({ error: 'Assinatura necessária' }, { status: 403 })
    }

    const plans = await prisma.lessonPlan.count({
      where: {
        userId: access.userId,
        archivedAt: null,
      },
    })

    return NextResponse.json(
      { plans },
      {
        headers: {
          'Cache-Control': 'private, max-age=300',
        },
      }
    )
  } catch (error) {
    console.error('[GET /api/v1/planner/counts] Error:', error)
    return NextResponse.json({ error: 'Erro ao carregar contador de planos' }, { status: 500 })
  }
}

