import type { CreateLessonPlanInput, ResourceSnapshot } from '@/lib/lesson-plans/schemas'
import type { LessonPlanContext } from '@/mastra/agents/lesson-plans/shared/schemas'
import { buildResourceSnapshotBlock } from '@/mastra/agents/lesson-plans/context-agent/prompts'
import { modeToLabel } from '@/mastra/agents/lesson-plans/shared/mode-label'

export function buildDraftPrompt(input: {
  resourceSnapshot: ResourceSnapshot
  durationMinutes: number
  mode: CreateLessonPlanInput['mode']
  teacherNote?: string
  context: LessonPlanContext
  skillsBlock: string
}) {
  return `${input.skillsBlock}\n\n${buildResourceSnapshotBlock(input.resourceSnapshot)}\n\nContexto:\n${JSON.stringify(input.context)}\n\nParametros:\n- Duracao: ${input.durationMinutes} min\n- Tipo: ${modeToLabel(input.mode)}\n- Observacao: ${input.teacherNote?.trim() || 'Nenhuma'}`
}
