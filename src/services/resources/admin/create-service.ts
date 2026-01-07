import { prisma } from '@/lib/db'
import type { Resource, EducationLevel, Subject } from '@db/client'
import { CreateResourceInput } from '@/lib/schemas/admin/resources'

export interface CreateResourceServiceInput extends CreateResourceInput {
  adminId: string
}

/**
 * Create a new resource in the database
 * Validates that externalId is unique
 */
export async function createResourceService(
  input: CreateResourceServiceInput
): Promise<Resource> {
  const {
    title,
    description,
    educationLevel,
    subject,
    externalId,
    isFree,
    thumbUrl,
  } = input

  // Check if externalId already exists (only if provided)
  if (externalId) {
    const existingResource = await prisma.resource.findUnique({
      where: { externalId },
    })

    if (existingResource) {
      throw new Error(`Resource with externalId ${externalId} already exists`)
    }
  }

  // Resolve slugs to IDs
  const [level, sub] = await Promise.all([
    prisma.educationLevel.findUnique({ where: { slug: educationLevel } }),
    prisma.subject.findUnique({ where: { slug: subject } })
  ])

  if (!level) throw new Error(`Education level ${educationLevel} not found`)
  if (!sub) throw new Error(`Subject ${subject} not found`)

  // Create the resource
  const resource = await prisma.resource.create({
    data: {
      title,
      description: description || null,
      educationLevelId: level.id,
      subjectId: sub.id,
      externalId: externalId ?? null,
      isFree,
      grades: {
        create: input.grades?.map(gradeSlug => ({
          grade: { connect: { slug: gradeSlug } }
        }))
      }
      // Handle images creation if input has them (logic tbd based on input schema)
    },
    include: {
      educationLevel: true,
      subject: true,
      images: true
    }
  })

  return resource
}
