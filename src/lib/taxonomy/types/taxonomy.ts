import type { SubjectInput } from '@/lib/taxonomy/schemas'

export type { SubjectInput }

export interface EducationLevel {
  id: string
  slug: string
  name: string
  order: number
}

export interface Grade {
  id: string
  slug: string
  name: string
  order: number
  educationLevelSlug: string
}

export interface Subject {
  id: string
  name: string
  slug: string
  color?: string | null
  textColor?: string | null
  educationLevels?: Array<{
    slug: string
    name: string
    order?: number
  }>

  _count?: {
    resources: number
  }
}
