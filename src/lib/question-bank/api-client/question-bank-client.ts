import type {
  CreateQuestionBankFeedbackInput,
  CreateQuestionBankRequestInput,
  QuestionBankQuestionDto,
} from '@/lib/question-bank/schemas'

async function parseResponse<T>(response: Response): Promise<T> {
  const json = await response.json().catch(() => ({}))
  if (!response.ok) {
    const message = typeof json.error === 'string' ? json.error : 'Erro na requisicao'
    throw new Error(message)
  }
  return json as T
}

export async function createQuestionBankRequest(input: CreateQuestionBankRequestInput) {
  const response = await fetch('/api/v1/question-bank/requests', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })

  return parseResponse<{
    requestId: string
    reusedCount: number
    generatedCount: number
    items: QuestionBankQuestionDto[]
  }>(response)
}

export async function listQuestionBankQuestions(params?: {
  page?: number
  limit?: number
  gradeSlug?: string
  subjectSlug?: string
  difficulty?: string
  status?: string
  questionTypeCode?: string
  bnccSkillId?: string
}) {
  const search = new URLSearchParams()
  if (params?.page) search.set('page', String(params.page))
  if (params?.limit) search.set('limit', String(params.limit))
  if (params?.gradeSlug) search.set('gradeSlug', params.gradeSlug)
  if (params?.subjectSlug) search.set('subjectSlug', params.subjectSlug)
  if (params?.difficulty) search.set('difficulty', params.difficulty)
  if (params?.status) search.set('status', params.status)
  if (params?.questionTypeCode) search.set('questionTypeCode', params.questionTypeCode)
  if (params?.bnccSkillId) search.set('bnccSkillId', params.bnccSkillId)

  const response = await fetch(`/api/v1/question-bank/questions${search.toString() ? `?${search.toString()}` : ''}`)
  return parseResponse<{
    data: QuestionBankQuestionDto[]
    pagination: { page: number; limit: number; hasMore: boolean }
  }>(response)
}

export async function createQuestionBankFeedback(questionId: string, input: CreateQuestionBankFeedbackInput) {
  const response = await fetch(`/api/v1/question-bank/questions/${questionId}/feedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  return parseResponse<{ success: true }>(response)
}

export async function exportQuestionBankDocx(input: {
  requestId: string
  questionIds: string[]
}): Promise<Blob> {
  const response = await fetch(`/api/v1/question-bank/requests/${input.requestId}/export/docx`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      questionIds: input.questionIds,
    }),
  })
  if (!response.ok) {
    const json = await response.json().catch(() => ({}))
    throw new Error(typeof json.error === 'string' ? json.error : 'Erro ao exportar DOCX')
  }
  return response.blob()
}

export async function exportQuestionBankGoogleDocs(requestId: string) {
  const response = await fetch(`/api/v1/question-bank/requests/${requestId}/export/google-docs`, {
    method: 'POST',
  })
  return parseResponse<{ success: true; data: { documentId: string; url: string; title: string } }>(response)
}
