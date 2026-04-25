import { NextRequest, NextResponse } from 'next/server'
import { getPlannerAccess, hasPlannerAccess, listLessonPlansByUser } from '@/lib/lesson-plans/services'

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
      q: request.nextUrl.searchParams.get('q') ?? undefined,
      educationLevelSlug: request.nextUrl.searchParams.get('educationLevel') ?? undefined,
      gradeSlug: request.nextUrl.searchParams.get('grade') ?? undefined,
      subjectSlug: request.nextUrl.searchParams.get('subject') ?? undefined,
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
