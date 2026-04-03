import type {
  CreateLessonPlan,
  CreateLessonPlanSuccess,
  GenerateLessonPlanThemeInput,
  GenerateLessonPlanThemeResponse,
  LessonPlanDetail,
  LessonPlanResponse,
  LessonPlanUsage,
  RefineLessonPlanThemeResponse,
  RefineThemeRequest,
} from '@/lib/lesson-plans/types'

async function parseApiResponse<T>(response: Response): Promise<T> {
  const json = await response.json().catch(() => ({}))

  if (!response.ok || ('success' in json && !json.success)) {
    const message =
      typeof json.error === 'string' ? json.error : 'Erro na requisição'

    throw new Error(message)
  }

  return ('data' in json ? json.data : json) as T
}

export async function fetchLessonPlans(): Promise<LessonPlanResponse[]> {
  const response = await fetch('/api/v1/lesson-plans')
  return parseApiResponse<LessonPlanResponse[]>(response)
}

export async function fetchLessonPlan(id: string): Promise<LessonPlanDetail> {
  const response = await fetch(`/api/v1/lesson-plans/${id}`)
  return parseApiResponse<LessonPlanDetail>(response)
}

export async function fetchLessonPlanUsage(): Promise<LessonPlanUsage> {
  const response = await fetch('/api/v1/lesson-plans/usage')
  const usage = await parseApiResponse<Omit<LessonPlanUsage, 'percentage'>>(response)

  return {
    ...usage,
    percentage: Math.min(Math.round((usage.used / usage.limit) * 100), 100),
  }
}

export async function createLessonPlan(
  input: CreateLessonPlan
): Promise<CreateLessonPlanSuccess> {
  const response = await fetch('/api/v1/lesson-plans', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })

  return parseApiResponse<CreateLessonPlanSuccess>(response)
}

export async function generateLessonPlanTheme(
  input: GenerateLessonPlanThemeInput
): Promise<GenerateLessonPlanThemeResponse> {
  const response = await fetch('/api/v1/lesson-plans/generate-theme', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })

  return parseApiResponse<GenerateLessonPlanThemeResponse>(response)
}

export async function refineLessonPlanTheme(
  input: RefineThemeRequest
): Promise<RefineLessonPlanThemeResponse> {
  const response = await fetch('/api/v1/lesson-plans/refine-theme', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })

  return parseApiResponse<RefineLessonPlanThemeResponse>(response)
}

