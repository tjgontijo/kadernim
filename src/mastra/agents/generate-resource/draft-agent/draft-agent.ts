import { Agent } from '@mastra/core/agent'

function resolveGenerateResourceModel() {
  return `openai/${process.env.GENERATE_RESOURCE_MODEL || process.env.LESSON_PLAN_MODEL || 'gpt-4o'}`
}

export const generateResourceDraftAgent = new Agent({
  id: 'generate-resource-draft-agent',
  name: 'Generate Resource Draft Agent',
  instructions: 'Gere o JSON completo do recurso com base no planejamento e nas skills.',
  model: resolveGenerateResourceModel(),
})
