import { prisma, Prisma } from '@/lib/db'
import type {
  NotificationTemplateCreateInput,
  NotificationTemplateUpdateInput,
} from '@/schemas/templates/notification-template-schemas'

export class NotificationTemplateService {
  static async listAllUnified() {
    const [notificationTemplates, emailTemplates, whatsappTemplates, pushTemplates] =
      await Promise.all([
        prisma.notificationTemplate.findMany({
          orderBy: [{ type: 'asc' }, { name: 'asc' }],
        }),
        prisma.emailTemplate.findMany({
          orderBy: { name: 'asc' },
        }),
        prisma.whatsAppTemplate.findMany({
          orderBy: { name: 'asc' },
        }),
        prisma.pushTemplate.findMany({
          orderBy: { name: 'asc' },
        }),
      ])

    return [
      ...notificationTemplates.map((template) => ({
        ...template,
        source: 'notification' as const,
      })),
      ...emailTemplates.map((template) => ({
        ...template,
        type: 'email' as const,
        source: 'email' as const,
      })),
      ...whatsappTemplates.map((template) => ({
        ...template,
        type: 'whatsapp' as const,
        source: 'whatsapp' as const,
      })),
      ...pushTemplates.map((template) => ({
        ...template,
        type: 'push' as const,
        source: 'push' as const,
      })),
    ]
  }

  static async getById(id: string) {
    return prisma.notificationTemplate.findUnique({
      where: { id },
    })
  }

  static async getBySlug(slug: string) {
    return prisma.notificationTemplate.findUnique({
      where: { slug },
      select: { id: true },
    })
  }

  static async create(data: NotificationTemplateCreateInput) {
    const variables =
      data.variables === undefined
        ? undefined
        : data.variables === null
          ? Prisma.JsonNull
          : data.variables

    return prisma.notificationTemplate.create({
      data: {
        slug: data.slug,
        name: data.name,
        type: data.type,
        eventType: data.eventType,
        subject: data.subject,
        body: data.body,
        description: data.description,
        variables,
      },
    })
  }

  static async update(id: string, data: NotificationTemplateUpdateInput) {
    const variables =
      data.variables === undefined
        ? undefined
        : data.variables === null
          ? Prisma.JsonNull
          : data.variables

    return prisma.notificationTemplate.update({
      where: { id },
      data: {
        ...data,
        variables,
      },
    })
  }

  static async delete(id: string) {
    return prisma.notificationTemplate.delete({
      where: { id },
    })
  }
}
