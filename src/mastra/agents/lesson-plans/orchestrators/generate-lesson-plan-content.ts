import type { CreateLessonPlanInput, LessonPlanContent, ResourceSnapshot } from '@/lib/lesson-plans/schemas'
import { LessonPlanContentSchema } from '@/lib/lesson-plans/schemas'
import type { LessonPlanBuildPhaseEvent } from '@/lib/lesson-plans/schemas'
import { extractUsageTokens } from '@/lib/lesson-plans/services/cost-estimation-service'
import { lessonPlanContextAgent } from '@/mastra/agents/lesson-plans/context-agent/context-agent'
import { buildContextPrompt } from '@/mastra/agents/lesson-plans/context-agent/prompts'
import { CONTEXT_EXTRACTION } from '@/mastra/agents/lesson-plans/context-agent/skills'
import { lessonPlanDraftAgent } from '@/mastra/agents/lesson-plans/draft-agent/draft-agent'
import { buildDraftPrompt } from '@/mastra/agents/lesson-plans/draft-agent/prompts'
import { DRAFT_FIELD_RULES, DRAFT_FLOW_RULES } from '@/mastra/agents/lesson-plans/draft-agent/skills'
import { lessonPlanRefineAgent } from '@/mastra/agents/lesson-plans/refine-agent/refine-agent'
import { buildRefinePrompt } from '@/mastra/agents/lesson-plans/refine-agent/prompts'
import { REFINE_RULES } from '@/mastra/agents/lesson-plans/refine-agent/skills'
import { lessonPlanReviewAgent } from '@/mastra/agents/lesson-plans/review-agent/review-agent'
import { buildReviewPrompt } from '@/mastra/agents/lesson-plans/review-agent/prompts'
import { REVIEW_CHECKLIST } from '@/mastra/agents/lesson-plans/review-agent/skills'
import {
  LessonPlanContextSchema,
  LessonPlanReviewSchema,
} from '@/mastra/agents/lesson-plans/shared/schemas'
import { OUTPUT_CONTRACT, RESOURCE_FIDELITY } from '@/mastra/agents/lesson-plans/shared/skills'

const CONTEXT_SKILLS = [RESOURCE_FIDELITY, CONTEXT_EXTRACTION, OUTPUT_CONTRACT].join('\n\n')
const DRAFT_SKILLS = [RESOURCE_FIDELITY, DRAFT_FLOW_RULES, DRAFT_FIELD_RULES, OUTPUT_CONTRACT].join('\n\n')
const REVIEW_SKILLS = [REVIEW_CHECKLIST, OUTPUT_CONTRACT].join('\n\n')
const REFINE_SKILLS = [RESOURCE_FIDELITY, REFINE_RULES, DRAFT_FLOW_RULES, OUTPUT_CONTRACT].join('\n\n')

type UsageAggregate = {
  inputTokens: number
  outputTokens: number
  totalTokens: number
}

type PhaseEvent = LessonPlanBuildPhaseEvent

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
  onPhase?: (event: PhaseEvent) => void
}): Promise<{
  content: LessonPlanContent
  attempts: number
  usage: UsageAggregate
}> {
  let attempts = 0
  const usage: UsageAggregate = { inputTokens: 0, outputTokens: 0, totalTokens: 0 }

  input.onPhase?.({ phase: 'context', status: 'started' })
  const contextResult = await lessonPlanContextAgent.generate(buildContextPrompt({
    resourceSnapshot: input.resourceSnapshot,
    durationMinutes: input.durationMinutes,
    mode: input.mode,
    teacherNote: input.teacherNote,
    skillsBlock: CONTEXT_SKILLS,
  }), {
    structuredOutput: { schema: LessonPlanContextSchema },
  })
  attempts += 1
  addUsage(usage, contextResult)
  input.onPhase?.({ phase: 'context', status: 'completed' })

  input.onPhase?.({ phase: 'draft', status: 'started' })
  const draftResult = await lessonPlanDraftAgent.generate(buildDraftPrompt({
    resourceSnapshot: input.resourceSnapshot,
    durationMinutes: input.durationMinutes,
    mode: input.mode,
    teacherNote: input.teacherNote,
    context: contextResult.object,
    skillsBlock: DRAFT_SKILLS,
  }), {
    structuredOutput: { schema: LessonPlanContentSchema },
  })
  attempts += 1
  addUsage(usage, draftResult)
  input.onPhase?.({ phase: 'draft', status: 'completed' })

  const deterministicIssues = evaluateGeneratedContent(draftResult.object, {
    resourceSnapshot: input.resourceSnapshot,
    durationMinutes: input.durationMinutes,
  })

  input.onPhase?.({ phase: 'review', status: 'started' })
  const reviewResult = await lessonPlanReviewAgent.generate(buildReviewPrompt({
    resourceSnapshot: input.resourceSnapshot,
    durationMinutes: input.durationMinutes,
    draft: draftResult.object,
    deterministicIssues,
    skillsBlock: REVIEW_SKILLS,
  }), {
    structuredOutput: { schema: LessonPlanReviewSchema },
  })
  attempts += 1
  addUsage(usage, reviewResult)
  const review = LessonPlanReviewSchema.parse(reviewResult.object)
  input.onPhase?.({ phase: 'review', status: 'completed' })

  const shouldRefine = review.shouldRefine
    || review.issues.some((issue) => issue.severity === 'HIGH')
    || deterministicIssues.length > 0

  if (!shouldRefine) {
    input.onPhase?.({ phase: 'refine', status: 'skipped', details: 'Refino não necessário.' })
    return {
      content: draftResult.object,
      attempts,
      usage,
    }
  }

  input.onPhase?.({ phase: 'refine', status: 'started' })
  const refineResult = await lessonPlanRefineAgent.generate(buildRefinePrompt({
    resourceSnapshot: input.resourceSnapshot,
    durationMinutes: input.durationMinutes,
    previousDraft: draftResult.object,
    review,
    deterministicIssues,
    skillsBlock: REFINE_SKILLS,
  }), {
    structuredOutput: { schema: LessonPlanContentSchema },
  })
  attempts += 1
  addUsage(usage, refineResult)
  input.onPhase?.({ phase: 'refine', status: 'completed' })

  return {
    content: refineResult.object,
    attempts,
    usage,
  }
}
