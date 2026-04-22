import { prisma } from '@/server/db'
import type { BnccSkillFilter, BnccSkillDetail, BnccSkillListItem } from '@/lib/bncc/schemas/bncc-schemas'

interface ListBnccSkillsResult {
  items: BnccSkillListItem[]
  pagination: {
    page: number
    limit: number
    hasMore: boolean
  }
}

function mapSkill(item: {
  id: string
  code: string
  description: string
  unitTheme: string | null
  knowledgeObject: string | null
  comments: string | null
  curriculumSuggestions: string | null
  educationLevel: { slug: string; name: string }
  grade: { slug: string; name: string } | null
  subject: { slug: string; name: string } | null
  _count: { resources: number }
  resources?: Array<{
    resource: {
      id: string
      title: string
      thumbUrl: string | null
      images: Array<{ url: string | null }>
    }
  }>
}): BnccSkillDetail {
  return {
    id: item.id,
    code: item.code,
    description: item.description,
    educationLevel: item.educationLevel,
    grade: item.grade,
    subject: item.subject,
    unitTheme: item.unitTheme,
    knowledgeObject: item.knowledgeObject,
    comments: item.comments,
    curriculumSuggestions: item.curriculumSuggestions,
    relatedResourcesCount: item._count.resources,
    relatedResources: (item.resources || []).map((entry) => ({
      id: entry.resource.id,
      title: entry.resource.title,
      thumbUrl: entry.resource.thumbUrl ?? entry.resource.images[0]?.url ?? null,
    })),
  }
}

export async function listBnccSkills(filters: BnccSkillFilter): Promise<ListBnccSkillsResult> {
  const { q, educationLevel, grades, subject, page, limit } = filters

  const where: any = {}

  if (educationLevel) {
    where.educationLevel = { is: { slug: educationLevel } }
  }

  if (grades && grades.length > 0) {
    where.grade = { is: { slug: { in: grades } } }
  }

  if (subject) {
    where.subject = { is: { slug: subject } }
  }

  if (q) {
    where.OR = [
      { code: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
      { unitTheme: { contains: q, mode: 'insensitive' } },
      { knowledgeObject: { contains: q, mode: 'insensitive' } },
      { comments: { contains: q, mode: 'insensitive' } },
      { curriculumSuggestions: { contains: q, mode: 'insensitive' } },
    ]
  }

  const take = limit + 1
  const skip = (page - 1) * limit

  const rows = await prisma.bnccSkill.findMany({
    where,
    take,
    skip,
    orderBy: [
      { code: 'asc' },
      { id: 'asc' },
    ],
    select: {
      id: true,
      code: true,
      description: true,
      unitTheme: true,
      knowledgeObject: true,
      comments: true,
      curriculumSuggestions: true,
      educationLevel: {
        select: {
          slug: true,
          name: true,
        },
      },
      grade: {
        select: {
          slug: true,
          name: true,
        },
      },
      subject: {
        select: {
          slug: true,
          name: true,
        },
      },
      _count: {
        select: {
          resources: true,
        },
      },
    },
  })

  const hasMore = rows.length > limit
  const slice = hasMore ? rows.slice(0, limit) : rows

  const items: BnccSkillListItem[] = slice.map((item) => {
    const mapped = mapSkill(item)
    return {
      id: mapped.id,
      code: mapped.code,
      description: mapped.description,
      educationLevel: mapped.educationLevel,
      grade: mapped.grade,
      subject: mapped.subject,
      unitTheme: mapped.unitTheme,
      knowledgeObject: mapped.knowledgeObject,
      relatedResourcesCount: mapped.relatedResourcesCount,
    }
  })

  return {
    items,
    pagination: {
      page,
      limit,
      hasMore,
    },
  }
}

export async function getBnccSkillById(id: string): Promise<BnccSkillDetail | null> {
  const skill = await prisma.bnccSkill.findUnique({
    where: { id },
    select: {
      id: true,
      code: true,
      description: true,
      unitTheme: true,
      knowledgeObject: true,
      comments: true,
      curriculumSuggestions: true,
      educationLevel: {
        select: {
          slug: true,
          name: true,
        },
      },
      grade: {
        select: {
          slug: true,
          name: true,
        },
      },
      subject: {
        select: {
          slug: true,
          name: true,
        },
      },
      _count: {
        select: {
          resources: true,
        },
      },
      resources: {
        where: {
          resource: {
            archivedAt: null,
          },
        },
        take: 6,
        orderBy: {
          resourceId: 'desc',
        },
        select: {
          resource: {
            select: {
              id: true,
              title: true,
              thumbUrl: true,
              images: {
                take: 1,
                orderBy: { order: 'asc' },
                select: { url: true },
              },
            },
          },
        },
      },
    },
  })

  if (!skill) {
    return null
  }

  return mapSkill(skill)
}
