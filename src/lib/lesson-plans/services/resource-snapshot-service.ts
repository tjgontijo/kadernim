import { prisma } from '@/lib/db'
import { ResourceSnapshotSchema, type ResourceSnapshot } from '@/lib/lesson-plans/schemas'

export type ResourcePlanSource = {
  snapshot: ResourceSnapshot
  educationLevelId: string
  subjectId: string
  gradeId: string | null
}

export async function getResourceSnapshotForPlanner(resourceId: string): Promise<ResourcePlanSource> {
  const resource = await prisma.resource.findUnique({
    where: { id: resourceId },
    select: {
      id: true,
      title: true,
      description: true,
      educationLevelId: true,
      subjectId: true,
      educationLevel: {
        select: {
          id: true,
          name: true,
        },
      },
      subject: {
        select: {
          id: true,
          name: true,
        },
      },
      grades: {
        select: {
          grade: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      objectives: {
        select: {
          id: true,
          text: true,
          order: true,
        },
        orderBy: { order: 'asc' },
      },
      steps: {
        select: {
          id: true,
          title: true,
          content: true,
          order: true,
        },
        orderBy: { order: 'asc' },
      },
      bnccSkills: {
        select: {
          bnccSkill: {
            select: {
              code: true,
              description: true,
            },
          },
        },
      },
      files: {
        select: {
          id: true,
          name: true,
          fileType: true,
        },
      },
    },
  })

  if (!resource) {
    throw new Error('RESOURCE_NOT_FOUND')
  }

  const grades = resource.grades
    .map((item) => item.grade)
    .filter((grade): grade is { id: string; name: string } => Boolean(grade))

  const snapshot = ResourceSnapshotSchema.parse({
    resourceId: resource.id,
    title: resource.title,
    description: resource.description ?? undefined,
    educationLevel: resource.educationLevel,
    grades,
    subject: resource.subject,
    objectives: resource.objectives,
    steps: resource.steps,
    bnccSkills: resource.bnccSkills.map((item) => item.bnccSkill),
    files: resource.files.map((file) => ({
      id: file.id,
      name: file.name,
      fileType: file.fileType ?? undefined,
    })),
  })

  return {
    snapshot,
    educationLevelId: resource.educationLevelId,
    subjectId: resource.subjectId,
    gradeId: grades[0]?.id ?? null,
  }
}
