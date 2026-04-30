import { Agent } from '@mastra/core/agent'

function resolveGenerateResourceModel() {
  return `openai/${process.env.GENERATE_RESOURCE_MODEL || process.env.LESSON_PLAN_MODEL || 'gpt-4o'}`
}

export const generateResourceReviewAgent = new Agent({
  id: 'generate-resource-review-agent',
  name: 'Generate Resource Review Agent',
  instructions: 'Revise o recurso gerado e aponte se precisa de refinamento.',
  model: resolveGenerateResourceModel(),
})
