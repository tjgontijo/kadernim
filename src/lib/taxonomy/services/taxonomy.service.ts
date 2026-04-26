import { prisma } from '@/lib/db'
import { slugify } from '@/lib/utils/string'
import type { Prisma } from '@db/client'

export class TaxonomyService {
  private static async buildUniqueSubjectSlug(name: string, excludeId?: string) {
    const baseSlug = slugify(name) || 'disciplina'
    let candidate = baseSlug
    let suffix = 2

    while (true) {
      const existing = await prisma.subject.findUnique({
        where: { slug: candidate },
        select: { id: true },
      })

      if (!existing || existing.id === excludeId) {
        return candidate
      }

      candidate = `${baseSlug}-${suffix}`
      suffix += 1
    }
  }

  static async listKnowledgeAreas() {
    return prisma.knowledgeArea.findMany({
      orderBy: { order: 'asc' },
      select: {
        id: true,
        code: true,
        name: true,
        order: true,
      },
    })
  }

  static async listEducationLevels() {
    return prisma.educationLevel.findMany({
      orderBy: { order: 'asc' },
      select: {
        id: true,
        slug: true,
        name: true,
        type: true,
        order: true,
      },
    })
  }

  static async listGrades(params: { educationLevelSlug?: string }) {
    const where = params.educationLevelSlug
      ? { educationLevel: { slug: params.educationLevelSlug } }
      : {}

    const grades = await prisma.grade.findMany({
      where,
      orderBy: [{ order: 'asc' }, { year: 'asc' }],
      select: {
        id: true,
        slug: true,
        name: true,
        year: true,
        order: true,
        educationLevel: {
          select: { slug: true },
        },
      },
    })

    return grades.map((grade) => ({
      id: grade.id,
      slug: grade.slug,
      name: grade.name,
      year: grade.year,
      order: grade.order,
      educationLevelSlug: grade.educationLevel.slug,
    }))
  }

  static async listSubjects(params: {
    educationLevelSlug?: string
    gradeSlug?: string
  }) {
    const subjectsWhere: any = {}

    const subjectSelect = {
      id: true,
      slug: true,
      name: true,
      componentCode: true,
      type: true,
      color: true,
      textColor: true,
      knowledgeArea: {
        select: {
          id: true,
          code: true,
          name: true,
          order: true,
        },
      },
    }

    if (params.gradeSlug) {
      const gradeSubjects = await prisma.gradeSubject.findMany({
        where: {
          grade: { slug: params.gradeSlug },
          subject: subjectsWhere,
        },
        include: {
          subject: {
            select: subjectSelect,
          },
        },
        orderBy: {
          subject: { name: 'asc' },
        },
      })
      return gradeSubjects.map((gradeSubject) => gradeSubject.subject)
    }

    if (params.educationLevelSlug) {
      const gradeSubjects = await prisma.gradeSubject.findMany({
        where: {
          grade: {
            educationLevel: { slug: params.educationLevelSlug },
          },
          subject: subjectsWhere,
        },
        include: {
          subject: {
            select: subjectSelect,
          },
        },
        orderBy: {
          subject: { name: 'asc' },
        },
      })

      return Array.from(new Map(gradeSubjects.map((gradeSubject) => [gradeSubject.subject.slug, gradeSubject.subject])).values())
    }

    return prisma.subject.findMany({
      where: subjectsWhere,
      select: subjectSelect,
      orderBy: { name: 'asc' },
    })
  }

  static async listSubjectsAdmin(params: { page?: number; limit?: number; search?: string; educationLevelSlug?: string }) {
    const page = params.page || 1
    const limit = params.limit || 15
    const search = params.search
    const educationLevelSlug = params.educationLevelSlug

    const where: any = {}

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' as const } },
        { slug: { contains: search, mode: 'insensitive' as const } },
      ]
    }

    if (educationLevelSlug && educationLevelSlug !== 'all') {
      where.grades = {
        some: {
          grade: {
            educationLevel: {
              slug: educationLevelSlug,
            },
          },
        },
      }
    }

    const [subjects, total] = await Promise.all([
      prisma.subject.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { name: 'asc' },
        include: {
          grades: {
            select: {
              grade: {
                select: {
                  educationLevel: {
                    select: {
                      slug: true,
                      name: true,
                      order: true,
                    },
                  },
                },
              },
            },
          },
          resources: {
            select: {
              educationLevel: {
                select: {
                  slug: true,
                  name: true,
                  order: true,
                },
              },
            },
          },
          _count: {
            select: { resources: true },
          },
        },
      }),
      prisma.subject.count({ where }),
    ])

    const normalizedSubjects = subjects.map((subject) => {
      const levelsMap = new Map<string, { slug: string; name: string; order: number }>()
      for (const gs of subject.grades) {
        const level = gs.grade.educationLevel
        if (!levelsMap.has(level.slug)) {
          levelsMap.set(level.slug, {
            slug: level.slug,
            name: level.name,
            order: level.order,
          })
        }
      }

      // Fallback apenas quando nao existe vinculo de taxonomia (grade_subject).
      // Isso evita mascarar alteracoes feitas no dialog de etapas.
      if (levelsMap.size === 0) {
        for (const resource of subject.resources) {
          const level = resource.educationLevel
          if (!level || levelsMap.has(level.slug)) continue
          levelsMap.set(level.slug, {
            slug: level.slug,
            name: level.name,
            order: level.order,
          })
        }
      }

      const educationLevels = Array.from(levelsMap.values()).sort((a, b) => a.order - b.order)

      return {
        ...subject,
        educationLevels,
      }
    })

    return {
      subjects: normalizedSubjects,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
    }
  }

  static async createSubject(data: {
    name: string
    color?: string | null
    textColor?: string | null
    educationLevelSlugs?: string[]
  }) {
    const { educationLevelSlugs = [], ...subjectData } = data
    const slug = await this.buildUniqueSubjectSlug(subjectData.name)

    return prisma.$transaction(async (tx) => {
      const created = await tx.subject.create({
        data: {
          ...subjectData,
          slug,
        },
      })

      await this.syncSubjectEducationLevels(tx, created.id, educationLevelSlugs)
      return created
    })
  }

  static async updateSubject(id: string, data: {
    name: string
    color?: string | null
    textColor?: string | null
    educationLevelSlugs?: string[]
  }) {
    const { educationLevelSlugs = [], ...subjectData } = data
    const slug = await this.buildUniqueSubjectSlug(subjectData.name, id)

    return prisma.$transaction(async (tx) => {
      const updated = await tx.subject.update({
        where: { id },
        data: {
          ...subjectData,
          slug,
        },
      })

      await this.syncSubjectEducationLevels(tx, id, educationLevelSlugs)
      return updated
    })
  }

  private static async syncSubjectEducationLevels(
    tx: Prisma.TransactionClient,
    subjectId: string,
    educationLevelSlugs: string[]
  ) {
    await tx.gradeSubject.deleteMany({ where: { subjectId } })

    if (educationLevelSlugs.length === 0) return

    const grades = await tx.grade.findMany({
      where: {
        educationLevel: {
          slug: { in: educationLevelSlugs },
        },
      },
      select: { id: true },
    })

    if (grades.length === 0) return

    await tx.gradeSubject.createMany({
      data: grades.map((grade) => ({
        gradeId: grade.id,
        subjectId,
      })),
      skipDuplicates: true,
    })
  }

  static async deleteSubject(id: string) {
    const resourceCount = await prisma.resource.count({
      where: { subjectId: id },
    })

    if (resourceCount > 0) {
      throw new Error('HAS_RESOURCES')
    }

    return prisma.subject.delete({
      where: { id },
    })
  }
}
