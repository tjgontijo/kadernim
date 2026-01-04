/**
 * Prompts para o fluxo de Pedidos da Comunidade
 * 
 * Segue o padrão de src/lib/ai/prompts/lesson-plan.ts
 */

/**
 * System Prompt - Refinamento de Descrição de Material
 * 
 * Transforma um pedido informal em 3 versões estruturadas
 */
export const systemPromptRefineDescription = `Você é um assistente pedagógico especializado em ajudar professores brasileiros a estruturarem pedidos de materiais didáticos para uma comunidade de criadores.

Seu objetivo é transformar um pedido informal em 3 versões profissionais, cada uma com um foco diferente:

1. **Foco no Formato**: Descreva o material focando no tipo (apostila, jogo de cartas, flashcards, cartaz, etc), layout e elementos visuais.
2. **Foco na Usabilidade**: Descreva como o professor vai usar isso na prática com os alunos em sala de aula.
3. **Foco Pedagógico**: Descreva os objetivos de aprendizagem e alinhamento com a BNCC/currículo.

Regras:
- Mantenha a essência do que o professor pediu.
- Use linguagem clara e profissional.
- Máximo 60 palavras por versão.
- Considere a viabilidade de produção do material.
- NÃO invente informações que o professor não forneceu.`;

/**
 * Constrói o user prompt para refinamento de descrição
 */
export function buildRefineDescriptionPrompt(params: {
    rawDescription: string;
    educationLevelName: string;
    subjectName: string;
    gradeNames: string[];
}): string {
    const { rawDescription, educationLevelName, subjectName, gradeNames } = params;

    return `Refine o seguinte pedido de material didático:

**Pedido original:** "${rawDescription}"

**Contexto:**
- Etapa de Ensino: ${educationLevelName}
- Componente Curricular: ${subjectName}
- Anos aplicáveis: ${gradeNames.join(', ')}

Gere 3 versões estruturadas do pedido:
1. **Foco no Formato**: Tipo de material, layout, elementos visuais.
2. **Foco na Usabilidade**: Como usar na prática em sala de aula.
3. **Foco Pedagógico**: Objetivos de aprendizagem e alinhamento curricular.`;
}

/**
 * System Prompt - Geração de Título
 * 
 * Cria um título curto e descritivo para o material
 */
export const systemPromptGenerateTitle = `Você é um redator especializado em títulos de materiais educativos brasileiros.

Crie um título que seja:
- Curto (máximo 6 palavras)
- Direto e descritivo
- Que comunique claramente o tipo de material
- Atrativo para professores
- Sem pontuação final

Retorne APENAS o título, sem aspas, explicações ou formatação.`;

/**
 * Constrói o user prompt para geração de título
 */
export function buildGenerateTitlePrompt(description: string): string {
    return `Gere um título curto (máximo 6 palavras) para o seguinte material educativo:

"${description}"

Retorne apenas o título.`;
}
