import { NextRequest, NextResponse } from 'next/server'
import { getLessonPlanById, getPlannerAccess, hasPlannerAccess } from '@/lib/lesson-plans/services'
import { generateLessonPlanPdfBuffer } from '@/lib/export/pdf-template'
import { generateLessonPlanDocxBuffer } from '@/lib/export/word-template'

function sanitizeFileName(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
}

export async function GET(
  request: NextRequest,
  ctx: { params: Promise<{ id: string; format: string }> }
) {
  try {
    const access = await getPlannerAccess(request)

    if (!access) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!hasPlannerAccess(access)) {
      return NextResponse.json({ error: 'Assinatura necessária' }, { status: 403 })
    }

    const { id, format } = await ctx.params

    if (format !== 'pdf' && format !== 'docx') {
      return NextResponse.json({ error: 'Formato inválido' }, { status: 400 })
    }

    const plan = await getLessonPlanById({
      id,
      userId: access.userId,
      isAdmin: access.isAdmin,
    })

    const safeTitle = sanitizeFileName(plan.title || 'plano-de-aula')

    if (format === 'pdf') {
      const buffer = await generateLessonPlanPdfBuffer(plan)
      return new NextResponse(new Uint8Array(buffer), {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${safeTitle}.pdf"`,
        },
      })
    }

    const buffer = await generateLessonPlanDocxBuffer(plan)
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${safeTitle}.docx"`,
      },
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'LESSON_PLAN_NOT_FOUND') {
      return NextResponse.json({ error: 'Plano de aula não encontrado' }, { status: 404 })
    }

    console.error('Export lesson plan error:', error)
    return NextResponse.json({ error: 'Erro ao exportar plano de aula' }, { status: 500 })
  }
}
