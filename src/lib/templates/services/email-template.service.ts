import { prisma } from '@/lib/db'
import type { EmailTemplateCreate, EmailTemplateList, EmailTemplateUpdate } from '@/lib/templates/schemas'

export class EmailTemplateService {
  static async list(filters: EmailTemplateList) {
    const where: {
      eventType?: string
      isActive?: boolean
      OR?: Array<Record<string, unknown>>
    } = {}

    if (filters.eventType) {
      where.eventType = filters.eventType
    }
    if (typeof filters.isActive === 'boolean') {
      where.isActive = filters.isActive
    }
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { subject: { contains: filters.search, mode: 'insensitive' } },
        { slug: { contains: filters.search, mode: 'insensitive' } },
      ]
    }

    return prisma.emailTemplate.findMany({
      where,
      orderBy: [{ isActive: 'desc' }, { name: 'asc' }],
    })
  }

  static async create(data: EmailTemplateCreate) {
    return prisma.emailTemplate.create({ data })
  }

  static async getById(id: string) {
    return prisma.emailTemplate.findUnique({ where: { id } })
  }

  static async getBySlug(slug: string) {
    return prisma.emailTemplate.findUnique({ where: { slug } })
  }

  static async update(id: string, data: EmailTemplateUpdate) {
    return prisma.emailTemplate.update({
      where: { id },
      data,
    })
  }

  static async delete(id: string) {
    return prisma.emailTemplate.delete({
      where: { id },
    })
  }
}
