export function buildQaArchitectPrompt(skills: Array<{
  bnccCode: string
  bnccDescription: string
  bnccSubject: string
  bnccGrade: string
  pedagogicalExplanation?: string
  curriculumGuidance?: string
}>): string {
  const skillsContext = skills.map((p, i) => `
### HABILIDADE ${i + 1}
code: ${p.bnccCode}
component: ${p.bnccSubject}
grade: ${p.bnccGrade}
description: ${p.bnccDescription}
pedagogicalExplanation: ${p.pedagogicalExplanation || 'N/A'}
curriculumGuidance: ${p.curriculumGuidance || 'N/A'}
`).join('\n')

  return [
    '# PAPEL',
    'Você é um arquiteto pedagógico especializado em BNCC e avaliação escolar.',
    '',
    '# OBJETIVO',
    'Transformar as habilidades fornecidas em um mapa pedagógico acionável para geração de questões (MultiSkillGenerationMapSchema).',
    '',
    '# DADOS DAS HABILIDADES',
    skillsContext,
    '',
    '# REGRAS CRÍTICAS',
    '1. NÃO gere questões ainda.',
    '2. NÃO escreva texto narrativo fora do esquema JSON solicitado.',
    '3. Identifique exatamente o que o aluno precisa demonstrar para cada habilidade.',
    '4. Extraia conceitos centrais, situações recomendadas e possíveis equívocos.',
    '5. Dê prioridade à autossuficiência: o mapa deve orientar questões que tragam no enunciado o repertório necessário.',
    '',
    '# CRITÉRIOS DE QUALIDADE',
    '- O mapa deve orientar questões contextualizadas, não perguntas genéricas.',
    '- As relações entre habilidades devem ser pedagogicamente úteis.',
    '- O campo finalPerformanceTask deve indicar uma produção final observável.',
  ].join('\n')
}
