import { prisma } from '@/lib/db'
import type { ResourceFilter } from '@/lib/schemas/resource'

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
 * conforme contrato do PRD. Buscando agora diretamente do banco de dados.
 */
export async function getResourceMeta({ user }: ResourceMetaParams): Promise<ResourceMetaResult> {
  const [levels, subs] = await Promise.all([
    prisma.educationLevel.findMany({
      select: { slug: true, name: true },
      orderBy: { order: 'asc' }
    }),
    prisma.subject.findMany({
      select: { slug: true, name: true },
      orderBy: { name: 'asc' }
    })
  ])

  const educationLevels = levels.map((l) => ({
    key: l.slug,
    label: l.name,
  }))

  const subjects = subs.map((s) => ({
    key: s.slug,
    label: s.name,
  }))

  return {
    educationLevels,
    subjects,
    user,
  }
}
