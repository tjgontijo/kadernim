import { NextRequest, NextResponse } from 'next/server'
import { LessonPlanService } from '@/lib/lesson-plans/services/lesson-plan-service'
import {
  buildLessonPlanDownloadUrls,
  lessonPlanRouteErrorResponse,
  parseCreateLessonPlanRequest,
  requireLessonPlanCreator,
  requireLessonPlanUser,
} from './route-support'

export async function GET(request: NextRequest) {
  try {
    const user = await requireLessonPlanUser(request)
    if (user instanceof NextResponse) {
      return user
    }

    const plans = await LessonPlanService.listByUser(user.id)

    return NextResponse.json({ success: true, data: plans })
  } catch (error) {
    return lessonPlanRouteErrorResponse('list', error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireLessonPlanCreator(request)
    if (user instanceof NextResponse) {
      return user
    }

    const parsed = await parseCreateLessonPlanRequest(request)
    if (parsed instanceof NextResponse) {
      return parsed
    }

    const lessonPlan = await LessonPlanService.create(user.id, parsed)

    return NextResponse.json(
      {
        success: true,
        data: { ...lessonPlan, downloadUrls: buildLessonPlanDownloadUrls(lessonPlan.id) },
      },
      { status: 201 }
    )
  } catch (error) {
    return lessonPlanRouteErrorResponse('create', error)
  }
}
