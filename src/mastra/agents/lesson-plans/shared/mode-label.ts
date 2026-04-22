import type { CreateLessonPlanInput } from '@/lib/lesson-plans/schemas'

export function modeToLabel(mode: CreateLessonPlanInput['mode']) {
  if (mode === 'FULL_LESSON') return 'Aula completa'
  if (mode === 'REVIEW') return 'Revisao'
  if (mode === 'GROUP_ACTIVITY') return 'Atividade em grupo'
  if (mode === 'DIAGNOSTIC') return 'Avaliacao diagnostica'
  return 'Tarefa'
}
