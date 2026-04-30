import type { getBnccSkillByCode } from '@/lib/bncc/services/bncc-service'

type BnccSkillContext = NonNullable<Awaited<ReturnType<typeof getBnccSkillByCode>>>

export function buildGenerateResourceProposalPrompt(input: {
  bnccData: BnccSkillContext
  questionCount: number
}) {
  const { bnccData, questionCount } = input

  const lines = [
    '# Habilidade BNCC',
    `Código: ${bnccData.code}`,
    `Componente: ${bnccData.subject?.name ?? '—'}`,
    `Série: ${bnccData.grade?.name ?? '—'}`,
    bnccData.knowledgeObject ? `Objeto de conhecimento: ${bnccData.knowledgeObject}` : null,
    '',
    '## Descrição da habilidade',
    bnccData.description,
    '',
    bnccData.comments ? `## Comentários pedagógicos\n${bnccData.comments}\n` : null,
    bnccData.curriculumSuggestions ? `## Sugestões curriculares\n${bnccData.curriculumSuggestions}\n` : null,
    '# Tarefa',
    `Proponha 3 abordagens distintas para um recurso pedagógico impresso com ${questionCount} questões sobre esta habilidade BNCC.`,
    '',
    'Cada proposta deve conter:',
    '- **theme**: título criativo e direto que resume a abordagem (máx. 100 caracteres)',
    '- **summary**: o que o recurso vai cobrir, que tipos de atividade terá e qual contexto será usado (máx. 300 caracteres)',
    '- **approach**: rótulo da abordagem pedagógica, ex: "Cotidiana e reflexiva", "Investigativa", "Narrativa e lúdica", "Interdisciplinar" (máx. 100 caracteres)',
    '',
    'As 3 propostas devem ser DISTINTAS entre si — diferentes temas, contextos e abordagens.',
    'Não repita o mesmo ângulo com palavras diferentes.',
  ]

  return lines.filter((l) => l !== null).join('\n')
}
