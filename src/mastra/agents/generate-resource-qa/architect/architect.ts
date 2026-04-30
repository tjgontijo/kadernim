import { Agent } from '@mastra/core/agent'

function resolveArchitectModel() {
  return `openai/${
    process.env.GENERATE_RESOURCE_ARCHITECT_MODEL ||
    process.env.GENERATE_RESOURCE_MODEL ||
    'gpt-5.4-mini'
  }`
}

export const qaArchitectAgent = new Agent({
  id: 'qa-architect-agent',
  name: 'QA Architect',
  instructions:
    'Você é um Especialista em Currículo e BNCC focado em avaliação. Sua tarefa é analisar habilidades e criar um mapa pedagógico estruturado (MultiSkillGenerationMapSchema) que servirá de guia para a criação de questões de alta qualidade.',
  model: resolveArchitectModel(),
})
