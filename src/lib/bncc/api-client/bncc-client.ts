import type {
  BnccSkillDetailResponse,
  BnccSkillsListResponse,
} from '@/lib/bncc/schemas/bncc-schemas'

function buildQuery(params: Record<string, string | number | string[] | undefined>) {
  const search = new URLSearchParams()

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === '') {
      continue
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        if (item) {
          search.append(key, item)
        }
      }
      continue
    }

    search.set(key, String(value))
  }

  return search.toString()
}

async function parseJsonResponse<T>(response: Response): Promise<T> {
  const text = await response.text()
  const json = text ? JSON.parse(text) : null

  if (!response.ok) {
    const message =
      json && typeof json === 'object' && 'error' in json && typeof json.error === 'string'
        ? json.error
        : 'Erro na requisição'

    throw new Error(message)
  }

  return json as T
}

export async function fetchBnccSkills(params: {
  q?: string
  educationLevel?: string
  grade?: string[]
  knowledgeArea?: string
  subject?: string
  page?: number
  limit?: number
}): Promise<BnccSkillsListResponse> {
  const query = buildQuery(params)
  const response = await fetch(`/api/v1/bncc/skills?${query}`)
  return parseJsonResponse<BnccSkillsListResponse>(response)
}

export async function fetchBnccSkillDetail(skillId: string): Promise<BnccSkillDetailResponse['data']> {
  const response = await fetch(`/api/v1/bncc/skills/${skillId}`)
  const json = await parseJsonResponse<BnccSkillDetailResponse>(response)
  return json.data
}
