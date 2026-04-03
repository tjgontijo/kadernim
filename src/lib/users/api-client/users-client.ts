import type {
  CreateAdminUserInput,
  UpdateUserInput,
  UserListResponse,
  UserResourceAccessItem,
  UserSearchResponse,
} from '@/lib/users/types'

async function parseResponse<T>(response: Response): Promise<T> {
  const json = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(typeof json.error === 'string' ? json.error : 'Erro na requisição')
  }

  return json as T
}

export async function createAdminUser(input: CreateAdminUserInput) {
  const response = await fetch('/api/v1/admin/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })

  return parseResponse(response)
}

export async function updateAdminUser(userId: string, input: UpdateUserInput) {
  const response = await fetch(`/api/v1/admin/users/${userId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })

  return parseResponse(response)
}

export async function deleteAdminUser(userId: string) {
  const response = await fetch(`/api/v1/admin/users/${userId}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    const json = await response.json().catch(() => ({}))
    throw new Error(typeof json.error === 'string' ? json.error : 'Erro na requisição')
  }
}

export async function uploadAdminUserAvatar(userId: string, file: File) {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(`/api/v1/admin/users/${userId}/avatar`, {
    method: 'POST',
    body: formData,
  })

  return parseResponse(response)
}

export async function fetchAdminUserAccess(userId: string): Promise<UserResourceAccessItem[]> {
  const response = await fetch(`/api/v1/admin/users/${userId}/access`)
  return parseResponse<UserResourceAccessItem[]>(response)
}

export async function toggleAdminUserAccess(
  userId: string,
  input: { resourceId: string; hasAccess: boolean }
) {
  const response = await fetch(`/api/v1/admin/users/${userId}/access`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })

  return parseResponse(response)
}

export async function searchAdminUsers(query: string, limit = 10): Promise<UserSearchResponse> {
  const response = await fetch(
    `/api/v1/admin/users/search?q=${encodeURIComponent(query)}&limit=${limit}`
  )

  return parseResponse<UserSearchResponse>(response)
}

export async function listAdminUsers(params: URLSearchParams): Promise<UserListResponse> {
  const response = await fetch(`/api/v1/admin/users?${params.toString()}`)
  return parseResponse<UserListResponse>(response)
}
