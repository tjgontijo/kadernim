import { prisma } from '@/lib/db'

export async function getUserResourceAccessService(userId: string) {
  const allResources = await prisma.resource.findMany({
    select: {
      id: true,
      title: true,
      isFree: true,
      educationLevel: { select: { name: true } },
      subject: { select: { name: true } },
    },
    orderBy: { title: 'asc' },
  })

  const userAccess = await prisma.resourceUserAccess.findMany({
    where: { userId },
    select: { resourceId: true },
  })

  const accessSet = new Set(userAccess.map((access) => access.resourceId))

  const resources = allResources.map((resource) => ({
    id: resource.id,
    title: resource.title,
    isFree: resource.isFree,
    educationLevel: resource.educationLevel.name,
    subject: resource.subject.name,
    hasAccess: accessSet.has(resource.id),
  }))

  return resources.sort((a, b) => {
    if (a.hasAccess === b.hasAccess) {
      return a.title.localeCompare(b.title)
    }

    return a.hasAccess ? -1 : 1
  })
}

export async function toggleUserResourceAccessService(userId: string, resourceId: string, hasAccess: boolean) {
  if (hasAccess) {
    return prisma.resourceUserAccess.upsert({
      where: {
        userId_resourceId: { userId, resourceId },
      },
      create: {
        userId,
        resourceId,
        source: 'admin_manual',
      },
      update: {},
    })
  }

  return prisma.resourceUserAccess.deleteMany({
    where: { userId, resourceId },
  })
}
