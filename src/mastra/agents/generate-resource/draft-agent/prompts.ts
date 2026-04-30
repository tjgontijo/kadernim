import type { BnccSkill, PedagogicalPhase } from '@/lib/resource/schemas'
import type { ResourceGenerationContext, SkillGenerationMap } from '@/mastra/agents/generate-resource/shared/schemas'
import type { getBnccSkillByCode } from '@/lib/bncc/services/bncc-service'

type BnccSkillContext = NonNullable<Awaited<ReturnType<typeof getBnccSkillByCode>>>

export function buildGenerateResourceDraftPrompt(input: {
  bnccData: BnccSkillContext
  bnccMetadata: Omit<BnccSkill, 'description'>
  componentName: string
  phase: PedagogicalPhase
  questionCount: number
  context: ResourceGenerationContext
  skillMap: SkillGenerationMap
  skillsBlock: string
}) {
  const { bnccData, bnccMetadata, componentName, phase, questionCount, context, skillMap } = input

  const lines = [
    input.skillsBlock,
    '',
    '# Habilidade BNCC',
    `Código: ${bnccData.code}`,
    `Componente: ${componentName}`,
    `Série: ${bnccData.grade?.name ?? '—'}`,
    bnccData.knowledgeObject ? `Objeto de conhecimento: ${bnccData.knowledgeObject}` : null,
    '',
    '## Descrição da habilidade',
    bnccData.description,
    '',
    bnccData.comments ? `## Comentários pedagógicos\n${bnccData.comments}\n` : null,
    `# Blueprint de páginas — OBRIGATÓRIO gerar exatamente ${context.pageBlueprint.length} páginas`,
    JSON.stringify(context, null, 2),
    '',
    '# REQUISITOS OBRIGATÓRIOS',
    `- Gere EXATAMENTE ${context.pageBlueprint.length} páginas — nem mais, nem menos.`,
    '- TODA página começa com page_header como PRIMEIRO componente.',
    '- TODA página termina com page_footer como ÚLTIMO componente.',
    `- Numere as questões sequencialmente de 1 a ${questionCount}.`,
    `- Fase pedagógica: ${phase}`,
    '',
    '# REDAÇÃO E PROFUNDIDADE PEDAGÓGICA (COPYWRITING - CRÍTICO)',
    '1. PROIBIDO RESUMOS RASOS: O seu papel é ENSINAR. Dê exemplos muito CONCRETOS (ex: culturas, sotaques, comidas, povos específicos). Evite falar apenas "as diferenças são boas". Mostre o porquê.',
    '2. CONTRATO PEDAGÓGICO OBRIGATÓRIO (SKILL MAP):',
    `   - A tese pedagógica da apostila é: "${context.pedagogicalThesis}"`,
    `   - Inclua no material didático (textos ou questões): ${skillMap.mustIncludeInStudentMaterial.join(' | ')}`,
    `   - Use as seguintes situações recomendadas: ${skillMap.recommendedSituations.join(' | ')}`,
    `   - Evite absolutamente: ${skillMap.misconceptionWarnings.join(' | ')}`,
    '3. RIGOR NAS QUESTÕES (Assessment):',
    '   - Para CADA questão, defina o "assessmentTarget", ou seja, qual evidência de aprendizagem específica ela coleta.',
    '   - Múltipla Escolha: Jamais crie alternativas absurdas/óbvias ("Porque não importa"). Faça o aluno pensar.',
    '   - Lacunas (fill_blank): Use apenas UMA lacuna por palavra. Não use traços duplicados.',
    '   - Questões Abertas: SEMPRE dê um "andaime" (scaffolding). Em vez de "Descreva a diversidade", use "Descreva a diversidade pensando em exemplos como comidas, festas, religiões...".',
    '   - Atividades Finais/Planos de Ação: Use o componente "self_assessment" e estruturas claras.',
    '4. AUTOSSUFICIÊNCIA: O aluno DEVE conseguir responder a TODAS as questões usando APENAS as informações e conceitos que você explicou no texto base.',
    '# Formato de saída',
    '{',
    '  "title": string,',
    '  "skill": {',
    `    "code": "${bnccMetadata.code}",`,
    `    "year": ${bnccMetadata.year},`,
    `    "component": "${bnccMetadata.component}",`,
    `    "area": "${bnccMetadata.area}",`,
    '    "description": "<transcreva fielmente a descrição da habilidade BNCC acima>"',
    '  },',
    '  "pages": [{ "pageNumber": number, "components": [...] }],',
    '  "teacherGuide": {',
    '    "answerKey": [',
    '      { "questionNumber": 1, "expectedAnswer": "...", "acceptableVariations": ["..."] }',
    '    ],',
    '    "assessmentNotes": ["Dica 1 para avaliar", "Dica 2..."]',
    '  }',
    '}',
  ]

  return lines.filter((l) => l !== null).join('\n')
}
