import type { ResourceFilter } from '@/lib/schemas/resource'
import { EducationLevelLabels } from '@/constants/educationLevel'
import { SubjectLabels } from '@/constants/subject'

export interface ResourceMetaUser {
  role: string | null
  isAdmin: boolean
  isSubscriber: boolean
}

export interface ResourceMetaParams {
  filters: Pick<ResourceFilter, 'educationLevel' | 'subject'>
  user: ResourceMetaUser
}

export interface ResourceMetaEducationLevelItem {
  key: string
  label: string
}

export interface ResourceMetaSubjectItem {
  key: string
  label: string
}

export interface ResourceMetaResult {
  educationLevels: ResourceMetaEducationLevelItem[]
  subjects: ResourceMetaSubjectItem[]
  user: ResourceMetaUser
}

/**
 * Service responsável por fornecer metadados usados na tela /resources,
 * conforme contrato do PRD.
 */
export function getResourceMeta({ user }: ResourceMetaParams): ResourceMetaResult {
  const educationLevels = Object.entries(EducationLevelLabels).map(([key, label]) => ({
    key,
    label,
  }))

  const subjects = Object.entries(SubjectLabels).map(([key, label]) => ({
    key,
    label,
  }))

  return {
    educationLevels,
    subjects,
    user,
  }
}
