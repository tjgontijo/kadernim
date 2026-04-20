import { prisma } from '@/lib/db'
import { PedagogicalObjectivesSchema } from '../../schemas/pedagogical-schemas'

export async function getResourceObjectives(resourceId: string) {
  const resource = await prisma.resource.findUnique({
    where: { id: resourceId },
    select: {
      objectives: {
        select: { id: true, text: true, order: true },
        orderBy: { order: 'asc' },
      },
    },
  })

  if (!resource) {
    throw new Error('RESOURCE_NOT_FOUND')
  }

  return resource.objectives
}

export async function updateResourceObjectives(resourceId: string, input: unknown) {
  const objectives = PedagogicalObjectivesSchema.parse(input)

  await prisma.$transaction(async (tx) => {
    const existing = await tx.resource.findUnique({
      where: { id: resourceId },
      select: { id: true },
    })

    if (!existing) {
      throw new Error('RESOURCE_NOT_FOUND')
    }

    await tx.resourceObjective.deleteMany({ where: { resourceId } })

    await tx.resourceObjective.createMany({
      data: objectives.map((objective, index) => ({
        resourceId,
        text: objective.text,
        order: index + 1,
      })),
    })
  })

  return getResourceObjectives(resourceId)
}
