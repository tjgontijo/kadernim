import { NextRequest, NextResponse } from 'next/server'
import { CreateLessonPlanInputSchema } from '@/lib/lesson-plans/schemas'
import {
  createLessonPlanFromResource,
  getPlannerAccess,
  hasPlannerAccess,
} from '@/lib/lesson-plans/services'

export async function POST(
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

    const { id: resourceId } = await ctx.params
    const parsed = CreateLessonPlanInputSchema.safeParse(await request.json())

    if (!parsed.success) {
      return NextResponse.json({ error: 'Dados inválidos', details: parsed.error.format() }, { status: 400 })
    }

    const plan = await createLessonPlanFromResource({
      userId: access.userId,
      resourceId,
      input: parsed.data,
    })

    return NextResponse.json({
      id: plan.id,
      redirectUrl: `/planner/${plan.id}`,
    }, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === 'RESOURCE_NOT_FOUND') {
      return NextResponse.json({ error: 'Recurso não encontrado' }, { status: 404 })
    }

    console.error('Create lesson plan error:', error)
    return NextResponse.json({ error: 'Erro ao criar plano de aula' }, { status: 500 })
  }
}
