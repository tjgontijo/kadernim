import { prisma } from '@/lib/db'
import { ResourceSnapshotSchema, type ResourceSnapshot } from '@/lib/lesson-plans/schemas'

export type ResourcePlanSource = {
  snapshot: ResourceSnapshot
  educationLevelId: string | null
  subjectId: string | null
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
              grade: {
                select: {
                  id: true,
                  name: true,
                },
              },
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

  const linkedGrades = resource.grades
    .map((item) => item.grade)
    .filter((grade): grade is { id: string; name: string } => Boolean(grade))

  // Fallback estruturado: quando o recurso não tem relação em resource_grade,
  // usamos a(s) séries derivadas das habilidades BNCC vinculadas.
  const bnccGradesMap = new Map<string, { id: string; name: string }>()
  for (const item of resource.bnccSkills) {
    const grade = item.bnccSkill.grade
    if (grade) {
      bnccGradesMap.set(grade.id, grade)
    }
  }
  const bnccGrades = Array.from(bnccGradesMap.values())

  const grades = linkedGrades.length > 0 ? linkedGrades : bnccGrades

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
    educationLevelId: resource.educationLevelId ?? null,
    subjectId: resource.subjectId ?? null,
    gradeId: grades[0]?.id ?? null,
  }
}
