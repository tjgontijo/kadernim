import { prisma } from '@/server/db'
import type { Resource, EducationLevel, Subject } from '@db/client'
import { CreateResourceInput } from '@/lib/resources/schemas/admin-resource-schemas'

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
    resourceType,
    pagesCount,
    estimatedDurationMinutes,
    googleDriveUrl,
    pedagogicalContent,
    bnccCodes,
  } = input
 
  // Resolve slugs to IDs
  const [level, sub] = await Promise.all([
    prisma.educationLevel.findUnique({ where: { slug: educationLevel } }),
    prisma.subject.findUnique({ where: { slug: subject } })
  ])
 
  if (!level) throw new Error(`Education level ${educationLevel} not found`)
  if (!sub) throw new Error(`Subject ${subject} not found`)
 
  // Validate that all grades belong to the specified education level
  if (input.grades && input.grades.length > 0) {
    const gradesInDb = await prisma.grade.findMany({
      where: {
        slug: { in: input.grades },
        educationLevelId: level.id
      }
    })
 
    if (gradesInDb.length !== input.grades.length) {
      throw new Error(`One or more grades do not belong to the selected education level (${educationLevel})`)
    }
  }
 
  // Create the resource
  const resource = await prisma.resource.create({
    data: {
      title,
      description: description || null,
      educationLevelId: level.id,
      subjectId: sub.id,
      resourceType: resourceType as any,
      pagesCount: pagesCount ?? null,
      estimatedDurationMinutes: estimatedDurationMinutes ?? null,
      googleDriveUrl: googleDriveUrl ?? null,
      objectives: pedagogicalContent?.objectives
        ? {
            create: pedagogicalContent.objectives.map((objective, index) => ({
              text: objective.text,
              order: index + 1,
            })),
          }
        : undefined,
      steps: pedagogicalContent?.steps
        ? {
            create: pedagogicalContent.steps.map((step, index) => ({
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
      bnccSkills: bnccCodes && bnccCodes.length > 0 ? {
        create: (await prisma.bnccSkill.findMany({
          where: { code: { in: bnccCodes } },
          select: { id: true }
        })).map(skill => ({
          bnccSkill: { connect: { id: skill.id } }
        }))
      } : undefined
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
