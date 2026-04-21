import { NextRequest, NextResponse } from 'next/server'
import { getPlannerAccess, hasPlannerAccess, listLessonPlansByUser } from '@/lib/lesson-plans/services'

function asBool(value: string | null) {
  if (!value) return false
  return value === '1' || value === 'true'
}

export async function GET(request: NextRequest) {
  try {
    const access = await getPlannerAccess(request)

    if (!access) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!hasPlannerAccess(access)) {
      return NextResponse.json({ error: 'Assinatura necessária' }, { status: 403 })
    }

    const plans = await listLessonPlansByUser({
      userId: access.userId,
      includeArchived: asBool(request.nextUrl.searchParams.get('includeArchived')),
      q: request.nextUrl.searchParams.get('q') ?? undefined,
      gradeId: request.nextUrl.searchParams.get('gradeId') ?? undefined,
      subjectId: request.nextUrl.searchParams.get('subjectId') ?? undefined,
      sourceResourceId: request.nextUrl.searchParams.get('sourceResourceId') ?? undefined,
    })

    return NextResponse.json({ data: plans })
  } catch (error) {
    console.error('List planner error:', error)
    return NextResponse.json({ error: 'Erro ao listar planos' }, { status: 500 })
  }
}
