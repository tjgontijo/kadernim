import { Agent } from '@mastra/core/agent'

function resolveArtisanModel() {
  return `openai/${
    process.env.GENERATE_RESOURCE_ARTISAN_MODEL ||
    process.env.GENERATE_RESOURCE_MODEL ||
    'gpt-5.4'
  }`
}

export const qaArtisanAgent = new Agent({
  id: 'qa-artisan-agent',
  name: 'QA Artisan',
  instructions: 'Você é o Master Artisan. Sua missão é escrever questões de alta qualidade pedagógica, ricas em contexto e 100% focadas na avaliação do aluno.',
  model: resolveArtisanModel(),
})
