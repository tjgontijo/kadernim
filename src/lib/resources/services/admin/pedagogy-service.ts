import { prisma } from '@/lib/db'
import {
  PedagogicalContent,
  PedagogicalContentSchema,
  PedagogicalContentUpdate,
} from '../../schemas/pedagogical-schemas'

function toPedagogicalContent(
  objectives: Array<{ id: string; text: string; order: number }>,
  steps: Array<{
    id: string
    type: string
    title: string
    duration: string | null
    content: string
    order: number
  }>,
  materials: unknown
): PedagogicalContent | null {
  if (objectives.length === 0 && steps.length === 0 && !Array.isArray(materials)) {
    return null
  }

  const candidate = {
    objectives,
    steps,
    materials: Array.isArray(materials) ? materials : undefined,
  }

  const parsed = PedagogicalContentSchema.safeParse(candidate)
  if (parsed.success) {
    return parsed.data
  }

  // If data is partially filled (legacy/in-progress), return normalized safe shape.
  return {
    objectives,
    steps,
    materials: Array.isArray(materials) ? (materials as any) : [],
  } as PedagogicalContent
}

/**
 * Get the pedagogical content for a specific resource
 */
export async function getPedagogicalContent(resourceId: string) {
  const resource = await prisma.resource.findUnique({
    where: { id: resourceId },
    select: {
      pedagogicalContent: true,
      objectives: {
        select: { id: true, text: true, order: true },
        orderBy: { order: 'asc' },
      },
      steps: {
        select: { id: true, type: true, title: true, duration: true, content: true, order: true },
        orderBy: { order: 'asc' },
      },
    },
  })

  if (!resource) {
    throw new Error('RESOURCE_NOT_FOUND')
  }

  const legacy =
    resource.pedagogicalContent && typeof resource.pedagogicalContent === 'object'
      ? (resource.pedagogicalContent as Record<string, unknown>)
      : null

  // Primary source: normalized relational models
  if (resource.objectives.length > 0 || resource.steps.length > 0) {
    return toPedagogicalContent(resource.objectives, resource.steps, legacy?.materials)
  }

  // Fallback for legacy JSON data before migration/backfill
  if (!resource.pedagogicalContent) {
    return null
  }

  const validated = PedagogicalContentSchema.safeParse(resource.pedagogicalContent)
  if (!validated.success) {
    console.error('[getPedagogicalContent] Invalid content in DB:', validated.error)
    return null
  }

  return validated.data
}

/**
 * Update the pedagogical content for a resource
 */
export async function updatePedagogicalContent(
  resourceId: string,
  content: PedagogicalContentUpdate
) {
  await prisma.$transaction(async (tx) => {
    const existing = await tx.resource.findUnique({
      where: { id: resourceId },
      select: { id: true, pedagogicalContent: true },
    })

    if (!existing) {
      throw new Error('RESOURCE_NOT_FOUND')
    }

    if (content.objectives !== undefined) {
      await tx.resourceObjective.deleteMany({ where: { resourceId } })
      if (content.objectives.length > 0) {
        await tx.resourceObjective.createMany({
          data: content.objectives.map((objective, index) => ({
            resourceId,
            text: objective.text,
            order: index + 1,
          })),
        })
      }
    }

    if (content.steps !== undefined) {
      await tx.resourceStep.deleteMany({ where: { resourceId } })
      if (content.steps.length > 0) {
        await tx.resourceStep.createMany({
          data: content.steps.map((step, index) => ({
            resourceId,
            type: step.type,
            title: step.title,
            duration: step.duration ?? null,
            content: step.content,
            order: index + 1,
          })),
        })
      }
    }

    if (content.materials !== undefined) {
      const legacy =
        existing.pedagogicalContent && typeof existing.pedagogicalContent === 'object'
          ? (existing.pedagogicalContent as Record<string, unknown>)
          : {}

      await tx.resource.update({
        where: { id: resourceId },
        data: {
          pedagogicalContent: {
            ...legacy,
            materials: content.materials,
          } as any,
        },
      })
    }
  })

  return getPedagogicalContent(resourceId)
}
