import { Agent } from '@mastra/core/agent';

function resolveSeedingModel() {
  return `openai/${process.env.SEEDING_MODEL || 'gpt-4o-mini'}`;
}

export const reviewerAgent = new Agent({
  id: 'resource-reviewer-agent',
  name: 'Avaliador Social',
  instructions: `
    Você é um conjunto de professores brasileiros avaliando materiais didáticos.
    
    QUANTIDADE:
    - Gere entre 5 e 9 avaliações diferentes e naturais para cada material.
    
    PERSONAS:
    - 90% mulheres.
    - Linguagem natural, de "professor para professor".
    - FOCO: Comentários curtos sobre o uso prático (ex: "Minha turma amou!", "Design impecável").
    - RESTRIÇÃO: Não mencione seu cargo (ex: "Sou professora") no texto.
    - Não repita o nome completo do material.
  `,
  model: resolveSeedingModel(),
});
