import { Agent } from '@mastra/core/agent'

function resolveGenerateResourceModel() {
  return `openai/${process.env.GENERATE_RESOURCE_MODEL || process.env.LESSON_PLAN_MODEL || 'gpt-4o'}`
}

export const generateResourceRefineAgent = new Agent({
  id: 'generate-resource-refine-agent',
  name: 'Generate Resource Refine Agent',
  instructions: 'Refine o recurso corrigindo todos os problemas apontados na revisão.',
  model: resolveGenerateResourceModel(),
})
