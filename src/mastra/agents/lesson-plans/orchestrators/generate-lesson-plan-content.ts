import type { CreateLessonPlanInput, LessonPlanContent, ResourceSnapshot } from '@/lib/lesson-plans/schemas'
import { LessonPlanContentSchema } from '@/lib/lesson-plans/schemas'
import { extractUsageTokens } from '@/lib/lesson-plans/services/cost-estimation-service'
import {
  lessonPlanContextAgent,
  lessonPlanDraftAgent,
  lessonPlanRefineAgent,
  lessonPlanReviewAgent,
} from '@/mastra/agents/lesson-plans/lesson-plan-agents'
import { buildContextPrompt, buildDraftPrompt, buildRefinePrompt, buildReviewPrompt } from '@/mastra/agents/lesson-plans/prompts/lesson-plan-prompts'
import {
  LessonPlanContextSchema,
  LessonPlanReviewSchema,
} from '@/mastra/agents/lesson-plans/schemas/lesson-plan-agent-schemas'
import {
  JSON_OUTPUT_SKILL,
  PEDAGOGICAL_QUALITY_SKILL,
  RESOURCE_GROUNDING_SKILL,
} from '@/mastra/agents/lesson-plans/skills/lesson-plan-skills'

const BASE_SKILLS_BLOCK = `${RESOURCE_GROUNDING_SKILL}\n${PEDAGOGICAL_QUALITY_SKILL}\n${JSON_OUTPUT_SKILL}`

type UsageAggregate = {
  inputTokens: number
  outputTokens: number
  totalTokens: number
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

function addUsage(target: UsageAggregate, output: { usage?: unknown; totalUsage?: unknown }) {
  const usage = extractUsageTokens(output.totalUsage ?? output.usage)
  target.inputTokens += usage.inputTokens
  target.outputTokens += usage.outputTokens
  target.totalTokens += usage.totalTokens
}

export async function generateLessonPlanContentWithAgents(input: {
  resourceSnapshot: ResourceSnapshot
  durationMinutes: number
  mode: CreateLessonPlanInput['mode']
  teacherNote?: string
}): Promise<{
  content: LessonPlanContent
  attempts: number
  usage: UsageAggregate
}> {
  let attempts = 0
  const usage: UsageAggregate = { inputTokens: 0, outputTokens: 0, totalTokens: 0 }

  const contextResult = await lessonPlanContextAgent.generate(buildContextPrompt({
    resourceSnapshot: input.resourceSnapshot,
    durationMinutes: input.durationMinutes,
    mode: input.mode,
    teacherNote: input.teacherNote,
    skillsBlock: BASE_SKILLS_BLOCK,
  }), {
    structuredOutput: { schema: LessonPlanContextSchema },
  })
  attempts += 1
  addUsage(usage, contextResult)

  const draftResult = await lessonPlanDraftAgent.generate(buildDraftPrompt({
    resourceSnapshot: input.resourceSnapshot,
    durationMinutes: input.durationMinutes,
    mode: input.mode,
    teacherNote: input.teacherNote,
    context: contextResult.object,
    skillsBlock: BASE_SKILLS_BLOCK,
  }), {
    structuredOutput: { schema: LessonPlanContentSchema },
  })
  attempts += 1
  addUsage(usage, draftResult)

  const deterministicIssues = evaluateGeneratedContent(draftResult.object, {
    resourceSnapshot: input.resourceSnapshot,
    durationMinutes: input.durationMinutes,
  })

  const reviewResult = await lessonPlanReviewAgent.generate(buildReviewPrompt({
    resourceSnapshot: input.resourceSnapshot,
    durationMinutes: input.durationMinutes,
    draft: draftResult.object,
    deterministicIssues,
    skillsBlock: BASE_SKILLS_BLOCK,
  }), {
    structuredOutput: { schema: LessonPlanReviewSchema },
  })
  attempts += 1
  addUsage(usage, reviewResult)
  const review = LessonPlanReviewSchema.parse(reviewResult.object)

  const shouldRefine = review.shouldRefine
    || review.issues.some((issue) => issue.severity === 'HIGH')
    || deterministicIssues.length > 0

  if (!shouldRefine) {
    return {
      content: draftResult.object,
      attempts,
      usage,
    }
  }

  const refineResult = await lessonPlanRefineAgent.generate(buildRefinePrompt({
    resourceSnapshot: input.resourceSnapshot,
    durationMinutes: input.durationMinutes,
    previousDraft: draftResult.object,
    review,
    deterministicIssues,
    skillsBlock: BASE_SKILLS_BLOCK,
  }), {
    structuredOutput: { schema: LessonPlanContentSchema },
  })
  attempts += 1
  addUsage(usage, refineResult)

  return {
    content: refineResult.object,
    attempts,
    usage,
  }
}
