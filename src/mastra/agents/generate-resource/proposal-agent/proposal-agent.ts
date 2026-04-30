import { Agent } from '@mastra/core/agent'

function resolveGenerateResourceModel() {
  return `openai/${process.env.GENERATE_RESOURCE_MODEL || process.env.LESSON_PLAN_MODEL || 'gpt-4o-mini'}`
}

export const generateResourceProposalAgent = new Agent({
  id: 'generate-resource-proposal-agent',
  name: 'Generate Resource Proposal Agent',
  instructions: 'Gere 3 propostas distintas de abordagem pedagógica para um recurso impresso, com base na habilidade BNCC fornecida.',
  model: resolveGenerateResourceModel(),
})
