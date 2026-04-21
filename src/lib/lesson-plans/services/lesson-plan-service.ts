import { Prisma, prisma } from '@/lib/db'
import {
  type CreateLessonPlanInput,
  LessonPlanRecordSchema,
  LessonPlanListItemSchema,
  type LessonPlanListItem,
} from '@/lib/lesson-plans/schemas'
import { generateLessonPlanContent } from '@/lib/lesson-plans/services/generate-content-service'
import { getResourceSnapshotForPlanner } from '@/lib/lesson-plans/services/resource-snapshot-service'

type LessonPlanWithRelations = Prisma.LessonPlanGetPayload<{
  include: {
    sourceResource: { select: { title: true } }
    educationLevel: { select: { name: true } }
    subject: { select: { name: true } }
    grade: { select: { name: true } }
  }
}>

function modeLabel(mode: CreateLessonPlanInput['mode']) {
  if (mode === 'FULL_LESSON') return 'Aula completa'
  if (mode === 'REVIEW') return 'Revisao'
  if (mode === 'GROUP_ACTIVITY') return 'Atividade em grupo'
  if (mode === 'DIAGNOSTIC') return 'Avaliacao diagnostica'
  return 'Tarefa'
}

function serializeLessonPlan(plan: LessonPlanWithRelations) {
  return LessonPlanRecordSchema.parse({
    id: plan.id,
    userId: plan.userId,
    sourceResourceId: plan.sourceResourceId,
    title: plan.title,
    status: plan.status,
    origin: plan.origin,
    mode: plan.mode,
    educationLevelId: plan.educationLevelId,
    subjectId: plan.subjectId,
    gradeId: plan.gradeId,
    durationMinutes: plan.durationMinutes,
    classCount: plan.classCount,
    teacherNote: plan.teacherNote,
    content: plan.content,
    sourceSnapshot: plan.sourceSnapshot,
    generationMeta: plan.generationMeta,
    createdAt: plan.createdAt.toISOString(),
    updatedAt: plan.updatedAt.toISOString(),
    archivedAt: plan.archivedAt ? plan.archivedAt.toISOString() : null,
  })
}

function serializeListItem(plan: LessonPlanWithRelations): LessonPlanListItem {
  return LessonPlanListItemSchema.parse({
    id: plan.id,
    title: plan.title,
    status: plan.status,
    mode: plan.mode,
    durationMinutes: plan.durationMinutes,
    classCount: plan.classCount,
    createdAt: plan.createdAt.toISOString(),
    archivedAt: plan.archivedAt ? plan.archivedAt.toISOString() : null,
    sourceResourceId: plan.sourceResourceId,
    sourceResourceTitle: plan.sourceResource?.title ?? null,
    educationLevelName: plan.educationLevel?.name ?? null,
    subjectName: plan.subject?.name ?? null,
    gradeName: plan.grade?.name ?? null,
  })
}

export async function createLessonPlanFromResource(params: {
  userId: string
  resourceId: string
  input: CreateLessonPlanInput
}) {
  const source = await getResourceSnapshotForPlanner(params.resourceId)

  const { content, model } = await generateLessonPlanContent({
    resourceSnapshot: source.snapshot,
    durationMinutes: params.input.durationMinutes,
    mode: params.input.mode,
    teacherNote: params.input.teacherNote,
  })

  const lessonPlan = await prisma.lessonPlan.create({
    data: {
      userId: params.userId,
      sourceResourceId: params.resourceId,
      title: `Plano de aula: ${source.snapshot.title}`,
      status: 'GENERATED',
      origin: 'RESOURCE',
      mode: params.input.mode,
      educationLevelId: source.educationLevelId,
      subjectId: source.subjectId,
      gradeId: source.gradeId,
      durationMinutes: params.input.durationMinutes,
      classCount: Math.max(1, Math.ceil(params.input.durationMinutes / 50)),
      teacherNote: params.input.teacherNote ?? null,
      content: content as Prisma.InputJsonValue,
      sourceSnapshot: source.snapshot as Prisma.InputJsonValue,
      generationMeta: {
        model,
        generatedAt: new Date().toISOString(),
        modeLabel: modeLabel(params.input.mode),
      } as Prisma.InputJsonValue,
    },
    include: {
      sourceResource: { select: { title: true } },
      educationLevel: { select: { name: true } },
      subject: { select: { name: true } },
      grade: { select: { name: true } },
    },
  })

  return serializeLessonPlan(lessonPlan)
}

export async function listLessonPlansByUser(params: {
  userId: string
  includeArchived: boolean
  q?: string
  gradeId?: string
  subjectId?: string
  sourceResourceId?: string
}) {
  const plans = await prisma.lessonPlan.findMany({
    where: {
      userId: params.userId,
      archivedAt: params.includeArchived ? undefined : null,
      gradeId: params.gradeId,
      subjectId: params.subjectId,
      sourceResourceId: params.sourceResourceId,
      title: params.q
        ? {
            contains: params.q,
            mode: 'insensitive',
          }
        : undefined,
    },
    orderBy: { createdAt: 'desc' },
    include: {
      sourceResource: { select: { title: true } },
      educationLevel: { select: { name: true } },
      subject: { select: { name: true } },
      grade: { select: { name: true } },
    },
    take: 100,
  })

  return plans.map(serializeListItem)
}

export async function getLessonPlanById(params: {
  id: string
  userId: string
  isAdmin: boolean
}) {
  const plan = await prisma.lessonPlan.findFirst({
    where: {
      id: params.id,
      ...(params.isAdmin ? {} : { userId: params.userId }),
    },
    include: {
      sourceResource: { select: { title: true } },
      educationLevel: { select: { name: true } },
      subject: { select: { name: true } },
      grade: { select: { name: true } },
    },
  })

  if (!plan) {
    throw new Error('LESSON_PLAN_NOT_FOUND')
  }

  return serializeLessonPlan(plan)
}

export async function setLessonPlanArchived(params: {
  id: string
  userId: string
  isAdmin: boolean
  archived: boolean
}) {
  const current = await prisma.lessonPlan.findFirst({
    where: {
      id: params.id,
      ...(params.isAdmin ? {} : { userId: params.userId }),
    },
    select: { id: true },
  })

  if (!current) {
    throw new Error('LESSON_PLAN_NOT_FOUND')
  }

  const updated = await prisma.lessonPlan.update({
    where: { id: params.id },
    data: {
      archivedAt: params.archived ? new Date() : null,
      status: params.archived ? 'ARCHIVED' : 'GENERATED',
    },
    include: {
      sourceResource: { select: { title: true } },
      educationLevel: { select: { name: true } },
      subject: { select: { name: true } },
      grade: { select: { name: true } },
    },
  })

  return serializeLessonPlan(updated)
}
