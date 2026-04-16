import { prisma } from '@/server/db'
import type { MarketingProduct } from './types'

export async function getFeaturedResources(): Promise<MarketingProduct[]> {
  const resources = await prisma.resource.findMany({
    take: 12,
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      images: {
        orderBy: {
          order: 'asc',
        },
        take: 1,
      },
      educationLevel: true,
      subject: true,
    },
  })

  return resources.map((r) => ({
    id: r.id,
    title: r.title,
    thumbUrl: r.images[0]?.url || null,
    educationLevel: r.educationLevel.name,
    subject: r.subject.name,
  }))
}
