import { prisma, Prisma } from '@/lib/db'
import type {
  WhatsAppTemplateCreate,
  WhatsAppTemplateList,
  WhatsAppTemplateUpdate,
} from '@/schemas/templates/whatsapp-template-schemas'

export class WhatsAppTemplateService {
  static async list(filters: WhatsAppTemplateList) {
    const where: Prisma.WhatsAppTemplateWhereInput = {}

    if (filters.eventType) {
      where.eventType = filters.eventType
    }

    if (typeof filters.isActive === 'boolean') {
      where.isActive = filters.isActive
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: Prisma.QueryMode.insensitive } },
        { body: { contains: filters.search, mode: Prisma.QueryMode.insensitive } },
        { slug: { contains: filters.search, mode: Prisma.QueryMode.insensitive } },
      ]
    }

    return prisma.whatsAppTemplate.findMany({
      where,
      orderBy: [{ isActive: 'desc' }, { name: 'asc' }],
    })
  }

  static async getById(id: string) {
    return prisma.whatsAppTemplate.findUnique({
      where: { id },
    })
  }

  static async getBySlug(slug: string) {
    return prisma.whatsAppTemplate.findUnique({
      where: { slug },
      select: { id: true },
    })
  }

  static async create(data: WhatsAppTemplateCreate) {
    return prisma.whatsAppTemplate.create({
      data,
    })
  }

  static async update(id: string, data: WhatsAppTemplateUpdate) {
    return prisma.whatsAppTemplate.update({
      where: { id },
      data,
    })
  }

  static async delete(id: string) {
    return prisma.whatsAppTemplate.delete({
      where: { id },
    })
  }
}
