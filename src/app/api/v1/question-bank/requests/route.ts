import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/server/auth/auth'
import { CreateQuestionBankRequestSchema, QuestionBankRequestResponseSchema } from '@/lib/question-bank/schemas'
import { createQuestionBankRequest } from '@/lib/question-bank/services'

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    const userId = session?.user?.id
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const parsed = CreateQuestionBankRequestSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Parametros invalidos', issues: parsed.error.format() }, { status: 400 })
    }

    const result = await createQuestionBankRequest(userId, parsed.data)
    const payload = QuestionBankRequestResponseSchema.parse({
      requestId: result.requestId,
      reusedCount: result.reusedCount,
      generatedCount: result.generatedCount,
      items: result.items,
    })

    return NextResponse.json(payload, { status: result.deficit > 0 ? 206 : 200 })
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'GRADE_NOT_FOUND' || error.message === 'SUBJECT_NOT_FOUND') {
        return NextResponse.json({ error: error.message }, { status: 404 })
      }

      if (error.message === 'GRADE_OUTSIDE_MVP_SCOPE' || error.message === 'SUBJECT_OUTSIDE_MVP_SCOPE') {
        return NextResponse.json({ error: error.message }, { status: 422 })
      }
    }

    console.error('[POST /api/v1/question-bank/requests]', error)
    return NextResponse.json({ error: 'Erro ao criar requisicao de questoes' }, { status: 500 })
  }
}
