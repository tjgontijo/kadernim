import type { EducationLevel, Grade, Subject, SubjectInput } from '@/lib/taxonomy/types'

async function parseResponse<T>(response: Response): Promise<T> {
  const json = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(typeof json.error === 'string' ? json.error : 'Erro na requisição')
  }

  return (json.data ?? json) as T
}

export async function fetchEducationLevels() {
  const response = await fetch('/api/v1/education-levels')
  return parseResponse<EducationLevel[]>(response)
}

export async function fetchGrades(educationLevelSlug: string) {
  const response = await fetch(`/api/v1/grades?educationLevelSlug=${educationLevelSlug}`)
  return parseResponse<Grade[]>(response)
}

export async function fetchSubjects(params: URLSearchParams) {
  const response = await fetch(`/api/v1/subjects?${params.toString()}`)
  return parseResponse<Subject[]>(response)
}

export async function createAdminSubject(input: SubjectInput) {
  const response = await fetch('/api/v1/admin/subjects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  return parseResponse<Subject>(response)
}

export async function updateAdminSubject(id: string, input: SubjectInput) {
  const response = await fetch(`/api/v1/admin/subjects/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  return parseResponse<Subject>(response)
}

export async function deleteAdminSubject(id: string) {
  const response = await fetch(`/api/v1/admin/subjects/${id}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    const json = await response.json().catch(() => ({}))
    throw new Error(typeof json.error === 'string' ? json.error : 'Erro na requisição')
  }
}
