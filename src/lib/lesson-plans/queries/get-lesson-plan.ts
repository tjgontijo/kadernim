import { prisma } from '@/lib/db'

export async function getLessonPlanById(id: string, userId?: string) {
  const where: { id: string; userId?: string } = { id }

  if (userId) {
    where.userId = userId
  }

  return prisma.lessonPlan.findUnique({
    where,
  })
}

export async function getLessonPlanByIdWithBnccDescriptions(
  id: string,
  params: { userId: string; isAdmin: boolean }
) {
  const plan = await prisma.lessonPlan.findUnique({
    where: { id },
  })

  if (!plan) {
    throw new Error('LESSON_PLAN_NOT_FOUND')
  }

  if (plan.userId !== params.userId && !params.isAdmin) {
    throw new Error('LESSON_PLAN_FORBIDDEN')
  }

  const bnccSkillDescriptions = await prisma.bnccSkill.findMany({
    where: {
      code: {
        in: plan.bnccSkillCodes || [],
      },
    },
    select: {
      code: true,
      description: true,
    },
  })

  return {
    ...plan,
    bnccSkillDescriptions,
  }
}

