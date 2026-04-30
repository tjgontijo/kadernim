export function buildQaReviewPrompt(input: {
  resourcePlan: unknown
  pedagogicalMap: unknown
  questionCount: number
  allowedComponents: string
}) {
  return [
    '# TAREFA',
    'Revise o material de questões gerado (ResourcePlan).',
    '',
    '# CRITÉRIOS DE AVALIAÇÃO',
    '1. QUANTIDADE: A contagem de questões deve ser exatamente a solicitada.',
    '2. COBERTURA: Todas as habilidades do mapa pedagógico precisam estar cobertas.',
    '3. AUTOSSUFICIÊNCIA: Cada questão deve fornecer contexto suficiente para ser respondida.',
    '4. COMPONENTES: Somente componentes permitidos pelo catálogo devem ser usados.',
    '5. DISTRATORES: Questões objetivas devem ter alternativas plausíveis.',
    '6. ANDAIME: Questões abertas devem ter instruções claras e espaço/suporte adequado.',
    '7. LINGUAGEM: Deve ser adequada à faixa etária (fase escolar).',
    '',
    '# QUANTIDADE ESPERADA',
    String(input.questionCount),
    '',
    '# COMPONENTES PERMITIDOS',
    input.allowedComponents,
    '',
    '# MAPA PEDAGÓGICO DE REFERÊNCIA',
    JSON.stringify(input.pedagogicalMap, null, 2),
    '',
    '# MATERIAL GERADO PARA REVISÃO',
    JSON.stringify(input.resourcePlan, null, 2),
    '',
    '# SAÍDA',
    'Retorne o objeto ResourceGenerationReviewSchema detalhando os problemas encontrados.',
  ].join('\n')
}
