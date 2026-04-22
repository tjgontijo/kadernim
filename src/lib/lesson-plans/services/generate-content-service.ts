import type { CreateLessonPlanInput, ResourceSnapshot, LessonPlanContent } from '@/lib/lesson-plans/schemas'
import { estimateCostUsd, extractUsageTokens } from '@/lib/lesson-plans/services/cost-estimation-service'
import { generateLessonPlanContentWithAgents } from '@/mastra/agents/lesson-plans'
import type { LessonPlanBuildPhaseEvent } from '@/lib/lesson-plans/schemas'

export async function generateLessonPlanContent(input: {
  resourceSnapshot: ResourceSnapshot
  durationMinutes: number
  mode: CreateLessonPlanInput['mode']
  teacherNote?: string
  onPhase?: (event: LessonPlanBuildPhaseEvent) => void
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

  const orchestratedResult = await generateLessonPlanContentWithAgents(input)
  attempts = orchestratedResult.attempts
  inputTokens = orchestratedResult.usage.inputTokens
  outputTokens = orchestratedResult.usage.outputTokens
  totalTokens = orchestratedResult.usage.totalTokens

  const safeUsage = extractUsageTokens({ inputTokens, outputTokens, totalTokens })
  inputTokens = safeUsage.inputTokens
  outputTokens = safeUsage.outputTokens
  totalTokens = safeUsage.totalTokens

  const costs = estimateCostUsd(model, { inputTokens, outputTokens, totalTokens })

  return {
    content: orchestratedResult.content,
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
