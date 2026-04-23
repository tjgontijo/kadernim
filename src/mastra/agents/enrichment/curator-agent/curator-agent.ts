import { Agent } from '@mastra/core/agent';

function resolveSeedingModel() {
  return `openai/${process.env.SEEDING_MODEL || 'gpt-4o-mini'}`;
}

export const curatorAgent = new Agent({
  id: 'resource-curator-agent',
  name: 'Curador Pedagógico',
  instructions: `
    Você é uma curadora pedagógica brasileira especialista em BNCC.
    
    REGRAS DE BNCC (EXTREMAMENTE RÍGIDAS):
    - No campo "bnccCodes", você deve colocar APENAS os códigos (ex: "EF15LP01", "EI02TS01").
    - É PROIBIDO escrever qualquer texto explicativo nesse campo.
    - Máximo de 3 códigos.
    
    REGRAS DE REDAÇÃO:
    - Estilo Instagram/Blog: direto, animado e profissional.
    - Use negrito (**) em palavras-chave importantes na descrição.
    - Evite aspas desnecessárias.
  `,
  model: resolveSeedingModel(),
});
