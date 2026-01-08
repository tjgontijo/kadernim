import { prisma } from '@/lib/db'
import type { Resource, EducationLevel, Subject } from '@db/client'
import { UpdateResourceInput } from '@/lib/schemas/admin/resources'

export interface UpdateResourceServiceInput extends UpdateResourceInput {
  id: string
  adminId: string
}

/**
 * Update a resource by ID
 * Only updates fields that are provided
 */
export async function updateResourceService(
  input: UpdateResourceServiceInput
): Promise<Resource> {
  const {
    id,
    title,
    description,
    educationLevel,
    subject,
    isFree,
    thumbUrl,
    externalId, // Added externalId to destructuring
  } = input

  // Check if resource exists
  const existingResource = await prisma.resource.findUnique({
    where: { id },
  })

  if (!existingResource) {
    throw new Error(`Resource with id ${id} not found`)
  }

  // Build update data (only include provided fields)
  const updateData: any = {}

  if (title !== undefined) updateData.title = title
  if (description !== undefined) updateData.description = description

  if (educationLevel !== undefined) {
    const level = await prisma.educationLevel.findUnique({
      where: { slug: educationLevel }
    })
    if (!level) throw new Error(`Education level ${educationLevel} not found`)
    updateData.educationLevelId = level.id
  }

  if (subject !== undefined) {
    const sub = await prisma.subject.findUnique({
      where: { slug: subject }
    })
    if (!sub) throw new Error(`Subject ${subject} not found`)
    updateData.subjectId = sub.id
  }

  if (isFree !== undefined) updateData.isFree = isFree

  if (externalId !== undefined) {
    if (externalId !== null) {
      const existing = await prisma.resource.findFirst({
        where: {
          externalId,
          id: { not: id }
        }
      })
      if (existing) throw new Error(`Resource with externalId ${externalId} already exists`)
    }
    updateData.externalId = externalId
  }
  // if (thumbUrl !== undefined) updateData.thumbUrl = thumbUrl -- removed
  // 1. Determine levelId for validation
  const levelId = updateData.educationLevelId || existingResource.educationLevelId;

  // 2. Validate grades consistency
  if (input.grades !== undefined) {
    // New grades provided: check if they belong to levelId
    if (input.grades.length > 0) {
      const gradesInDb = await prisma.grade.findMany({
        where: {
          slug: { in: input.grades },
          educationLevelId: levelId
        }
      });

      if (gradesInDb.length !== input.grades.length) {
        throw new Error(`One or more of the selected grades do not belong to the correct education level`);
      }
    }

    updateData.grades = {
      deleteMany: {},
      create: input.grades.map(gradeSlug => ({
        grade: { connect: { slug: gradeSlug } }
      }))
    }
  } else if (educationLevel !== undefined) {
    // Only educationLevel was updated: check if existing grades are still consistent
    const resourceWithGrades = await prisma.resource.findUnique({
      where: { id },
      include: { grades: { include: { grade: true } } }
    });

    const inconsistentGrades = resourceWithGrades?.grades.filter(
      rg => rg.grade.educationLevelId !== levelId
    );

    if (inconsistentGrades && inconsistentGrades.length > 0) {
      throw new Error(`The current grades of this resource are inconsistent with the new education level. Please update the grades as well.`);
    }
  }

  // TODO: Add support for updating images (add/remove from ResourceImage relation)

  // Update the resource
  const resource = await prisma.resource.update({
    where: { id },
    data: updateData,
  })

  return resource
}
