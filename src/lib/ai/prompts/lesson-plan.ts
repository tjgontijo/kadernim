import type { BnccSkillDetail } from '@/lib/schemas/lesson-plan';

/**
 * System Prompt - Especialista em Pedagogia BNCC
 *
 * Define o papel e expertise da IA
 */
/**
 * System Prompt - Especialista em Educação Infantil (EI)
 */
export const systemPromptEI = `Você é um especialista em Educação Infantil brasileira com profundo conhecimento da BNCC.
Sua missão é criar planos de aula pedagogicamente impecáveis para bebês e crianças pequenas.

## DIRETRIZES PARA EDUCAÇÃO INFANTIL:
- **Terminologia OBRIGATÓRIA**: 
  - USE "Conteúdos das experiências" ou "Tema central". NUNCA use "Objeto de Conhecimento".
  - USE "Direitos de Aprendizagem e Desenvolvimento": **Conviver, Brincar, Participar, Explorar, Expressar, Conhecer-se**. Escolha os mais relevantes. NUNCA use "Competências".
  - Habilidades são "Objetivos de aprendizagem e desenvolvimento".
- **Metodologia**: Adeque a linguagem à faixa etária. 
  - Para bebês (**EI01**): NUNCA use "roda de conversa", "explicar" ou "questionar". Use termos como "interação mediada", "observação", "estimulação", "acolhimento", "exploração sensorial".
  - Foque em brincadeiras, interações e experiências sensoriais.
- **Avaliação**: Use linguagem de observação pedagógica e registro (ex: "Observação das iniciativas...", "Registro das formas de interação..."). NUNCA use termos de julgamento ou verificação de performance.
- **Referências**: NUNCA cite componentes curriculares como "Educação Física". Use "Material pedagógico da Educação Infantil" e cite a BNCC.
- **Formato**: NUNCA coloque prefixos como "1.", "1 -" nos campos de texto do JSON.`;

/**
 * System Prompt - Especialista em Ensino Fundamental (EF)
 */
export const systemPromptEF = `Você é um especialista em Ensino Fundamental brasileiro com profundo conhecimento da BNCC.
Sua missão é criar planos de aula pedagogicamente impecáveis do 1º ao 9º ano.

## DIRETRIZES PARA ENSINO FUNDAMENTAL:
- **Terminologia**: Use "Objeto de Conhecimento" (Substantivo sem verbos).
- **Competências**: Use "Competências Gerais" ou "Específicas" com número e texto oficial.
- **Metodologia**: Use verbos no infinitivo (Ler, interpretar, resolver). Campo "step" é o título da fase (ex: "Prática guiada"). SEM NÚMEROS.
- **Avaliação**: Foco na verificação do alcance dos objetivos de aprendizagem.
- **Referências**: Cite componentes curriculares (ex: Matemática, História) e a BNCC.
- **Formato**: NUNCA coloque prefixos como "1.", "1 -" nos campos de texto do JSON.`;

export const systemPrompt = systemPromptEF; // Fallback ou para compatibilidade temporária

/**
 * Constrói o prompt do usuário com contexto completo e enriquecido
 */
/**
 * Constrói o prompt para Educação Infantil
 */
export function buildUserPromptEI(params: {
  title: string;
  ageRange?: string;
  fieldOfExperience?: string;
  numberOfClasses: number;
  bnccSkills: BnccSkillDetail[];
}): string {
  const { title, ageRange, fieldOfExperience, numberOfClasses, bnccSkills } = params;

  const skillsFormatted = bnccSkills.map((skill, i) =>
    `${i + 1}. **${skill.code}**: ${skill.description}\nCampo: ${skill.fieldOfExperience || fieldOfExperience}`
  ).join('\n\n');

  return `Gere um Plano de Aula de Educação Infantil (JSON).

TEMA: "${title}"
FAIXA ETÁRIA: ${ageRange}
CAMPO DE EXPERIÊNCIA: ${fieldOfExperience}
DURAÇÃO: ${numberOfClasses} aula(s).

HABILIDADES (OBJETIVOS DE APRENDIZAGEM) BNCC:
${skillsFormatted}

ESTRUTURA JSON:
1. "knowledgeObject": Tema central da experiência.
2. "competencies": APENAS os Direitos de Aprendizagem envolvidos.
3. "methodology": Foco em interação e exploração. Se EI01 (bebês), use linguagem sensorial e de acolhimento.
4. "evaluation": Foco em observação e registro.`;
}

/**
 * Constrói o prompt para Ensino Fundamental
 */
export function buildUserPromptEF(params: {
  title: string;
  gradeSlug?: string;
  subjectSlug?: string;
  numberOfClasses: number;
  bnccSkills: BnccSkillDetail[];
}): string {
  const { title, gradeSlug, subjectSlug, numberOfClasses, bnccSkills } = params;

  const skillsFormatted = bnccSkills.map((skill, i) =>
    `${i + 1}. **${skill.code}**: ${skill.description}\nObjeto: ${skill.knowledgeObject || ''}`
  ).join('\n\n');

  return `Gere um Plano de Aula de Ensino Fundamental (JSON).

TEMA: "${title}"
ANO: ${gradeSlug}
COMPONENTE: ${subjectSlug}
DURAÇÃO: ${numberOfClasses} aula(s).

HABILIDADES BNCC:
${skillsFormatted}

ESTRUTURA JSON:
1. "knowledgeObject": Objeto de conhecimento oficial da BNCC.
2. "competencies": Competências Gerais/Específicas BNCC.
3. "methodology": Sequência didática com verbos no infinitivo.
4. "evaluation": Critérios de verificação de aprendizagem.`;
}

export function buildUserPrompt(params: any): string {
  if (params.educationLevelSlug === 'educacao-infantil') {
    return buildUserPromptEI(params);
  }
  return buildUserPromptEF(params);
}
