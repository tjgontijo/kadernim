import type { BnccSkillDetail } from '@/lib/schemas/lesson-plan';

/**
 * System Prompt - Especialista em Pedagogia BNCC
 *
 * Define o papel e expertise da IA
 */
export const systemPrompt = `Você é um especialista em pedagogia brasileira com profundo conhecimento da BNCC (Base Nacional Comum Curricular).

Sua missão é criar planos de aula de alta qualidade, pedagogicamente sólidos e alinhados às habilidades BNCC fornecidas.

## Princípios pedagógicos que você segue:

1. **Alinhamento BNCC**: Cada atividade deve desenvolver diretamente as habilidades selecionadas
2. **Metodologias ativas**: Priorize aprendizagem por investigação, problematização e protagonismo do estudante
3. **Diferenciação**: Sempre sugira adaptações para estudantes com diferentes ritmos de aprendizagem
4. **Contextualização**: Use exemplos da realidade dos estudantes brasileiros
5. **Avaliação formativa**: Foque no processo de aprendizagem, não apenas no produto final
6. **Sequência didática**: Organize atividades com início (motivação), meio (desenvolvimento) e fim (consolidação)

## Estrutura que você deve seguir:

- **Objetivos**: Claros, mensuráveis, iniciando com verbos de ação (identificar, compreender, aplicar...)
- **Metodologia**: Detalhada o suficiente para um professor executar sem dúvidas
- **Recursos**: Realistas e acessíveis para escolas públicas brasileiras
- **Avaliação**: Diversificada (observação, registro, produção, autoavaliação)

## Tom e linguagem:

- Profissional, mas acessível
- Direto e prático
- Evite jargões pedagógicos excessivos
- Use português brasileiro formal

## Importante:

- NÃO invente habilidades BNCC além das fornecidas
- NÃO crie atividades genéricas - sejam específicas ao tema
- NÃO esqueça de adaptar para a faixa etária (Educação Infantil é lúdica, Fundamental é mais estruturado)`;

/**
 * Constrói o prompt do usuário com contexto completo
 */
export function buildUserPrompt(params: {
  title: string;
  educationLevelSlug: string;
  gradeSlug?: string;
  subjectSlug?: string;
  ageRange?: string;
  fieldOfExperience?: string;
  numberOfClasses: number;
  bnccSkills: BnccSkillDetail[];
}): string {
  const {
    title,
    educationLevelSlug,
    gradeSlug,
    subjectSlug,
    ageRange,
    fieldOfExperience,
    numberOfClasses,
    bnccSkills,
  } = params;

  // Detectar se é Educação Infantil ou Ensino Fundamental
  const isEI = educationLevelSlug === 'educacao-infantil';

  // Formatar contexto pedagógico
  let context = '';
  if (isEI) {
    context = `**Educação Infantil**
- Faixa etária: ${ageRange || 'Não especificado'}
- Campo de experiência: ${fieldOfExperience || 'Não especificado'}`;
  } else {
    context = `**Ensino Fundamental**
- Ano: ${gradeSlug || 'Não especificado'}
- Componente curricular: ${subjectSlug || 'Não especificado'}`;
  }

  // Formatar habilidades BNCC
  const skillsFormatted = bnccSkills
    .map((skill, index) => {
      let skillText = `${index + 1}. **${skill.code}**
   Descrição: ${skill.description}`;

      if (skill.unitTheme) {
        skillText += `\n   Unidade temática: ${skill.unitTheme}`;
      }
      if (skill.knowledgeObject) {
        skillText += `\n   Objeto de conhecimento: ${skill.knowledgeObject}`;
      }
      if (skill.fieldOfExperience) {
        skillText += `\n   Campo de experiência: ${skill.fieldOfExperience}`;
      }

      return skillText;
    })
    .join('\n\n');

  // Calcular duração total
  const durationMinutes = numberOfClasses * 50;

  // Montar prompt final
  return `Crie um plano de aula completo com as seguintes características:

## Tema
"${title}"

## Contexto
${context}

## Duração
${numberOfClasses} aula(s) de 50 minutos cada = ${durationMinutes} minutos totais

## Habilidades BNCC a desenvolver
${skillsFormatted}

---

**Instruções específicas:**

${
  isEI
    ? `- Como é Educação Infantil, use linguagem lúdica e atividades práticas/concretas
- Priorize brincadeiras, jogos, experimentação e expressão
- Não use avaliação formal - foque em observação e registro
- Sugira materiais simples e manipuláveis`
    : `- Como é Ensino Fundamental, estruture com início, desenvolvimento e conclusão claros
- Inclua momentos de explicação, prática guiada e prática independente
- Sugira atividades escritas e/ou práticas adequadas à idade
- Inclua critérios de avaliação mensuráveis`
}

- Seja específico nas atividades (não apenas "discutir o tema", mas "perguntar X, Y, Z")
- Sugira perguntas-chave para estimular o pensamento crítico
- Inclua adaptações para estudantes com dificuldades
- Use recursos acessíveis (não presuma tecnologia avançada)

Gere o plano completo seguindo a estrutura JSON fornecida.`;
}
