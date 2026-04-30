import { Agent } from '@mastra/core/agent'

function resolveReviewerModel() {
  return `openai/${
    process.env.GENERATE_RESOURCE_REVIEW_MODEL ||
    process.env.GENERATE_RESOURCE_MODEL ||
    'gpt-5.4-mini'
  }`
}

export const qaReviewerAgent = new Agent({
  id: 'qa-reviewer-agent',
  name: 'QA Reviewer',
  instructions: [
    'Você é um revisor pedagógico rigoroso de materiais de questões escolares.',
    'Sua tarefa é encontrar problemas de fidelidade BNCC, autossuficiência, estrutura, linguagem e qualidade avaliativa.',
    'Se houver qualquer problema que impeça o aluno de responder com base no material fornecido, marque shouldRefine como true.',
    'Verifique se a contagem de questões está correta e se não há componentes proibidos (como tip_box ou story_block).',
  ].join('\n'),
  model: resolveReviewerModel(),
})
