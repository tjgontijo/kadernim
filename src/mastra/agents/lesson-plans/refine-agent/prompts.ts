import type { LessonPlanContent, ResourceSnapshot } from '@/lib/lesson-plans/schemas'
import { buildResourceSnapshotBlock } from '@/mastra/agents/lesson-plans/context-agent/prompts'

export function buildRefinePrompt(input: {
  resourceSnapshot: ResourceSnapshot
  durationMinutes: number
  previousDraft: LessonPlanContent
  review: { fixBrief: string; issues: Array<{ severity: 'HIGH' | 'MEDIUM' | 'LOW'; message: string }> }
  deterministicIssues: string[]
  skillsBlock: string
}) {
  const deterministic = input.deterministicIssues.length > 0
    ? input.deterministicIssues.map((issue, i) => `${i + 1}. ${issue}`).join('\n')
    : 'Nenhum'
  return `${input.skillsBlock}\n\n${buildResourceSnapshotBlock(input.resourceSnapshot)}\n\nDuracao alvo: ${input.durationMinutes} min\n\nPlano atual:\n${JSON.stringify(input.previousDraft)}\n\nRevisao:\n- fixBrief: ${input.review.fixBrief}\n- issues: ${JSON.stringify(input.review.issues)}\n\nDeterministicIssues:\n${deterministic}`
}
