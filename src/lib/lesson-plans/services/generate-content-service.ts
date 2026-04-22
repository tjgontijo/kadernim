import { generateObject } from 'ai'
import { openai } from '@ai-sdk/openai'
import type { CreateLessonPlanInput, ResourceSnapshot, LessonPlanContent } from '@/lib/lesson-plans/schemas'
import { LessonPlanContentSchema } from '@/lib/lesson-plans/schemas'
import { estimateCostUsd, extractUsageTokens } from '@/lib/lesson-plans/services/cost-estimation-service'

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
3. Sempre inclua useResourceStepIds em cada etapa do flow como array de strings.
4. Se nao houver passos do recurso aplicaveis na etapa, use useResourceStepIds: [].
5. Retorne texto em portugues do Brasil.
6. Gere resposta estritamente no schema informado.`
}

function evaluateGeneratedContent(content: LessonPlanContent, input: {
  resourceSnapshot: ResourceSnapshot
  durationMinutes: number
}) {
  const issues: string[] = []

  const totalDuration = content.flow.reduce((total, step) => total + step.durationMinutes, 0)
  if (Math.abs(totalDuration - input.durationMinutes) > 8) {
    issues.push(`A soma da duracao do flow (${totalDuration}) deve ficar proxima de ${input.durationMinutes}.`)
  }

  if (content.materials.length === 0) {
    issues.push('A lista de materiais nao pode vir vazia.')
  }

  if (content.preparation.length === 0) {
    issues.push('A lista de preparacao nao pode vir vazia.')
  }

  const snapshotStepIds = new Set(input.resourceSnapshot.steps.map((step) => step.id))
  if (snapshotStepIds.size > 0) {
    const usedStepIds = content.flow.flatMap((step) =>
      step.useResourceStepIds.filter((id) => snapshotStepIds.has(id))
    )
    if (usedStepIds.length === 0) {
      issues.push('Pelo menos uma etapa deve referenciar passos reais do recurso em useResourceStepIds.')
    }
  }

  if (input.resourceSnapshot.bnccSkills.length > 0 && content.bncc.length === 0) {
    issues.push('BNCC nao pode ficar vazia quando o recurso possui habilidades vinculadas.')
  }

  return issues
}

export async function generateLessonPlanContent(input: {
  resourceSnapshot: ResourceSnapshot
  durationMinutes: number
  mode: CreateLessonPlanInput['mode']
  teacherNote?: string
}): Promise<{
  content: LessonPlanContent
  model: string
  metrics: {
    attempts: number
    latencyMs: number
    inputTokens: number
    outputTokens: number
    totalTokens: number
    inputCostUsd: number
    outputCostUsd: number
    totalCostUsd: number
  }
}> {
  const model = process.env.LESSON_PLAN_MODEL || 'gpt-4o-mini'
  const startedAt = Date.now()
  let attempts = 0
  let inputTokens = 0
  let outputTokens = 0
  let totalTokens = 0

  let result = await generateObject({
    model: openai(model),
    schema: LessonPlanContentSchema,
    prompt: buildPrompt(input),
    temperature: 0.4,
  })
  attempts += 1
  {
    const usage = extractUsageTokens((result as { usage?: unknown }).usage)
    inputTokens += usage.inputTokens
    outputTokens += usage.outputTokens
    totalTokens += usage.totalTokens
  }

  const issues = evaluateGeneratedContent(result.object, input)
  if (issues.length > 0) {
    result = await generateObject({
      model: openai(model),
      schema: LessonPlanContentSchema,
      temperature: 0.3,
      prompt: `${buildPrompt(input)}

Plano anterior gerado (corrija sem mudar a base do recurso):
${JSON.stringify(result.object)}

Problemas detectados que devem ser corrigidos:
${issues.map((issue, index) => `${index + 1}. ${issue}`).join('\n')}
`,
    })
    attempts += 1
    const usage = extractUsageTokens((result as { usage?: unknown }).usage)
    inputTokens += usage.inputTokens
    outputTokens += usage.outputTokens
    totalTokens += usage.totalTokens
  }

  const costs = estimateCostUsd(model, { inputTokens, outputTokens, totalTokens })

  return {
    content: result.object,
    model,
    metrics: {
      attempts,
      latencyMs: Date.now() - startedAt,
      inputTokens,
      outputTokens,
      totalTokens,
      inputCostUsd: costs.inputCostUsd,
      outputCostUsd: costs.outputCostUsd,
      totalCostUsd: costs.totalCostUsd,
    },
  }
}
