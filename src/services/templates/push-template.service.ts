import { prisma, Prisma } from '@/lib/db'
import type {
  PushTemplateCreate,
  PushTemplateList,
  PushTemplateUpdate,
} from '@/schemas/templates/push-template-schemas'

export class PushTemplateService {
  static async list(filters: PushTemplateList) {
    const where: Prisma.PushTemplateWhereInput = {}

    if (filters.eventType) {
      where.eventType = filters.eventType
    }

    if (typeof filters.isActive === 'boolean') {
      where.isActive = filters.isActive
    }

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: Prisma.QueryMode.insensitive } },
        { slug: { contains: filters.search, mode: Prisma.QueryMode.insensitive } },
        { description: { contains: filters.search, mode: Prisma.QueryMode.insensitive } },
      ]
    }

    return prisma.pushTemplate.findMany({
      where,
      orderBy: [{ isActive: 'desc' }, { title: 'asc' }],
    })
  }

  static async getById(id: string) {
    return prisma.pushTemplate.findUnique({
      where: { id },
    })
  }

  static async getBySlug(slug: string) {
    return prisma.pushTemplate.findUnique({
      where: { slug },
      select: { id: true },
    })
  }

  static async create(data: PushTemplateCreate) {
    const slug = this.resolveSlug(data.name, data.slug)

    return prisma.pushTemplate.create({
      data: {
        ...data,
        slug,
      },
    })
  }

  static async update(id: string, data: PushTemplateUpdate) {
    return prisma.pushTemplate.update({
      where: { id },
      data,
    })
  }

  static async delete(id: string) {
    return prisma.pushTemplate.delete({
      where: { id },
    })
  }

  static resolveSlug(name: string, slug?: string) {
    if (slug?.trim()) {
      return slug.trim()
    }

    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
  }
}
