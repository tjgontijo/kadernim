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
    educationLevels,
    subjects,
    isUniversal,
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
    if (educationLevel) {
      const level = await prisma.educationLevel.findUnique({
        where: { slug: educationLevel }
      })
      if (!level) throw new Error(`Education level ${educationLevel} not found`)
      updateData.educationLevelId = level.id
    } else {
      updateData.educationLevelId = null
    }
  }

  if (subject !== undefined) {
    if (subject) {
      const sub = await prisma.subject.findUnique({
        where: { slug: subject }
      })
      if (!sub) throw new Error(`Subject ${subject} not found`)
      updateData.subjectId = sub.id
    } else {
      updateData.subjectId = null
    }
  }

  if (isUniversal !== undefined) updateData.isUniversal = isUniversal
  if (resourceType !== undefined) updateData.resourceType = resourceType
  if (pagesCount !== undefined) updateData.pagesCount = pagesCount
  if (estimatedDurationMinutes !== undefined) {
    updateData.estimatedDurationMinutes = estimatedDurationMinutes
  }
  if (archivedAt !== undefined) updateData.archivedAt = archivedAt
  if (googleDriveUrl !== undefined) updateData.googleDriveUrl = googleDriveUrl ?? null

  if (educationLevels !== undefined) {
    const levels = educationLevels.length > 0
      ? await prisma.educationLevel.findMany({
          where: { slug: { in: educationLevels } },
          select: { id: true },
        })
      : []

    updateData.educationLevels = {
      deleteMany: {},
      create: levels.map((lvl) => ({
        educationLevel: { connect: { id: lvl.id } },
      })),
    }

    // Backup to legacy field if not explicitly provided
    if (educationLevel === undefined && levels.length > 0) {
      updateData.educationLevelId = levels[0].id
    }
  }

  if (subjects !== undefined) {
    const subs = subjects.length > 0
      ? await prisma.subject.findMany({
          where: { slug: { in: subjects } },
          select: { id: true },
        })
      : []

    updateData.subjects = {
      deleteMany: {},
      create: subs.map((sub) => ({
        subject: { connect: { id: sub.id } },
      })),
    }

    // Backup to legacy field if not explicitly provided
    if (subject === undefined && subs.length > 0) {
      updateData.subjectId = subs[0].id
    }
  }

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

  // Validate grades consistency (relaxed if universal or multi-level)
  if (input.grades !== undefined) {
    updateData.grades = {
      deleteMany: {},
      create: input.grades.map(gradeSlug => ({
        grade: { connect: { slug: gradeSlug } }
      }))
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
