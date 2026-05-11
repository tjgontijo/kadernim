import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/server/auth/auth'
import { QuestionBankListFilterSchema } from '@/lib/question-bank/schemas'
import { listQuestionBankQuestions } from '@/lib/question-bank/services'

function toDto(item: any) {
  return {
    id: item.id,
    prompt: item.prompt,
    instruction: item.instruction ?? null,
    difficulty: item.difficulty,
    status: item.status,
    questionTypeCode: item.questionType.code,
    questionTypeName: item.questionType.name,
    questionSourceCode: item.questionSource.code,
    questionSourceName: item.questionSource.name,
    payload: item.payload,
    answerKey: item.answerKey,
    explanation: item.explanation ?? null,
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    const userId = session?.user?.id
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const parsed = QuestionBankListFilterSchema.safeParse({
      gradeSlug: request.nextUrl.searchParams.get('gradeSlug') ?? undefined,
      subjectSlug: request.nextUrl.searchParams.get('subjectSlug') ?? undefined,
      difficulty: request.nextUrl.searchParams.get('difficulty') ?? undefined,
      status: request.nextUrl.searchParams.get('status') ?? undefined,
      questionTypeCode: request.nextUrl.searchParams.get('questionTypeCode') ?? undefined,
      bnccSkillId: request.nextUrl.searchParams.get('bnccSkillId') ?? undefined,
      page: request.nextUrl.searchParams.get('page') ?? undefined,
      limit: request.nextUrl.searchParams.get('limit') ?? undefined,
    })

    if (!parsed.success) {
      return NextResponse.json({ error: 'Parametros invalidos', issues: parsed.error.format() }, { status: 400 })
    }

    const result = await listQuestionBankQuestions(parsed.data)
    return NextResponse.json({
      data: result.items.map(toDto),
      pagination: result.pagination,
    })
  } catch (error) {
    console.error('[GET /api/v1/question-bank/questions]', error)
    return NextResponse.json({ error: 'Erro ao listar questoes' }, { status: 500 })
  }
}
