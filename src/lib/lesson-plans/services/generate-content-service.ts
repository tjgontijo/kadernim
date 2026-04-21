import { generateObject } from 'ai'
import { openai } from '@ai-sdk/openai'
import type { CreateLessonPlanInput, ResourceSnapshot, LessonPlanContent } from '@/lib/lesson-plans/schemas'
import { LessonPlanContentSchema } from '@/lib/lesson-plans/schemas'

function modeToLabel(mode: CreateLessonPlanInput['mode']) {
  if (mode === 'FULL_LESSON') return 'Aula completa'
  if (mode === 'REVIEW') return 'Revisao'
  if (mode === 'GROUP_ACTIVITY') return 'Atividade em grupo'
  if (mode === 'DIAGNOSTIC') return 'Avaliacao diagnostica'
  return 'Tarefa'
}

function buildPrompt(input: {
  resourceSnapshot: ResourceSnapshot
  durationMinutes: number
  mode: CreateLessonPlanInput['mode']
  teacherNote?: string
}) {
  const snapshot = input.resourceSnapshot

  return `Com base exclusivamente no recurso abaixo, gere um plano de aula estruturado em JSON.

Recurso:
- Titulo: ${snapshot.title}
- Descricao: ${snapshot.description ?? 'Sem descricao'}
- Etapa: ${snapshot.educationLevel.name}
- Serie: ${snapshot.grades.map((grade) => grade.name).join(', ') || 'Nao informado'}
- Disciplina: ${snapshot.subject.name}
- Objetivos: ${snapshot.objectives.map((objective) => `${objective.order}. ${objective.text}`).join(' | ') || 'Nao informado'}
- Passos: ${snapshot.steps.map((step) => `${step.order}. ${step.title}: ${step.content}`).join(' | ') || 'Nao informado'}
- BNCC: ${snapshot.bnccSkills.map((skill) => `${skill.code}: ${skill.description}`).join(' | ') || 'Nao informado'}

Parametros:
- Duracao total: ${input.durationMinutes} minutos
- Tipo de uso: ${modeToLabel(input.mode)}
- Observacao da professora: ${input.teacherNote?.trim() || 'Nenhuma'}

Regras obrigatorias:
1. Preserve objetivos e BNCC do recurso, sem inventar novos codigos.
2. Distribua o tempo total entre etapas em flow e some ${input.durationMinutes} minutos.
3. Use passos do recurso no flow via useResourceStepIds quando fizer sentido.
4. Retorne texto em portugues do Brasil.
5. Gere resposta estritamente no schema informado.`
}

export async function generateLessonPlanContent(input: {
  resourceSnapshot: ResourceSnapshot
  durationMinutes: number
  mode: CreateLessonPlanInput['mode']
  teacherNote?: string
}): Promise<{ content: LessonPlanContent; model: string }> {
  const model = process.env.LESSON_PLAN_MODEL || 'gpt-4o-mini'

  const result = await generateObject({
    model: openai(model),
    schema: LessonPlanContentSchema,
    prompt: buildPrompt(input),
    temperature: 0.4,
  })

  return {
    content: result.object,
    model,
  }
}
