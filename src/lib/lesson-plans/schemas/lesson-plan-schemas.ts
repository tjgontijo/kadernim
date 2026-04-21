import { z } from 'zod'

export const LessonPlanOriginEnum = z.enum(['RESOURCE', 'MANUAL'])
export type LessonPlanOrigin = z.infer<typeof LessonPlanOriginEnum>

export const LessonPlanStatusEnum = z.enum(['GENERATED', 'FAILED', 'ARCHIVED'])
export type LessonPlanStatus = z.infer<typeof LessonPlanStatusEnum>

export const LessonPlanModeEnum = z.enum([
  'FULL_LESSON',
  'REVIEW',
  'GROUP_ACTIVITY',
  'DIAGNOSTIC',
  'HOMEWORK',
])
export type LessonPlanMode = z.infer<typeof LessonPlanModeEnum>

export const LessonPlanFlowItemSchema = z.object({
  title: z.string().min(1),
  durationMinutes: z.number().int().min(1),
  teacherActions: z.array(z.string().min(1)).min(1),
  studentActions: z.array(z.string().min(1)).min(1),
  useResourceStepIds: z.array(z.string()),
})

export const LessonPlanContentSchema = z.object({
  overview: z.string().min(1),
  objective: z.string().min(1),
  bncc: z.array(z.object({ code: z.string(), description: z.string() })),
  materials: z.array(z.string()),
  preparation: z.array(z.string()),
  flow: z.array(LessonPlanFlowItemSchema).min(1),
  assessment: z.object({
    evidence: z.array(z.string()).min(1),
    quickCheck: z.string().min(1),
  }),
  adaptations: z.object({
    lessTime: z.string().min(1),
    moreDifficulty: z.string().min(1),
    groupWork: z.string().min(1),
  }),
  teacherNotes: z.string(),
})

export type LessonPlanContent = z.infer<typeof LessonPlanContentSchema>
export type LessonPlanFlowItem = z.infer<typeof LessonPlanFlowItemSchema>

export const CreateLessonPlanInputSchema = z.object({
  durationMinutes: z.number().int().min(30).max(240),
  mode: LessonPlanModeEnum,
  teacherNote: z.string().max(500).optional(),
})

export type CreateLessonPlanInput = z.infer<typeof CreateLessonPlanInputSchema>

export const ResourceSnapshotSchema = z.object({
  resourceId: z.string().uuid(),
  title: z.string(),
  description: z.string().optional(),
  educationLevel: z.object({
    id: z.string().uuid(),
    name: z.string(),
  }),
  grades: z.array(
    z.object({
      id: z.string().uuid(),
      name: z.string(),
    })
  ),
  subject: z.object({
    id: z.string().uuid(),
    name: z.string(),
  }),
  objectives: z.array(
    z.object({
      id: z.string().uuid(),
      text: z.string(),
      order: z.number(),
    })
  ),
  steps: z.array(
    z.object({
      id: z.string().uuid(),
      title: z.string(),
      content: z.string(),
      order: z.number(),
    })
  ),
  bnccSkills: z.array(
    z.object({
      code: z.string(),
      description: z.string(),
    })
  ),
  files: z
    .array(
      z.object({
        id: z.string().uuid(),
        name: z.string(),
        fileType: z.string().optional(),
      })
    )
    .optional(),
})

export type ResourceSnapshot = z.infer<typeof ResourceSnapshotSchema>

export const LessonPlanRecordSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  sourceResourceId: z.string().uuid().nullable(),
  title: z.string(),
  status: LessonPlanStatusEnum,
  origin: LessonPlanOriginEnum,
  mode: LessonPlanModeEnum,
  educationLevelId: z.string().uuid().nullable(),
  subjectId: z.string().uuid().nullable(),
  gradeId: z.string().uuid().nullable(),
  durationMinutes: z.number().int(),
  classCount: z.number().int().nullable(),
  teacherNote: z.string().nullable(),
  content: LessonPlanContentSchema,
  sourceSnapshot: ResourceSnapshotSchema,
  generationMeta: z.record(z.string(), z.unknown()).nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  archivedAt: z.string().nullable(),
})

export type LessonPlanRecord = z.infer<typeof LessonPlanRecordSchema>

export const LessonPlanListItemSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  status: LessonPlanStatusEnum,
  mode: LessonPlanModeEnum,
  durationMinutes: z.number().int(),
  classCount: z.number().int().nullable(),
  createdAt: z.string(),
  archivedAt: z.string().nullable(),
  sourceResourceId: z.string().uuid().nullable(),
  sourceResourceTitle: z.string().nullable(),
  educationLevelName: z.string().nullable(),
  subjectName: z.string().nullable(),
  gradeName: z.string().nullable(),
})

export type LessonPlanListItem = z.infer<typeof LessonPlanListItemSchema>

export const LessonPlanListResponseSchema = z.object({
  data: z.array(LessonPlanListItemSchema),
})

export type LessonPlanListResponse = z.infer<typeof LessonPlanListResponseSchema>

export const LessonPlanCreateResponseSchema = z.object({
  id: z.string().uuid(),
  redirectUrl: z.string(),
})

export type LessonPlanCreateResponse = z.infer<typeof LessonPlanCreateResponseSchema>

export const LessonPlanArchiveInputSchema = z.object({
  archived: z.boolean(),
})

export type LessonPlanArchiveInput = z.infer<typeof LessonPlanArchiveInputSchema>
