import type { PushSubscriptionCreate, TestPushRequest, UnsubscribePush } from '@/lib/notifications/types'

async function parseResponse<T>(response: Response): Promise<T> {
  const json = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(typeof json.error === 'string' ? json.error : 'Erro na requisição')
  }

  return json as T
}

export async function subscribePushNotifications(input: PushSubscriptionCreate) {
  const response = await fetch('/api/v1/notifications/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })

  return parseResponse<{ id: string; success: true }>(response)
}

export async function unsubscribePushNotifications(input: UnsubscribePush) {
  const response = await fetch('/api/v1/notifications/unsubscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })

  return parseResponse<{ success: true }>(response)
}

export async function sendTestPush(input: TestPushRequest) {
  const response = await fetch('/api/v1/notifications/test-push', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })

  return parseResponse<{
    success: boolean
    message: string
    total: number
    sent: number
    failed: number
    errors: unknown[]
  }>(response)
}
