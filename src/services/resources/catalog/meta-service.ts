import { prisma } from '@/lib/db'
import type { ResourceFilter } from '@/lib/schemas/resource'

export interface ResourceMetaUser {
  role: string | null
  isAdmin: boolean
  isSubscriber: boolean
}

export interface ResourceMetaParams {
  filters: Pick<ResourceFilter, 'educationLevel' | 'grade' | 'subject'>
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

export interface ResourceMetaGradeItem {
  key: string
  label: string
  educationLevelKey: string
  subjects: string[] // slugs das disciplinas vinculadas a este ano
}

export interface ResourceMetaResult {
  educationLevels: ResourceMetaEducationLevelItem[]
  subjects: ResourceMetaSubjectItem[]
  grades: ResourceMetaGradeItem[]
  user: ResourceMetaUser
}

/**
 * Service responsável por fornecer metadados usados na tela /resources,
 * conforme contrato do PRD. Buscando agora diretamente do banco de dados.
 */
export async function getResourceMeta({ user }: ResourceMetaParams): Promise<ResourceMetaResult> {
  const [levels, subs, gradeList] = await Promise.all([
    prisma.educationLevel.findMany({
      select: { slug: true, name: true },
      orderBy: { order: 'asc' }
    }),
    prisma.subject.findMany({
      select: { slug: true, name: true },
      orderBy: { name: 'asc' }
    }),
    prisma.grade.findMany({
      select: {
        slug: true,
        name: true,
        educationLevelId: true,
        educationLevel: { select: { slug: true } },
        subjects: {
          select: {
            subject: {
              select: { slug: true }
            }
          }
        }
      },
      orderBy: { order: 'asc' }
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

  const grades = gradeList.map((g: any) => ({
    key: g.slug,
    label: g.name,
    educationLevelKey: g.educationLevel.slug,
    subjects: g.subjects.map((gs: any) => gs.subject.slug)
  }))

  return {
    educationLevels,
    subjects,
    grades,
    user,
  }
}
