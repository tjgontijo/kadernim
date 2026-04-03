import type {
  BillingCheckoutResponse,
  BillingPixStatusResponse,
  CheckoutRequest,
  GuestCheckoutRequest,
  SplitUpdate,
} from '@/lib/billing/types'

async function parseResponse<T>(response: Response): Promise<T> {
  const json = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(typeof json.error === 'string' ? json.error : 'Erro na requisição')
  }

  return json as T
}

export async function updateBillingSplitConfig(input: SplitUpdate) {
  const response = await fetch('/api/v1/billing/split', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })

  return parseResponse(response)
}

export async function fetchBillingPixStatus(input: {
  statusId: string
  statusToken?: string
  isAutomatic?: boolean
}): Promise<BillingPixStatusResponse> {
  const url = new URL(
    input.isAutomatic
      ? `/api/v1/billing/pix-automatic/${input.statusId}/status`
      : `/api/v1/billing/checkout/${input.statusId}/status`,
    window.location.origin
  )

  if (input.statusToken) {
    url.searchParams.set('token', input.statusToken)
  }

  const response = await fetch(url.toString())
  return parseResponse<BillingPixStatusResponse>(response)
}

export async function createBillingCheckout(input: {
  isLoggedIn: boolean
  payload: CheckoutRequest | GuestCheckoutRequest
}): Promise<BillingCheckoutResponse> {
  const endpoint = input.isLoggedIn ? '/api/v1/billing/checkout' : '/api/v1/billing/checkout-guest'
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input.payload),
  })

  return parseResponse<BillingCheckoutResponse>(response)
}
