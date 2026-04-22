import type { CreateLessonPlanInput, ResourceSnapshot, LessonPlanContent } from '@/lib/lesson-plans/schemas'
import type { LessonPlanContext } from '@/mastra/agents/lesson-plans/schemas/lesson-plan-agent-schemas'

function modeToLabel(mode: CreateLessonPlanInput['mode']) {
  if (mode === 'FULL_LESSON') return 'Aula completa'
  if (mode === 'REVIEW') return 'Revisao'
  if (mode === 'GROUP_ACTIVITY') return 'Atividade em grupo'
  if (mode === 'DIAGNOSTIC') return 'Avaliacao diagnostica'
  return 'Tarefa'
}

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
  return `${input.skillsBlock}\n\nExtraia um contexto objetivo para planejar uma aula sem inventar dados.\n\n${buildResourceSnapshotBlock(input.resourceSnapshot)}\n\nParametros:\n- Duracao total: ${input.durationMinutes} minutos\n- Tipo de uso: ${modeToLabel(input.mode)}\n- Observacao da professora: ${input.teacherNote?.trim() || 'Nenhuma'}`
}

export function buildDraftPrompt(input: {
  resourceSnapshot: ResourceSnapshot
  durationMinutes: number
  mode: CreateLessonPlanInput['mode']
  teacherNote?: string
  context: LessonPlanContext
  skillsBlock: string
}) {
  return `${input.skillsBlock}\n\nGere um plano de aula completo no schema solicitado.\n\n${buildResourceSnapshotBlock(input.resourceSnapshot)}\n\nContexto sintetizado:\n${JSON.stringify(input.context)}\n\nParametros:\n- Duracao total: ${input.durationMinutes} minutos\n- Tipo de uso: ${modeToLabel(input.mode)}\n- Observacao da professora: ${input.teacherNote?.trim() || 'Nenhuma'}\n\nRegras obrigatorias:\n1. Preserve objetivos e BNCC do recurso, sem inventar codigos.\n2. Distribua o tempo em flow e mantenha o total proximo de ${input.durationMinutes} minutos.\n3. Sempre inclua useResourceStepIds em cada etapa do flow.\n4. Se nao houver passo aplicavel na etapa, use useResourceStepIds: [].\n5. Responda em pt-BR.`
}

export function buildReviewPrompt(input: {
  resourceSnapshot: ResourceSnapshot
  durationMinutes: number
  draft: LessonPlanContent
  deterministicIssues: string[]
  skillsBlock: string
}) {
  return `${input.skillsBlock}\n\nRevise o plano com foco em consistencia pedagogica e aderencia ao recurso.\n\n${buildResourceSnapshotBlock(input.resourceSnapshot)}\n\nDuracao alvo: ${input.durationMinutes} minutos\n\nPlano gerado:\n${JSON.stringify(input.draft)}\n\nProblemas deterministicos detectados:\n${input.deterministicIssues.length > 0 ? input.deterministicIssues.map((issue, index) => `${index + 1}. ${issue}`).join('\n') : 'Nenhum problema deterministico detectado.'}`
}

export function buildRefinePrompt(input: {
  resourceSnapshot: ResourceSnapshot
  durationMinutes: number
  previousDraft: LessonPlanContent
  review: { fixBrief: string; issues: Array<{ severity: 'HIGH' | 'MEDIUM' | 'LOW'; message: string }> }
  deterministicIssues: string[]
  skillsBlock: string
}) {
  return `${input.skillsBlock}\n\nRefine o plano abaixo corrigindo apenas os problemas apontados, sem perder aderencia ao recurso.\n\n${buildResourceSnapshotBlock(input.resourceSnapshot)}\n\nDuracao alvo: ${input.durationMinutes} minutos\n\nPlano atual:\n${JSON.stringify(input.previousDraft)}\n\nRevisao:\n- fixBrief: ${input.review.fixBrief}\n- issues: ${JSON.stringify(input.review.issues)}\n\nProblemas deterministicos:\n${input.deterministicIssues.length > 0 ? input.deterministicIssues.map((issue, index) => `${index + 1}. ${issue}`).join('\n') : 'Nenhum'}`
}
