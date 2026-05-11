import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/server/auth/auth'
import { CreateQuestionBankFeedbackSchema } from '@/lib/question-bank/schemas'
import { createQuestionBankFeedback } from '@/lib/question-bank/services'

export async function POST(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    const userId = session?.user?.id
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await ctx.params
    const body = await request.json()
    const parsed = CreateQuestionBankFeedbackSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Parametros invalidos', issues: parsed.error.format() }, { status: 400 })
    }

    const feedback = await createQuestionBankFeedback({
      questionId: id,
      userId,
      input: parsed.data,
    })

    return NextResponse.json({ success: true, data: feedback }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/v1/question-bank/questions/:id/feedback]', error)
    return NextResponse.json({ error: 'Erro ao registrar feedback' }, { status: 500 })
  }
}
