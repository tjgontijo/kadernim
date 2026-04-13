import { prisma } from '@/lib/db'

export class TaxonomyService {
  static async listEducationLevels() {
    return prisma.educationLevel.findMany({
      orderBy: { order: 'asc' },
      select: {
        id: true,
        slug: true,
        name: true,
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
      orderBy: { order: 'asc' },
      select: {
        id: true,
        slug: true,
        name: true,
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
      order: grade.order,
      educationLevelSlug: grade.educationLevel.slug,
    }))
  }

  static async listSubjects(params: {
    educationLevelSlug?: string
    gradeSlug?: string
  }) {
    const subjectsWhere: any = {}


    if (params.gradeSlug) {
      const gradeSubjects = await prisma.gradeSubject.findMany({
        where: {
          grade: { slug: params.gradeSlug },
          subject: subjectsWhere,
        },
        include: {
          subject: {
            select: { slug: true, name: true },
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
            select: { slug: true, name: true },
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
      select: { slug: true, name: true },
      orderBy: { name: 'asc' },
    })
  }

  static async listSubjectsAdmin(params: { page?: number; limit?: number; search?: string }) {
    const page = params.page || 1
    const limit = params.limit || 15
    const search = params.search

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { slug: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {}

    const [subjects, total] = await Promise.all([
      prisma.subject.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { name: 'asc' },
        include: {
          _count: {
            select: { resources: true },
          },
        },
      }),
      prisma.subject.count({ where }),
    ])

    return {
      subjects,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
    }
  }

  static async createSubject(data: any) {
    return prisma.subject.create({
      data,
    })
  }

  static async updateSubject(id: string, data: any) {
    return prisma.subject.update({
      where: { id },
      data,
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
