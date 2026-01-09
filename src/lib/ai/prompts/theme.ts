/**
 * Prompts para geração e refinamento de temas de planos de aula (MVP)
 * Foco: segurança, simplicidade e tom escolar
 */

/**
 * SYSTEM PROMPT – GERAÇÃO DE TEMA BASE
 */
export const themeSystemPrompt = `Você é um professor brasileiro experiente.
Sua tarefa é criar um TÍTULO/TEMA simples e claro para um plano de aula.

REGRAS OBRIGATÓRIAS:
1. Sempre em PORTUGUÊS BRASILEIRO (nunca inglês!)
2. Máximo de 50 caracteres
3. Linguagem simples, como uma professora falaria
4. Frase nominal curta (sem verbos)
5. Relacionado diretamente à habilidade BNCC
6. Sem jargões, metáforas ou termos rebuscados
7. Nível de criatividade: BAIXO. Prefira títulos escolares comuns.

PRIORIDADE PEDAGÓGICA:
- A habilidade BNCC é a principal referência.
- Use intentRaw apenas como apoio, nunca como tema isolado.

PADRÃO RECOMENDADO:
- [conceito central da habilidade] + [contexto simples]
Exemplo: "Empatia e líderes religiosos"

EXEMPLOS BONS:
- "Frações no dia a dia"
- "Respeito às diferenças"
- "O ciclo da água"
- "Brincadeiras brasileiras"
- "Números pares e ímpares"
- "Histórias do meu bairro"

EXEMPLOS RUINS (NÃO FAÇA ISSO):
- "Voices of Change" (inglês)
- "Explorando a Interdimensionalidade..." (rebuscado)
- "Identificar e compreender..." (verbo)
- "EF03MA09" (código)
- "Plano de aula sobre..." (genérico)
- Títulos com tom publicitário ou slogan`;

/**
 * PARAMS – GERAÇÃO DE TEMA
 */
export interface ThemePromptParams {
    educationLevelSlug?: string;
    gradeSlug?: string;
    subjectSlug?: string;
    mainSkillCode: string;
    mainSkillDescription: string;
    intentRaw?: string;
}

/**
 * USER PROMPT – GERAÇÃO DE TEMA BASE
 */
export function buildThemeUserPrompt(params: ThemePromptParams): string {
    const {
        educationLevelSlug,
        gradeSlug,
        subjectSlug,
        mainSkillCode,
        mainSkillDescription,
        intentRaw,
    } = params;

    return `Contexto do plano de aula:
- Etapa de ensino: ${educationLevelSlug || 'não especificado'}
- Ano/Faixa: ${gradeSlug || 'não especificado'}
- Disciplina/Campo: ${subjectSlug?.replace(/-/g, ' ') || 'não especificado'}
- Habilidade BNCC: ${mainSkillCode} - ${mainSkillDescription}
${intentRaw ? `- Intenção do professor (apoio): "${intentRaw}"` : ''}

Crie UM único tema curto, simples e escolar.
Retorne APENAS o tema, sem aspas, sem listas, sem explicações.`;
}

/**
 * ======================================================
 * REFINAMENTO DE TEMA (OPCIONAL – APÓS TEMA BASE)
 * ======================================================
 */

/**
 * SYSTEM PROMPT – REFINAMENTO
 */
export function getRefineSystemPrompt(isEI: boolean): string {
    if (isEI) {
        return `Você é um especialista em Educação Infantil brasileira.
Sua tarefa é refinar temas de aulas em experiências pedagógicas adequadas à Educação Infantil.

REGRAS OBRIGATÓRIAS:
1. Sempre em PORTUGUÊS BRASILEIRO
2. Linguagem do brincar, interagir e explorar
3. Evite termos formais ou acadêmicos
4. Alinhe aos Campos de Experiência da BNCC
5. Linguagem lúdica, simples e acessível
6. Evite slogans ou tom publicitário`;
    }

    return `Você é um especialista em Ensino Fundamental brasileiro.
Sua tarefa é refinar temas de aulas em temas pedagógicos claros e escolares.

REGRAS OBRIGATÓRIAS:
1. Sempre em PORTUGUÊS BRASILEIRO
2. Linguagem escolar clara e objetiva
3. Alinhamento com os Objetos de Conhecimento da BNCC
4. Evite tom publicitário, slogans ou metáforas
5. Priorize clareza sobre criatividade`;
}

/**
 * PARAMS – REFINAMENTO
 */
export interface RefineThemeParams {
    rawTheme: string;
    educationLevelSlug: string;
    gradeSlug: string;
    subjectSlug: string;
}

/**
 * USER PROMPT – REFINAMENTO
 */
export function buildRefineUserPrompt(params: RefineThemeParams): string {
    const { rawTheme, educationLevelSlug, gradeSlug, subjectSlug } = params;

    const levelNames: Record<string, string> = {
        'educacao-infantil': 'Educação Infantil',
        'ensino-fundamental-1': 'Ensino Fundamental I',
        'ensino-fundamental-2': 'Ensino Fundamental II',
        'ensino-medio': 'Ensino Médio',
    };

    const isEI = educationLevelSlug === 'educacao-infantil';
    const levelName = levelNames[educationLevelSlug] || educationLevelSlug;
    const contextLabel = isEI ? 'Faixa Etária' : 'Ano/Série';
    const subjectLabel = isEI ? 'Campo de Experiência' : 'Componente Curricular';

    return `Refine o tema de aula abaixo, mantendo tom escolar e clareza pedagógica.

Tema original:
"${rawTheme}"

Contexto:
- Nível de ensino: ${levelName}
- ${contextLabel}: ${gradeSlug?.replace(/-/g, ' ')}
- ${subjectLabel}: ${subjectSlug?.replace(/-/g, ' ')}

Gere 3 versões refinadas, sempre em PORTUGUÊS:
1. Curta – objetiva (máximo 6 palavras)
2. Média – com contexto pedagógico (máximo 15 palavras)
3. Longa – descritiva e alinhada à BNCC (máximo 25 palavras)

Evite slogans, metáforas e tom publicitário.`;
}
