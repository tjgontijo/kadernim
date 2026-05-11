import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/server/auth/auth'
import { z } from 'zod'
import { updateQuestionBankQuestionStatus } from '@/lib/question-bank/services'

const ADMIN_ROLES = new Set(['admin', 'manager', 'editor'])

const BodySchema = z.object({
  status: z.enum(['DRAFT_AI', 'APPROVED_AI', 'APPROVED_TEACHER', 'FLAGGED', 'REJECTED', 'ARCHIVED']),
})

export async function PUT(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    const user = session?.user
    if (!user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!ADMIN_ROLES.has(user.role ?? '')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { id } = await ctx.params
    const body = await request.json()
    const parsed = BodySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Parametros invalidos', issues: parsed.error.format() }, { status: 400 })
    }

    const updated = await updateQuestionBankQuestionStatus(
      id,
      parsed.data.status,
      parsed.data.status === 'APPROVED_AI' || parsed.data.status === 'APPROVED_TEACHER'
        ? user.id
        : undefined
    )

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error('[PUT /api/v1/admin/question-bank/questions/:id/status]', error)
    return NextResponse.json({ error: 'Erro ao atualizar status' }, { status: 500 })
  }
}
