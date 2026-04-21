import { PedagogicalContent, PedagogicalObjectivesSchema, PedagogicalStepsSchema } from '../schemas/pedagogical-schemas'
import type {
  AdminResourceDetail,
  AdminResourceListResponse,
  CreateResourceInput,
  ListResourcesFilter,
  ResourceAccessGrantInput,
  ResourceAccessListResponse,
  ResourceDetail,
  ResourceDownloadLinkResponse,
  ResourceMetaResponse,
  ResourcesSummaryResponse,
  UpdateResourceImageInput,
  UpdateResourceInput,
  UpdateResourceVideoInput,
} from '@/lib/resources/types'

function buildQuery(params: Record<string, string | number | boolean | undefined>) {
  const search = new URLSearchParams()

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') {
      search.set(key, String(value))
    }
  }

  return search.toString()
}

async function readResponseBody(response: Response) {
  if (response.status === 204) {
    return null
  }

  const text = await response.text()
  if (!text) {
    return null
  }

  return JSON.parse(text)
}

async function parseJsonResponse<T>(response: Response): Promise<T> {
  const json = await readResponseBody(response)

  if (!response.ok) {
    const message =
      json && typeof json === 'object' && 'error' in json && typeof json.error === 'string'
        ? json.error
        : 'Erro na requisição'

    throw new Error(message)
  }

  return json as T
}

export async function fetchResourceMeta(): Promise<ResourceMetaResponse> {
  const response = await fetch('/api/v1/resources/meta')
  return parseJsonResponse<ResourceMetaResponse>(response)
}

export async function fetchResourceCounts(): Promise<{ library: number; favorites: number }> {
  const response = await fetch('/api/v1/resources/counts')
  return parseJsonResponse<{ library: number; favorites: number }>(response)
}

export async function fetchResourcesSummary(params: {
  page?: number
  limit?: number
  tab: 'all' | 'mine' | 'favorites'
  q?: string
  educationLevel?: string
  grade?: string
  subject?: string
}): Promise<ResourcesSummaryResponse> {
  const query = buildQuery(params)
  const response = await fetch(`/api/v1/resources/summary?${query}`)
  return parseJsonResponse<ResourcesSummaryResponse>(response)
}

export async function fetchResourceDetail(resourceId: string): Promise<ResourceDetail> {
  const response = await fetch(`/api/v1/resources/${resourceId}`)
  const json = await parseJsonResponse<{ data: ResourceDetail }>(response)
  return json.data
}

export async function createResourceDownloadLink(
  resourceId: string,
  fileId: string
): Promise<ResourceDownloadLinkResponse['data']> {
  const response = await fetch(`/api/v1/resources/${resourceId}/files/${fileId}/download`)
  const json = await parseJsonResponse<ResourceDownloadLinkResponse>(response)
  return json.data
}

export async function fetchAdminResources(
  filters: Partial<ListResourcesFilter>
): Promise<AdminResourceListResponse> {
  const query = buildQuery(filters as Record<string, string | number | boolean | undefined>)
  const response = await fetch(`/api/v1/admin/resources?${query}`)
  return parseJsonResponse<AdminResourceListResponse>(response)
}

export async function createAdminResource(
  input: CreateResourceInput
): Promise<AdminResourceDetail> {
  const response = await fetch('/api/v1/admin/resources', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })

  return parseJsonResponse<AdminResourceDetail>(response)
}

export async function fetchAdminResourceDetail(resourceId: string): Promise<AdminResourceDetail> {
  const response = await fetch(`/api/v1/admin/resources/${resourceId}`)
  return parseJsonResponse<AdminResourceDetail>(response)
}

export async function updateAdminResource(
  resourceId: string,
  input: UpdateResourceInput
): Promise<AdminResourceDetail> {
  const response = await fetch(`/api/v1/admin/resources/${resourceId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })

  return parseJsonResponse<AdminResourceDetail>(response)
}

export async function deleteAdminResource(resourceId: string): Promise<void> {
  const response = await fetch(`/api/v1/admin/resources/${resourceId}`, {
    method: 'DELETE',
  })

  await parseJsonResponse<null>(response)
}

export async function fetchResourceAccessList(
  resourceId: string
): Promise<ResourceAccessListResponse> {
  const response = await fetch(`/api/v1/admin/resources/${resourceId}/access`)
  return parseJsonResponse<ResourceAccessListResponse>(response)
}

export async function grantResourceAccess(
  resourceId: string,
  input: ResourceAccessGrantInput
): Promise<ResourceAccessListResponse['accessList'][number]> {
  const response = await fetch(`/api/v1/admin/resources/${resourceId}/access`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: input.userId,
      expiresAt: input.expiresAt ? input.expiresAt.toISOString() : null,
    }),
  })

  return parseJsonResponse<ResourceAccessListResponse['accessList'][number]>(response)
}

export async function revokeResourceAccess(
  resourceId: string,
  accessId: string
): Promise<void> {
  const response = await fetch(`/api/v1/admin/resources/${resourceId}/access/${accessId}`, {
    method: 'DELETE',
  })

  await parseJsonResponse<null>(response)
}



export async function uploadResourceFileWithProgress(input: {
  resourceId: string
  file: File
  onProgress?: (progress: number) => void
}): Promise<AdminResourceDetail['files'][number]> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    const formData = new FormData()
    formData.append('file', input.file)

    xhr.upload.addEventListener('progress', event => {
      if (event.lengthComputable) {
        const progress = Math.min(Math.round((event.loaded / event.total) * 100), 98)
        input.onProgress?.(progress)
      }
    })

    xhr.addEventListener('load', () => {
      try {
        const json = xhr.responseText ? JSON.parse(xhr.responseText) : null

        if (xhr.status < 200 || xhr.status >= 300) {
          const message =
            json && typeof json.error === 'string' ? json.error : 'Falha ao enviar arquivo'
          reject(new Error(message))
          return
        }

        resolve(json as AdminResourceDetail['files'][number])
      } catch {
        reject(new Error('Resposta inválida do servidor'))
      }
    })

    xhr.addEventListener('error', () => {
      reject(new Error('Falha ao enviar arquivo'))
    })

    xhr.open('POST', `/api/v1/admin/resources/${input.resourceId}/files`)
    xhr.send(formData)
  })
}

export async function deleteResourceFile(resourceId: string, fileId: string): Promise<void> {
  const response = await fetch(`/api/v1/admin/resources/${resourceId}/files/${fileId}`, {
    method: 'DELETE',
  })

  await parseJsonResponse<null>(response)
}

export async function uploadResourceImage(
  resourceId: string,
  file: File,
  alt?: string
): Promise<AdminResourceDetail['images'][number]> {
  const formData = new FormData()
  formData.append('file', file)

  if (alt) {
    formData.append('alt', alt)
  }

  const response = await fetch(`/api/v1/admin/resources/${resourceId}/images`, {
    method: 'POST',
    body: formData,
  })

  return parseJsonResponse<AdminResourceDetail['images'][number]>(response)
}

export async function updateResourceImage(
  resourceId: string,
  imageId: string,
  input: UpdateResourceImageInput
): Promise<AdminResourceDetail['images'][number]> {
  const response = await fetch(`/api/v1/admin/resources/${resourceId}/images/${imageId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })

  return parseJsonResponse<AdminResourceDetail['images'][number]>(response)
}

export async function deleteResourceImage(resourceId: string, imageId: string): Promise<void> {
  const response = await fetch(`/api/v1/admin/resources/${resourceId}/images/${imageId}`, {
    method: 'DELETE',
  })

  await parseJsonResponse(response)
}

export async function reorderResourceImages(
  resourceId: string,
  updates: Array<{ id: string; order: number }>
): Promise<void> {
  const response = await fetch(`/api/v1/admin/resources/${resourceId}/images/reorder`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ updates }),
  })

  await parseJsonResponse(response)
}

export async function uploadResourceVideo(
  resourceId: string,
  file: File,
  title: string
): Promise<AdminResourceDetail['videos'][number]> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('title', title)

  const response = await fetch(`/api/v1/admin/resources/${resourceId}/videos`, {
    method: 'POST',
    body: formData,
  })

  return parseJsonResponse<AdminResourceDetail['videos'][number]>(response)
}

export async function updateResourceVideo(
  resourceId: string,
  videoId: string,
  input: UpdateResourceVideoInput
): Promise<AdminResourceDetail['videos'][number]> {
  const response = await fetch(`/api/v1/admin/resources/${resourceId}/videos/${videoId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })

  return parseJsonResponse<AdminResourceDetail['videos'][number]>(response)
}

export async function deleteResourceVideo(resourceId: string, videoId: string): Promise<void> {
  const response = await fetch(`/api/v1/admin/resources/${resourceId}/videos/${videoId}`, {
    method: 'DELETE',
  })

  await parseJsonResponse(response)
}
export async function fetchResourceObjectives(
  resourceId: string
): Promise<PedagogicalContent['objectives']> {
  const response = await fetch(`/api/v1/admin/resources/${resourceId}/objectives`)
  const json = await parseJsonResponse<{ objectives: PedagogicalContent['objectives'] }>(response)
  return json.objectives
}

export async function updateResourceObjectives(
  resourceId: string,
  objectives: PedagogicalContent['objectives']
): Promise<PedagogicalContent['objectives']> {
  const parsed = PedagogicalObjectivesSchema.parse(objectives)
  const response = await fetch(`/api/v1/admin/resources/${resourceId}/objectives`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(parsed),
  })

  const json = await parseJsonResponse<{ objectives: PedagogicalContent['objectives'] }>(response)
  return json.objectives
}

export async function fetchResourceSteps(
  resourceId: string
): Promise<PedagogicalContent['steps']> {
  const response = await fetch(`/api/v1/admin/resources/${resourceId}/steps`)
  const json = await parseJsonResponse<{ steps: PedagogicalContent['steps'] }>(response)
  return json.steps
}

export async function updateResourceSteps(
  resourceId: string,
  steps: PedagogicalContent['steps']
): Promise<PedagogicalContent['steps']> {
  const parsed = PedagogicalStepsSchema.parse(steps)
  const response = await fetch(`/api/v1/admin/resources/${resourceId}/steps`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(parsed),
  })

  const json = await parseJsonResponse<{ steps: PedagogicalContent['steps'] }>(response)
  return json.steps
}

export async function toggleResourceFavorite(resourceId: string): Promise<{ isSaved: boolean }> {
  const response = await fetch(`/api/v1/resources/${resourceId}/interact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'save' }),
  })

  const json = await parseJsonResponse<{ data: { isSaved: boolean } }>(response)
  return json.data
}
