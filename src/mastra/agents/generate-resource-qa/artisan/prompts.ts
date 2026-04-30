import type { PedagogicalPhase } from '@/lib/resource/schemas'
import type { MultiSkillGenerationMap } from '../shared/schemas'

export function buildQaArtisanPrompt(input: {
  skills: Array<any>
  phase: PedagogicalPhase
  questionCount: number
  pedagogicalMap: MultiSkillGenerationMap
  skillsBlock: string
}) {
  const { skills, phase, questionCount, pedagogicalMap } = input

  const skillsContext = skills.map(s => `
### ${s.code}
Descrição: ${s.description}
Componente: ${s.subject?.name || 'N/A'}
Ano: ${s.grade?.name || 'N/A'}
Explicação pedagógica: ${s.pedagogicalExplanation || 'N/A'}
Orientação curricular: ${s.curriculumGuidance || 'N/A'}
`).join('\n')

  return [
    input.skillsBlock,
    '',
    '# PAPEL',
    'Você é um designer de questões pedagógicas para materiais escolares impressos (Master Artisan).',
    '',
    '# OBJETIVO',
    `Gerar exatamente ${questionCount} questões para a fase ${phase} (ResourcePlanSchema).`,
    '',
    '# HABILIDADES BNCC',
    skillsContext,
    '',
    '# MAPA PEDAGÓGICO ESTRUTURADO',
    JSON.stringify(pedagogicalMap, null, 2),
    '',
    '# REGRAS CRÍTICAS',
    '1. Gere APENAS componentes permitidos pelo catálogo.',
    '2. Cada questão deve avaliar uma habilidade BNCC de forma explícita.',
    '3. AUTOSSUFICIÊNCIA: O aluno deve conseguir responder usando apenas o enunciado e os dados nele contidos.',
    '4. Não use perguntas genéricas ou alternativas absurdas.',
    '5. FLUXO CONTÍNUO: Coloque TODAS as questões em uma única "page" (Page 1). O motor de layout irá paginar automaticamente de forma densa.',
    '6. TEMPLATES ESTRUTURAIS: Inclua exatamente UM page_header no início da lista e UM page_footer no final da lista da Page 1. Eles serão replicados pelo sistema.',
    '',
    '# PADRÃO DE QUALIDADE DOS ENUNCIADOS',
    'Cada enunciado deve ser DIRETO e CONCISO (máximo 4 linhas).',
    'Deve conter: situação-problema curta, o verbo da habilidade e instrução clara.',
    'NUNCA encerre o enunciado de forma abrupta. Termine sempre a frase completa.',
    'Gere questões completas e bem estruturadas.',
    '',
    '# SAÍDA',
    'Retorne somente o objeto ResourcePlan compatível com o schema informado.',
  ].join('\n')
}

export function buildQaRefinementPrompt(input: {
  originalPlan: unknown
  review: unknown
  pedagogicalMap: unknown
  questionCount: number
  phase: PedagogicalPhase
  skills: Array<any>
  skillsBlock: string
}) {
  return [
    input.skillsBlock,
    '',
    '# TAREFA',
    'Corrija o material com base na revisão pedagógica recebida.',
    '',
    '# REGRAS',
    `1. A versão corrigida deve ter exatamente ${input.questionCount} questões.`,
    '2. Corrija todos os problemas de severidade HIGH e MEDIUM.',
    '3. Preserve as questões que já estão boas.',
    '4. Não adicione componentes fora do catálogo permitido.',
    '5. FLUXO CONTÍNUO: Mantenha tudo na "Page 1" para que o sistema pagine automaticamente.',
    '6. TEMPLATE: Garanta que haja UM page_header no início e UM page_footer no final da Page 1.',
    '',
    '# MAPA PEDAGÓGICO',
    JSON.stringify(input.pedagogicalMap, null, 2),
    '',
    '# REVISÃO RECEBIDA',
    JSON.stringify(input.review, null, 2),
    '',
    '# MATERIAL ORIGINAL',
    JSON.stringify(input.originalPlan, null, 2),
  ].join('\n')
}
