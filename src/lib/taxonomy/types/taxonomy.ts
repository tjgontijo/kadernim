import type { SubjectInput } from '@/lib/taxonomy/schemas'

export type { SubjectInput }

export interface KnowledgeArea {
  id: string
  code: string
  name: string
  order: number
}

export interface EducationLevel {
  id: string
  slug: string
  name: string
  type?: 'EF' | 'EM' | null
  order: number
}

export interface Grade {
  id: string
  slug: string
  name: string
  year?: number | null
  order: number
  educationLevelSlug: string
}

export interface Subject {
  id: string
  name: string
  slug: string
  componentCode?: string | null
  type?: string | null
  knowledgeAreaId?: string | null
  knowledgeArea?: KnowledgeArea
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
