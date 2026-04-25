import {
  CreateLessonPlanInputSchema,
  LessonPlanCreateResponseSchema,
  LessonPlanListResponseSchema,
  LessonPlanRecordSchema,
  type CreateLessonPlanInput,
  type LessonPlanBuildPhase,
  type LessonPlanBuildPhaseStatus,
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

type StreamPhaseEvent = {
  type: 'phase'
  phase: LessonPlanBuildPhase
  status: LessonPlanBuildPhaseStatus
  details?: string
}

type StreamDoneEvent = {
  type: 'done'
  id: string
  redirectUrl: string
}

type StreamErrorEvent = {
  type: 'error'
  error: string
}

type CreateLessonPlanStreamEvent = StreamPhaseEvent | StreamDoneEvent | StreamErrorEvent

function parseSseChunk(chunk: string) {
  const entries = chunk
    .split('\n\n')
    .map((item) => item.trim())
    .filter(Boolean)

  const events: CreateLessonPlanStreamEvent[] = []
  for (const entry of entries) {
    const dataLine = entry
      .split('\n')
      .find((line) => line.startsWith('data: '))

    if (!dataLine) continue
    const payload = dataLine.slice('data: '.length)
    try {
      const parsed = JSON.parse(payload) as CreateLessonPlanStreamEvent
      if (parsed && typeof parsed === 'object' && 'type' in parsed) {
        events.push(parsed)
      }
    } catch {
      // Ignore malformed event
    }
  }

  return events
}

export async function createLessonPlanFromResourceStream(
  resourceId: string,
  input: CreateLessonPlanInput,
  options: {
    onPhase: (event: { phase: LessonPlanBuildPhase; status: LessonPlanBuildPhaseStatus; details?: string }) => void
  }
): Promise<LessonPlanCreateResponse> {
  const payload = CreateLessonPlanInputSchema.parse(input)

  const response = await fetch(`/api/v1/resources/${resourceId}/lesson-plans?stream=1`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!response.ok || !response.body) {
    const json = await readJson<unknown>(response)
    return LessonPlanCreateResponseSchema.parse(json)
  }

  const decoder = new TextDecoder()
  const reader = response.body.getReader()
  let pending = ''
  let donePayload: LessonPlanCreateResponse | null = null

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    pending += decoder.decode(value, { stream: true })

    const split = pending.split('\n\n')
    pending = split.pop() ?? ''

    for (const block of split) {
      const events = parseSseChunk(`${block}\n\n`)
      for (const event of events) {
        if (event.type === 'phase') {
          options.onPhase({
            phase: event.phase,
            status: event.status,
            details: event.details,
          })
          continue
        }

        if (event.type === 'error') {
          throw new Error(event.error)
        }

        if (event.type === 'done') {
          donePayload = LessonPlanCreateResponseSchema.parse({
            id: event.id,
            redirectUrl: event.redirectUrl,
          })
        }
      }
    }
  }

  if (!donePayload) {
    throw new Error('A criação do plano foi interrompida antes da conclusão.')
  }

  return donePayload
}

export async function fetchLessonPlans(params?: {
  q?: string
  educationLevel?: string
  grade?: string
  subject?: string
  gradeId?: string
  subjectId?: string
  sourceResourceId?: string
}): Promise<LessonPlanListItem[]> {
  const query = buildQuery({
    q: params?.q,
    educationLevel: params?.educationLevel,
    grade: params?.grade,
    subject: params?.subject,
    gradeId: params?.gradeId,
    subjectId: params?.subjectId,
    sourceResourceId: params?.sourceResourceId,
  })

  const response = await fetch(`/api/v1/planner${query ? `?${query}` : ''}`)
  const json = await readJson<unknown>(response)
  const parsed = LessonPlanListResponseSchema.parse(json)
  return parsed.data
}

export async function fetchPlannerCounts(): Promise<{ plans: number }> {
  const response = await fetch('/api/v1/planner/counts')
  return readJson<{ plans: number }>(response)
}

export async function fetchLessonPlanById(id: string): Promise<LessonPlanRecord> {
  const response = await fetch(`/api/v1/planner/${id}`)
  const json = await readJson<unknown>(response)
  return LessonPlanRecordSchema.parse(json)
}

export async function deleteLessonPlan(id: string): Promise<void> {
  const response = await fetch(`/api/v1/planner/${id}`, {
    method: 'DELETE',
  })

  await readJson<unknown>(response)
}
