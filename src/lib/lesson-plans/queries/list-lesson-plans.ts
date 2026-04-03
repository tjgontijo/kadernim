import { prisma } from '@/lib/db'

export async function listLessonPlansByUser(userId: string) {
  return prisma.lessonPlan.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  })
}

