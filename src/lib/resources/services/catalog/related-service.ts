import { prisma } from '@/server/db'

export async function getRelatedResources(resourceId: string, limit: number = 4) {
  // 1. Get explicit relations
  const explicit = await prisma.relatedResource.findMany({
    where: { resourceId },
    include: {
      relatedResource: {
        select: {
          id: true,
          title: true,
          thumbUrl: true,
          isFree: true,
          subject: { select: { slug: true, name: true } },
          educationLevel: { select: { slug: true, name: true } },
          images: {
            select: { url: true, order: true },
            orderBy: { order: 'asc' },
            take: 1,
          },
        },
      },
    },
    take: limit,
  })

  if (explicit.length >= limit) {
    return explicit.map((e) => e.relatedResource)
  }

  // 2. If not enough explicit, get implicit (same subject)
  const currentResource = await prisma.resource.findUnique({
    where: { id: resourceId },
    select: { subjectId: true, educationLevelId: true },
  })

  if (!currentResource) return []

  const implicit = await prisma.resource.findMany({
    where: {
      id: { not: resourceId },
      subjectId: currentResource.subjectId,
      educationLevelId: currentResource.educationLevelId,
    },
    select: {
      id: true,
      title: true,
      thumbUrl: true,
      isFree: true,
      subject: { select: { slug: true, name: true } },
      educationLevel: { select: { slug: true, name: true } },
      images: {
        select: { url: true, order: true },
        orderBy: { order: 'asc' },
        take: 1,
      },
    },
    take: limit - explicit.length,
  })

  return [
    ...explicit.map((e) => e.relatedResource),
    ...implicit,
  ]
}
