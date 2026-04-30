import { Agent } from '@mastra/core/agent'

function resolveGenerateResourceModel() {
  return `openai/${process.env.GENERATE_RESOURCE_MODEL || process.env.LESSON_PLAN_MODEL || 'gpt-4o'}`
}

export const generateResourceSkillMapperAgent = new Agent({
  id: 'generate-resource-skill-mapper-agent',
  name: 'generate-resource-skill-mapper-agent',
  instructions:
    'You are a Curriculum Mapper expert. Your job is to deeply deconstruct a BNCC skill and its database metadata into a rigid, structured pedagogical contract (SkillGenerationMap). This map will be the law that all other content generation agents must follow.',
  model: resolveGenerateResourceModel(),
})
