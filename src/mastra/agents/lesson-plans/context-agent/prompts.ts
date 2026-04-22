import type { CreateLessonPlanInput, ResourceSnapshot } from '@/lib/lesson-plans/schemas'
import { modeToLabel } from '@/mastra/agents/lesson-plans/shared/mode-label'

export function buildResourceSnapshotBlock(snapshot: ResourceSnapshot) {
  return `Recurso:\n- Titulo: ${snapshot.title}\n- Descricao: ${snapshot.description ?? 'Sem descricao'}\n- Etapa: ${snapshot.educationLevel.name}\n- Serie: ${snapshot.grades.map((grade) => grade.name).join(', ') || 'Nao informado'}\n- Disciplina: ${snapshot.subject.name}\n- Objetivos: ${snapshot.objectives.map((objective) => `${objective.order}. ${objective.text}`).join(' | ') || 'Nao informado'}\n- Passos: ${snapshot.steps.map((step) => `${step.order}. [${step.id}] ${step.title}: ${step.content}`).join(' | ') || 'Nao informado'}\n- BNCC: ${snapshot.bnccSkills.map((skill) => `${skill.code}: ${skill.description}`).join(' | ') || 'Nao informado'}`
}

export function buildContextPrompt(input: {
  resourceSnapshot: ResourceSnapshot
  durationMinutes: number
  mode: CreateLessonPlanInput['mode']
  teacherNote?: string
  skillsBlock: string
}) {
  return `${input.skillsBlock}\n\n${buildResourceSnapshotBlock(input.resourceSnapshot)}\n\nParametros:\n- Duracao: ${input.durationMinutes} min\n- Tipo: ${modeToLabel(input.mode)}\n- Observacao: ${input.teacherNote?.trim() || 'Nenhuma'}`
}
