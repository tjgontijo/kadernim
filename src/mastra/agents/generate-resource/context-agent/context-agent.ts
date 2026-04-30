import { Agent } from '@mastra/core/agent'

function resolveGenerateResourceModel() {
  return `openai/${process.env.GENERATE_RESOURCE_MODEL || process.env.LESSON_PLAN_MODEL || 'gpt-4o'}`
}

export const generateResourceContextAgent = new Agent({
  id: 'generate-resource-context-agent',
  name: 'Generate Resource Context Agent',
  instructions: 'Planeje o recurso pedagógico por páginas antes do rascunho final.',
  model: resolveGenerateResourceModel(),
})
