import type {
  CommunityConfig,
  CommunityRefinementOption,
  CommunityRequestListResponse,
  CommunityTitleOption,
  CommunityUsage,
} from '@/lib/community/types'

function buildCommunityQuery(params: Record<string, string | number | boolean | undefined>) {
  const search = new URLSearchParams()

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') {
      search.set(key, String(value))
    }
  }

  return search.toString()
}

async function parseResponse<T>(response: Response): Promise<T> {
  const json = await response.json()

  if (!response.ok || ('success' in json && !json.success)) {
    throw new Error(json.error || 'Erro na requisição')
  }

  return 'data' in json ? json.data : json
}

export async function fetchCommunityConfig(): Promise<CommunityConfig> {
  const response = await fetch('/api/v1/community/config')
  return parseResponse<CommunityConfig>(response)
}

export async function fetchCommunityUsage(): Promise<CommunityUsage> {
  const response = await fetch('/api/v1/community/usage')
  return parseResponse<CommunityUsage>(response)
}

export async function fetchCommunityRequests(params: {
  page?: number
  limit?: number
  q?: string
  educationLevelSlug?: string
  gradeSlug?: string
  subjectSlug?: string
  mine?: boolean
}): Promise<CommunityRequestListResponse> {
  const query = buildCommunityQuery(params)
  const response = await fetch(`/api/v1/community/requests?${query}`)
  return parseResponse<CommunityRequestListResponse>(response)
}

export async function createCommunityRequestRequest(formData: FormData): Promise<{ id: string }> {
  const response = await fetch('/api/v1/community/requests', {
    method: 'POST',
    body: formData,
  })

  return parseResponse<{ id: string }>(response)
}

export async function voteForCommunityRequest(requestId: string): Promise<{ id: string; voteCount: number }> {
  const response = await fetch(`/api/v1/community/requests/${requestId}/vote`, {
    method: 'POST',
  })

  return parseResponse<{ id: string; voteCount: number }>(response)
}

export async function generateCommunityTitleOptionsRequest(
  description: string
): Promise<CommunityTitleOption[]> {
  const response = await fetch('/api/v1/community/generate-title', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ description }),
  })

  const data = await parseResponse<{ titles: CommunityTitleOption[] }>(response)
  return data.titles
}

export async function refineCommunityRequestDescriptionRequest(input: {
  rawDescription: string
  educationLevelName: string
  subjectName: string
  gradeNames: string[]
}): Promise<CommunityRefinementOption[]> {
  const response = await fetch('/api/v1/community/refine-request', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })

  const data = await parseResponse<{ refined: CommunityRefinementOption[] }>(response)
  return data.refined
}
