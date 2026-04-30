import { generateResourceContent, generateResourceProposalsContent } from '@/mastra/agents/generate-resource/orchestrators/generate-resource-content'
import type { ResourcePlan } from './schemas'
import type { ResourceProposal } from '@/mastra/agents/generate-resource/shared/schemas'

export async function generateResourcePlan(
  bnccCode: string,
  questionCount?: number,
  selectedProposal?: ResourceProposal,
): Promise<ResourcePlan> {
  return generateResourceContent(bnccCode, questionCount, selectedProposal)
}

export async function generateResourceProposals(
  bnccCode: string,
  questionCount: number,
) {
  return generateResourceProposalsContent(bnccCode, questionCount)
}

// Backward-compatible alias (legacy name)
export async function generateApostila(
  bnccCode: string,
  questionCount?: number,
): Promise<ResourcePlan> {
  return generateResourcePlan(bnccCode, questionCount)
}
