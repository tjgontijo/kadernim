import { NextRequest, NextResponse } from 'next/server'
import { LessonPlanService } from '@/lib/lesson-plans/services/lesson-plan-service'
import {
  lessonPlanRouteErrorResponse,
  requireLessonPlanUser,
} from '../route-support'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireLessonPlanUser(request)
    if (user instanceof NextResponse) {
      return user
    }

    const { id } = await params
    const plan = await LessonPlanService.getByIdWithBnccDescriptions(id, {
      userId: user.id,
      isAdmin: user.role === 'admin',
    })

    return NextResponse.json({ success: true, data: plan })
  } catch (error) {
    return lessonPlanRouteErrorResponse('get', error)
  }
}
