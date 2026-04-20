import { prisma } from '@/lib/db'
import { PedagogicalStepsSchema, ResourceStepTypeEnum } from '../../schemas/pedagogical-schemas'

function normalizeStepType(stepType: string) {
  return ResourceStepTypeEnum.parse(stepType)
}

export async function getResourceSteps(resourceId: string) {
  const resource = await prisma.resource.findUnique({
    where: { id: resourceId },
    select: {
      steps: {
        select: { id: true, type: true, title: true, duration: true, content: true, order: true },
        orderBy: { order: 'asc' },
      },
    },
  })

  if (!resource) {
    throw new Error('RESOURCE_NOT_FOUND')
  }

  return resource.steps.map((step) => ({
    ...step,
    type: normalizeStepType(step.type),
    duration: step.duration ?? undefined,
  }))
}

export async function updateResourceSteps(resourceId: string, input: unknown) {
  const steps = PedagogicalStepsSchema.parse(input)

  await prisma.$transaction(async (tx) => {
    const existing = await tx.resource.findUnique({
      where: { id: resourceId },
      select: { id: true },
    })

    if (!existing) {
      throw new Error('RESOURCE_NOT_FOUND')
    }

    await tx.resourceStep.deleteMany({ where: { resourceId } })

    await tx.resourceStep.createMany({
      data: steps.map((step, index) => ({
        resourceId,
        type: step.type,
        title: step.title,
        duration: step.duration ?? null,
        content: step.content,
        order: index + 1,
      })),
    })
  })

  return getResourceSteps(resourceId)
}
