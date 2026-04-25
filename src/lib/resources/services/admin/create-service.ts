import { prisma } from '@/server/db'
import type { Resource, EducationLevel, Subject } from '@db/client'
import { CreateResourceInput } from '@/lib/resources/schemas/admin-resource-schemas'
import { slugify } from '@/lib/utils/string'
import { syncResourceFilesFromGoogleDrive } from './drive-sync-service'

export interface CreateResourceServiceInput extends CreateResourceInput {
  adminId: string
}

/**
 * Create a new resource in the database
 * Validates that slug is unique
 */
export async function createResourceService(
  input: CreateResourceServiceInput
): Promise<Resource> {
  const {
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
    objectives,
    steps,
    bnccCodes,
    thumbUrl,
    thumbPublicId,
  } = input

  // Generate slug and check for duplicates
  const slug = slugify(title)
  const existingBySlug = await prisma.resource.findUnique({
    where: { slug }
  })

  if (existingBySlug) {
    throw new Error('RESOURCE_ALREADY_EXISTS')
  }
 
  // Resolve slugs to IDs
  const [level, sub] = await Promise.all([
    educationLevel ? prisma.educationLevel.findUnique({ where: { slug: educationLevel } }) : null,
    subject ? prisma.subject.findUnique({ where: { slug: subject } }) : null
  ])
 
  // Create the resource
  const resource = await prisma.resource.create({
    data: {
      title,
      slug,
      description: description || null,
      educationLevelId: level?.id ?? null,
      subjectId: sub?.id ?? null,
      isUniversal: isUniversal ?? false,
      resourceType: resourceType as any,
      pagesCount: pagesCount ?? null,
      estimatedDurationMinutes: estimatedDurationMinutes ?? null,
      googleDriveUrl: googleDriveUrl ?? null,
      thumbUrl: thumbUrl ?? null,
      thumbPublicId: thumbPublicId ?? null,
      objectives: objectives
        ? {
            create: objectives.map((objective, index) => ({
              text: objective.text,
              order: index + 1,
            })),
          }
        : undefined,
      steps: steps
        ? {
            create: steps.map((step, index) => ({
              type: step.type,
              title: step.title,
              duration: step.duration ?? null,
              content: step.content,
              order: index + 1,
            })),
          }
        : undefined,
      grades: {
        create: input.grades?.map(gradeSlug => ({
          grade: { connect: { slug: gradeSlug } }
        }))
      },
      educationLevels: educationLevels && educationLevels.length > 0 ? {
        create: (await prisma.educationLevel.findMany({
          where: { slug: { in: educationLevels } },
          select: { id: true }
        })).map(lvl => ({
          educationLevel: { connect: { id: lvl.id } }
        }))
      } : (level ? {
        create: [{ educationLevel: { connect: { id: level.id } } }]
      } : undefined),
      subjects: subjects && subjects.length > 0 ? {
        create: (await prisma.subject.findMany({
          where: { slug: { in: subjects } },
          select: { id: true }
        })).map(s => ({
          subject: { connect: { id: s.id } }
        }))
      } : (sub ? {
        create: [{ subject: { connect: { id: sub.id } } }]
      } : undefined),
      bnccSkills: bnccCodes && bnccCodes.length > 0 ? {
        create: (await prisma.bnccSkill.findMany({
          where: { code: { in: bnccCodes } },
          select: { id: true }
        })).map(skill => ({
          bnccSkill: { connect: { id: skill.id } }
        }))
      } : undefined
    },
    include: {
      educationLevel: true,
      subject: true,
      images: true,
      educationLevels: true,
      subjects: true
    }
  })

  if (googleDriveUrl) {
    try {
      const syncSummary = await syncResourceFilesFromGoogleDrive({
        resourceId: resource.id,
        resourceSlug: resource.slug || slug,
        resourceTitle: resource.title,
        googleDriveUrl,
      })
      console.info('[GOOGLE_DRIVE_SYNC][CREATE]', {
        resourceId: resource.id,
        ...syncSummary,
      })
    } catch (error) {
      console.error(`[GOOGLE_DRIVE_SYNC][CREATE] Falha no recurso ${resource.id}:`, error)
    }
  }

  return resource
}
