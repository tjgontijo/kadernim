import {
  CreateLessonPlanInputSchema,
  LessonPlanArchiveInputSchema,
  LessonPlanCreateResponseSchema,
  LessonPlanListResponseSchema,
  LessonPlanRecordSchema,
  type CreateLessonPlanInput,
  type LessonPlanArchiveInput,
  type LessonPlanCreateResponse,
  type LessonPlanListItem,
  type LessonPlanRecord,
} from '@/lib/lesson-plans/schemas'

function buildQuery(params: Record<string, string | boolean | undefined>) {
  const search = new URLSearchParams()

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === '') continue
    search.set(key, String(value))
  }

  return search.toString()
}

async function readJson<T>(response: Response): Promise<T> {
  const json = await response.json().catch(() => ({}))

  if (!response.ok) {
    const message =
      json && typeof json === 'object' && 'error' in json && typeof json.error === 'string'
        ? json.error
        : 'Erro na requisição'
    throw new Error(message)
  }

  return json as T
}

export async function createLessonPlanFromResource(
  resourceId: string,
  input: CreateLessonPlanInput
): Promise<LessonPlanCreateResponse> {
  const payload = CreateLessonPlanInputSchema.parse(input)

  const response = await fetch(`/api/v1/resources/${resourceId}/lesson-plans`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  const json = await readJson<unknown>(response)
  return LessonPlanCreateResponseSchema.parse(json)
}

export async function fetchLessonPlans(params?: {
  q?: string
  gradeId?: string
  subjectId?: string
  sourceResourceId?: string
  includeArchived?: boolean
}): Promise<LessonPlanListItem[]> {
  const query = buildQuery({
    q: params?.q,
    gradeId: params?.gradeId,
    subjectId: params?.subjectId,
    sourceResourceId: params?.sourceResourceId,
    includeArchived: params?.includeArchived,
  })

  const response = await fetch(`/api/v1/planner${query ? `?${query}` : ''}`)
  const json = await readJson<unknown>(response)
  const parsed = LessonPlanListResponseSchema.parse(json)
  return parsed.data
}

export async function fetchLessonPlanById(id: string): Promise<LessonPlanRecord> {
  const response = await fetch(`/api/v1/planner/${id}`)
  const json = await readJson<unknown>(response)
  return LessonPlanRecordSchema.parse(json)
}

export async function archiveLessonPlan(id: string, input: LessonPlanArchiveInput): Promise<LessonPlanRecord> {
  const payload = LessonPlanArchiveInputSchema.parse(input)

  const response = await fetch(`/api/v1/planner/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  const json = await readJson<unknown>(response)
  return LessonPlanRecordSchema.parse(json)
}
