export type LessonPlanBuildPhase = 'snapshot' | 'context' | 'draft' | 'review' | 'refine' | 'persist'
export type LessonPlanBuildPhaseStatus = 'started' | 'completed' | 'skipped'

export type LessonPlanBuildPhaseEvent = {
  phase: LessonPlanBuildPhase
  status: LessonPlanBuildPhaseStatus
  details?: string
}
