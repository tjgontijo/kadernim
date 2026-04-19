import { prisma } from '@/server/db'

export async function toggleSaveResource(userId: string, resourceId: string) {
  const current = await prisma.userResourceInteraction.findUnique({
    where: {
      userId_resourceId: { userId, resourceId },
    },
    select: { isSaved: true },
  })

  return prisma.userResourceInteraction.upsert({
    where: {
      userId_resourceId: { userId, resourceId },
    },
    create: {
      userId,
      resourceId,
      isSaved: true,
      savedAt: new Date(),
    },
    update: {
      isSaved: !current?.isSaved,
      savedAt: !current?.isSaved ? new Date() : null,
    },
  })
}

export async function planResource(userId: string, resourceId: string, plannedFor: Date | null) {
  return prisma.userResourceInteraction.upsert({
    where: {
      userId_resourceId: { userId, resourceId },
    },
    create: {
      userId,
      resourceId,
      isPlanned: !!plannedFor,
      plannedFor,
    },
    update: {
      isPlanned: !!plannedFor,
      plannedFor,
    },
  })
}

export async function logResourceDownload(userId: string, resourceId: string) {
  // Update interaction record
  await prisma.userResourceInteraction.upsert({
    where: {
      userId_resourceId: { userId, resourceId },
    },
    create: {
      userId,
      resourceId,
      hasDownloaded: true,
      downloadedAt: new Date(),
      downloadCount: 1,
    },
    update: {
      hasDownloaded: true,
      downloadedAt: new Date(),
      downloadCount: { increment: 1 },
    },
  })

  // Update resource global count cache
  await prisma.resource.update({
    where: { id: resourceId },
    data: {
      downloadCount: { increment: 1 },
    },
  })
}

export async function getUserInteraction(userId: string, resourceId: string) {
  return prisma.userResourceInteraction.findUnique({
    where: {
      userId_resourceId: { userId, resourceId },
    },
  })
}
