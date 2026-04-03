import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/server/auth/auth'
import { logger } from '@/server/logger'
import { CommunityFilterSchema, CommunityRequestSchema } from '@/lib/community/schemas'
import { listCommunityRequests } from '@/lib/community/queries'
import { createCommunityRequest } from '@/lib/community/services'
import { getUserRole } from '@/services/users/get-user-role'

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    const userId = session?.user?.id

    const searchParams = request.nextUrl.searchParams
    const parsed = CommunityFilterSchema.safeParse({
      page: searchParams.get('page') ?? undefined,
      limit: searchParams.get('limit') ?? undefined,
      status: searchParams.get('status') ?? undefined,
      votingMonth: searchParams.get('votingMonth') ?? undefined,
      educationLevelId: searchParams.get('educationLevelId') ?? undefined,
      subjectId: searchParams.get('subjectId') ?? undefined,
      q: searchParams.get('q') ?? undefined,
      educationLevelSlug: searchParams.get('educationLevelSlug') ?? undefined,
      gradeSlug: searchParams.get('gradeSlug') ?? undefined,
      subjectSlug: searchParams.get('subjectSlug') ?? undefined,
      mine: searchParams.get('mine') ?? undefined,
    })

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Parâmetros inválidos', details: parsed.error.format() },
        { status: 400 }
      )
    }

    if (parsed.data.mine && !userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const result = await listCommunityRequests({
      ...parsed.data,
      currentUserId: userId,
    })

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    logger.error(
      { route: '/api/v1/community/requests', error: error instanceof Error ? error.message : String(error) },
      'Failed to list community requests'
    )
    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno',
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRole = await getUserRole(session.user.id)
    const formData = await request.formData()
    const body = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      hasBnccAlignment: formData.get('hasBnccAlignment') === 'true',
      educationLevelId: (formData.get('educationLevelId') as string) || undefined,
      gradeId: (formData.get('gradeId') as string) || undefined,
      subjectId: (formData.get('subjectId') as string) || undefined,
      bnccSkillCodes: formData.getAll('bnccSkillCodes') as string[],
    }

    const parsed = CommunityRequestSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: parsed.error.format() },
        { status: 400 }
      )
    }

    const attachments = formData
      .getAll('attachments')
      .filter((value): value is File => value instanceof File)

    const result = await createCommunityRequest(session.user.id, userRole as never, {
      ...parsed.data,
      attachments,
    })

    if (!result.success) {
      const status = result.error === 'User not found' ? 404 : 400
      return NextResponse.json({ success: false, error: result.error }, { status })
    }

    return NextResponse.json({ success: true, data: result.data })
  } catch (error) {
    logger.error(
      { route: '/api/v1/community/requests', error: error instanceof Error ? error.message : String(error) },
      'Failed to create community request'
    )
    return NextResponse.json(
      { success: false, error: 'Erro interno' },
      { status: 500 }
    )
  }
}
