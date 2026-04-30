export function buildSkillMapperPrompt(p: {
  bnccCode: string
  bnccDescription: string
  bnccSubject: string
  bnccGrade: string
  pedagogicalExplanation?: string
  curriculumGuidance?: string
}): string {
  return [
    '# MAPEAMENTO PEDAGÓGICO DE HABILIDADE (CONTRATO DIDÁTICO)',
    'Você é o Skill Pedagogical Mapper. Sua função é receber os dados da BNCC (e suas orientações curriculares) e transformar isso em uma matriz estruturada que será usada por outros agentes para gerar uma apostila.',
    '',
    '## DADOS DA HABILIDADE',
    `- Código: ${p.bnccCode}`,
    `- Componente: ${p.bnccSubject}`,
    `- Ano: ${p.bnccGrade}`,
    `- Descrição BNCC: ${p.bnccDescription}`,
    ...(p.pedagogicalExplanation ? [`- Explicação Pedagógica: ${p.pedagogicalExplanation}`] : []),
    ...(p.curriculumGuidance ? [`- Orientação Curricular: ${p.curriculumGuidance}`] : []),
    '',
    '## INSTRUÇÕES DE MAPEAMENTO',
    'Preencha o SkillGenerationMapSchema extraindo e estruturando esses dados.',
    '1. cognitiveVerb: Qual é o verbo principal da habilidade? (Ex: associar, identificar, analisar).',
    '2. centralConcepts: Quais são os 2 ou 3 conceitos principais? (Ex: cidadania, direitos).',
    '3. requiredRelations: Quais relações o aluno DEVE fazer? (Ex: relacionar diversidade com direitos humanos).',
    '4. mustIncludeInStudentMaterial: O que é OBRIGATÓRIO ter no material do aluno? (Extraia das orientações. Ex: "Situação de convivência escolar").',
    '5. recommendedSituations: Exemplos práticos recomendados pelas orientações (Ex: "diferenças de religião", "pessoas com deficiência").',
    '6. misconceptionWarnings: O que NÃO fazer ou que ideia errada evitar? (Ex: "Não tratar respeito apenas como bondade, mas como responsabilidade").',
    '7. finalPerformanceTask: A atividade de produção ideal para fechar o material.',
    '8. assessmentEvidence: 3 a 5 frases mostrando o que evidencia que o aluno aprendeu.',
  ].join('\n')
}
