import type { CampaignAnalyticsData, CampaignInput, PushCampaign } from '@/lib/campaigns/types'

async function parseResponse<T>(response: Response): Promise<T> {
  const json = await response.json().catch(() => ({}))

  if (!response.ok || (typeof json.success === 'boolean' && !json.success)) {
    throw new Error(typeof json.error === 'string' ? json.error : 'Erro na requisição')
  }

  return ('data' in json ? json.data : json) as T
}

export async function createCampaign(input: CampaignInput) {
  const response = await fetch('/api/v1/admin/campaigns', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })

  return parseResponse<PushCampaign>(response)
}

export async function updateCampaign(id: string, input: CampaignInput) {
  const response = await fetch(`/api/v1/admin/campaigns/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })

  return parseResponse<PushCampaign>(response)
}

export async function deleteCampaign(id: string) {
  const response = await fetch(`/api/v1/admin/campaigns/${id}`, {
    method: 'DELETE',
  })

  await parseResponse(response)
}

export async function fetchCampaignAnalytics(period: string) {
  const response = await fetch(`/api/v1/admin/campaigns/analytics?period=${period}`)
  return parseResponse<CampaignAnalyticsData>(response)
}
