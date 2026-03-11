import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/server/auth'
import { CreateLessonPlanSchema } from '@/schemas/lesson-plans/lesson-plan-schemas'
import { getUserRole } from '@/services/users/get-user-role'

type LessonPlanUser = {
  id: string
  role?: string | null
}

export async function requireLessonPlanUser(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers })

  if (!session?.user) {
    return NextResponse.json({ success: false, error: 'Não autenticado' }, { status: 401 })
  }

  return session.user as LessonPlanUser
}

export async function requireLessonPlanCreator(request: NextRequest) {
  const user = await requireLessonPlanUser(request)
  if (user instanceof NextResponse) {
    return user
  }

  const userRole = await getUserRole(user.id)
  if (userRole !== 'subscriber' && userRole !== 'admin') {
    return NextResponse.json(
      { success: false, error: 'Apenas assinantes podem gerar planos de aula' },
      { status: 403 }
    )
  }

  return user
}

export async function parseCreateLessonPlanRequest(request: NextRequest) {
  const validation = CreateLessonPlanSchema.safeParse(await request.json())

  if (!validation.success) {
    return NextResponse.json(
      { success: false, error: 'Dados inválidos', details: validation.error.issues },
      { status: 400 }
    )
  }

  return validation.data
}

export function buildLessonPlanDownloadUrls(id: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  return {
    docx: `${baseUrl}/api/v1/lesson-plans/${id}/export/docx`,
    pdf: `${baseUrl}/api/v1/lesson-plans/${id}/export/pdf`,
  }
}

export function lessonPlanRouteErrorResponse(
  action: 'list' | 'create' | 'get' | 'export',
  error: unknown
) {
  if (error instanceof Error) {
    if (error.message === 'User not found') {
      return NextResponse.json(
        { success: false, error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    if (error.message === 'LIMIT_EXCEEDED') {
      return NextResponse.json(
        { success: false, error: 'Limite mensal de planos atingido (30 planos/mês)' },
        { status: 429 }
      )
    }

    if (error.message === 'BNCC_SKILLS_NOT_FOUND') {
      return NextResponse.json(
        { success: false, error: 'Algumas habilidades BNCC não foram encontradas' },
        { status: 400 }
      )
    }

    if (error.message === 'LESSON_PLAN_NOT_FOUND') {
      return NextResponse.json({ error: 'Plano não encontrado' }, { status: 404 })
    }

    if (error.message === 'LESSON_PLAN_FORBIDDEN') {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
    }
  }

  const messages = {
    list: 'Erro ao listar planos de aula',
    create: 'Erro ao criar plano de aula',
    get: 'Erro ao buscar plano de aula',
    export: 'Erro ao exportar plano de aula',
  } as const

  console.error(`[lesson-plans:${action}]`, error)
  return NextResponse.json({ success: false, error: messages[action] }, { status: 500 })
}

export function invalidLessonPlanFormat() {
  return NextResponse.json({ error: 'Formato inválido' }, { status: 400 })
}
