import { NextRequest, NextResponse } from 'next/server'
import { generatePDFBuffer } from '@/lib/export/pdf-template'
import { generateWordDocument } from '@/lib/export/word-template'
import { type LessonPlanResponse } from '@/schemas/lesson-plans/lesson-plan-schemas'
import { LessonPlanService } from '@/services/lesson-plans/lesson-plan-service'
import {
  invalidLessonPlanFormat,
  lessonPlanRouteErrorResponse,
  requireLessonPlanUser,
} from '../../../route-support'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; format: string }> }
) {
  try {
    const user = await requireLessonPlanUser(request)
    if (user instanceof NextResponse) {
      return user
    }

    const { id, format } = await params
    const plan = await LessonPlanService.getByIdWithBnccDescriptions(id, {
      userId: user.id,
      isAdmin: user.role === 'admin',
    })

    const safeTitle = plan.title.toLowerCase().replace(/[^a-z0-9]/g, '-').substring(0, 50)

    if (format === 'docx') {
      const buffer = await generateWordDocument(
        plan as unknown as LessonPlanResponse,
        plan.bnccSkillDescriptions
      )

      return new NextResponse(buffer as never, {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'Content-Disposition': `attachment; filename="plano-de-aula-${safeTitle}.docx"`,
          'Cache-Control': 'no-store',
        },
      })
    }

    if (format === 'pdf') {
      const buffer = await generatePDFBuffer(
        plan as unknown as LessonPlanResponse,
        plan.bnccSkillDescriptions
      )

      return new NextResponse(buffer as never, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `inline; filename="plano-de-aula-${safeTitle}.pdf"`,
          'Cache-Control': 'no-store',
        },
      })
    }

    return invalidLessonPlanFormat()
  } catch (error) {
    return lessonPlanRouteErrorResponse('export', error)
  }
}
