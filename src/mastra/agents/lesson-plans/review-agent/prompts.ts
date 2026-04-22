import type { LessonPlanContent, ResourceSnapshot } from '@/lib/lesson-plans/schemas'
import { buildResourceSnapshotBlock } from '@/mastra/agents/lesson-plans/context-agent/prompts'

export function buildReviewPrompt(input: {
  resourceSnapshot: ResourceSnapshot
  durationMinutes: number
  draft: LessonPlanContent
  deterministicIssues: string[]
  skillsBlock: string
}) {
  const deterministic = input.deterministicIssues.length > 0
    ? input.deterministicIssues.map((issue, i) => `${i + 1}. ${issue}`).join('\n')
    : 'Nenhum'
  return `${input.skillsBlock}\n\n${buildResourceSnapshotBlock(input.resourceSnapshot)}\n\nDuracao alvo: ${input.durationMinutes} min\n\nPlano:\n${JSON.stringify(input.draft)}\n\nDeterministicIssues:\n${deterministic}`
}
