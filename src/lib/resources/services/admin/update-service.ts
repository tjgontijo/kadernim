import { prisma } from '@/server/db'
import type { Resource } from '@db/client'
import { UpdateResourceInput } from '@/lib/resources/schemas/admin-resource-schemas'
import { slugify } from '@/lib/utils/string'
import { syncResourceFilesFromGoogleDrive } from './drive-sync-service'

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
    resourceType,
    pagesCount,
    estimatedDurationMinutes,
    googleDriveUrl,
    thumbUrl,
    thumbPublicId,
    bnccCodes,
    objectives,
    steps,
    archivedAt,
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

  if (title !== undefined) {
    const newSlug = slugify(title)
    
    // If slug changed, check for duplicates
    if (newSlug !== existingResource.slug) {
      const duplicate = await prisma.resource.findUnique({
        where: { slug: newSlug }
      })
      
      if (duplicate) {
        throw new Error('RESOURCE_ALREADY_EXISTS')
      }
      
      updateData.slug = newSlug
    }
    
    updateData.title = title
  }
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


  if (resourceType !== undefined) updateData.resourceType = resourceType
  if (pagesCount !== undefined) updateData.pagesCount = pagesCount
  if (estimatedDurationMinutes !== undefined) {
    updateData.estimatedDurationMinutes = estimatedDurationMinutes
  }
  if (archivedAt !== undefined) updateData.archivedAt = archivedAt
  if (googleDriveUrl !== undefined) updateData.googleDriveUrl = googleDriveUrl ?? null

  if (objectives !== undefined) {
    updateData.objectives = {
      deleteMany: {},
      create: objectives.map((objective, index) => ({
        text: objective.text,
        order: index + 1,
      })),
    }
  }

  if (steps !== undefined) {
    updateData.steps = {
      deleteMany: {},
      create: steps.map((step, index) => ({
        type: step.type,
        title: step.title,
        duration: step.duration ?? null,
        content: step.content,
        order: index + 1,
      })),
    }
  }
  if (thumbUrl !== undefined) updateData.thumbUrl = thumbUrl ?? null
  if (thumbPublicId !== undefined) updateData.thumbPublicId = thumbPublicId ?? null
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

  if (bnccCodes !== undefined) {
    const skills = bnccCodes.length > 0
      ? await prisma.bnccSkill.findMany({
          where: { code: { in: bnccCodes } },
          select: { id: true },
        })
      : []

    updateData.bnccSkills = {
      deleteMany: {},
      create: skills.map((skill) => ({
        bnccSkill: { connect: { id: skill.id } },
      })),
    }
  }

  // TODO: Add support for updating images (add/remove from ResourceImage relation)

  // Update the resource
  const resource = await prisma.resource.update({
    where: { id },
    data: updateData,
  })

  const shouldSyncDrive = googleDriveUrl !== undefined && !!resource.googleDriveUrl
  if (shouldSyncDrive) {
    try {
      const syncSummary = await syncResourceFilesFromGoogleDrive({
        resourceId: resource.id,
        resourceSlug: resource.slug || existingResource.slug || slugify(resource.title),
        resourceTitle: resource.title,
        googleDriveUrl: resource.googleDriveUrl!,
      })
      console.info('[GOOGLE_DRIVE_SYNC][UPDATE]', {
        resourceId: resource.id,
        ...syncSummary,
      })
    } catch (error) {
      console.error(`[GOOGLE_DRIVE_SYNC][UPDATE] Falha no recurso ${resource.id}:`, error)
    }
  }

  return resource
}
