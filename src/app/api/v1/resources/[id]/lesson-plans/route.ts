import { NextRequest, NextResponse } from 'next/server'
import { CreateLessonPlanInputSchema, type LessonPlanBuildPhase, type LessonPlanBuildPhaseStatus } from '@/lib/lesson-plans/schemas'
import {
  createLessonPlanFromResource,
  getPlannerAccess,
  hasPlannerAccess,
} from '@/lib/lesson-plans/services'

type StreamEvent =
  | { type: 'phase'; phase: LessonPlanBuildPhase; status: LessonPlanBuildPhaseStatus; details?: string }
  | { type: 'done'; id: string; redirectUrl: string }
  | { type: 'error'; error: string }

function toSse(event: StreamEvent) {
  return `data: ${JSON.stringify(event)}\n\n`
}

function streamResponse(
  run: (emit: (event: StreamEvent) => void) => Promise<void>
) {
  const encoder = new TextEncoder()

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const emit = (event: StreamEvent) => {
        controller.enqueue(encoder.encode(toSse(event)))
      }

      run(emit)
        .catch((error) => {
          const message = error instanceof Error ? error.message : 'Erro ao criar plano de aula'
          emit({ type: 'error', error: message })
        })
        .finally(() => {
          controller.close()
        })
    },
  })

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  })
}

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

    const shouldStream = request.nextUrl.searchParams.get('stream') === '1'

    if (!shouldStream) {
      const plan = await createLessonPlanFromResource({
        userId: access.userId,
        resourceId,
        input: parsed.data,
      })

      return NextResponse.json({
        id: plan.id,
        redirectUrl: `/planner/${plan.id}`,
      }, { status: 201 })
    }

    return streamResponse(async (emit) => {
      const plan = await createLessonPlanFromResource({
        userId: access.userId,
        resourceId,
        input: parsed.data,
        onPhase: (event) => {
          emit({
            type: 'phase',
            phase: event.phase,
            status: event.status,
            details: event.details,
          })
        },
      })

      emit({ type: 'done', id: plan.id, redirectUrl: `/planner/${plan.id}` })
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'RESOURCE_NOT_FOUND') {
      return NextResponse.json({ error: 'Recurso não encontrado' }, { status: 404 })
    }

    console.error('Create lesson plan error:', error)
    return NextResponse.json({ error: 'Erro ao criar plano de aula' }, { status: 500 })
  }
}
