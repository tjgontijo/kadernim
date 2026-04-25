import { NextRequest, NextResponse } from 'next/server'
import {
  deleteLessonPlan,
  getLessonPlanById,
  getPlannerAccess,
  hasPlannerAccess,
} from '@/lib/lesson-plans/services'

export async function GET(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const access = await getPlannerAccess(request)

    if (!access) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!hasPlannerAccess(access)) {
      return NextResponse.json({ error: 'Assinatura necessária' }, { status: 403 })
    }

    const { id } = await ctx.params
    const plan = await getLessonPlanById({
      id,
      userId: access.userId,
      isAdmin: access.isAdmin,
    })

    return NextResponse.json(plan)
  } catch (error) {
    if (error instanceof Error && error.message === 'LESSON_PLAN_NOT_FOUND') {
      return NextResponse.json({ error: 'Plano de aula não encontrado' }, { status: 404 })
    }

    console.error('Get lesson plan error:', error)
    return NextResponse.json({ error: 'Erro ao buscar plano de aula' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const access = await getPlannerAccess(request)

    if (!access) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!hasPlannerAccess(access)) {
      return NextResponse.json({ error: 'Assinatura necessária' }, { status: 403 })
    }

    const { id } = await ctx.params
    await deleteLessonPlan({
      id,
      userId: access.userId,
      isAdmin: access.isAdmin,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Error && error.message === 'LESSON_PLAN_NOT_FOUND') {
      return NextResponse.json({ error: 'Plano de aula não encontrado' }, { status: 404 })
    }

    console.error('Delete lesson plan error:', error)
    return NextResponse.json({ error: 'Erro ao excluir plano de aula' }, { status: 500 })
  }
}
