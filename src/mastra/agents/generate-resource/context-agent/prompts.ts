import type { PedagogicalPhase } from '@/lib/resource/schemas'
import type { getBnccSkillByCode } from '@/lib/bncc/services/bncc-service'
import type { ResourceProposal, SkillGenerationMap } from '@/mastra/agents/generate-resource/shared/schemas'

type BnccSkillContext = NonNullable<Awaited<ReturnType<typeof getBnccSkillByCode>>>

export function buildGenerateResourceContextPrompt(input: {
  bnccData: BnccSkillContext
  skillMap: SkillGenerationMap
  phase: PedagogicalPhase
  questionCount: number
  selectedProposal?: ResourceProposal
  skillsBlock: string
}) {
  const { bnccData, skillMap, phase, questionCount, selectedProposal } = input

  const lines = [
    input.skillsBlock,
    '',
    '# Habilidade BNCC',
    `Código: ${bnccData.code}`,
    `Componente: ${bnccData.subject?.name ?? '—'}`,
    `Série: ${bnccData.grade?.name ?? '—'}`,
    bnccData.unitTheme ? `Tema da unidade: ${bnccData.unitTheme}` : null,
    bnccData.knowledgeObject ? `Objeto de conhecimento: ${bnccData.knowledgeObject}` : null,
    '',
    '## Descrição da habilidade',
    bnccData.description,
    '',
    bnccData.comments ? `## Comentários pedagógicos (BNCC)\n${bnccData.comments}\n` : null,
    bnccData.curriculumSuggestions ? `## Sugestões curriculares (BNCC)\n${bnccData.curriculumSuggestions}\n` : null,
    selectedProposal ? [
      '# Proposta selecionada pelo professor (siga como fio condutor)',
      `Tema: ${selectedProposal.theme}`,
      `Abordagem: ${selectedProposal.approach}`,
      `Resumo: ${selectedProposal.summary}`,
      '',
    ].join('\n') : null,
    '# Tarefa',
    `Planeje um recurso pedagógico impresso para fase ${phase} com exatamente ${questionCount} questões em 2 ou mais páginas.`,
    '',
    '# CONTRATO PEDAGÓGICO (SKILL MAP)',
    'Abaixo está a desconstrução estrita da habilidade gerada pelo Skill Mapper. Você DEVE usar essas diretrizes para montar o Blueprint.',
    `- Verbo Cognitivo: ${skillMap.cognitiveVerb}`,
    `- Conceitos Centrais: ${skillMap.centralConcepts.join(', ')}`,
    `- Relações Obrigatórias: ${skillMap.requiredRelations.join(', ')}`,
    `- Incluir Obrigatoriamente: ${skillMap.mustIncludeInStudentMaterial.join(' | ')}`,
    `- Alertas (Não Fazer): ${skillMap.misconceptionWarnings.join(' | ')}`,
    `- Produção Final: ${skillMap.finalPerformanceTask}`,
    '',
    '# O SEU TRABALHO (BLUEPRINT)',
    'Você deve planejar a distribuição das páginas e definir uma tese pedagógica (`pedagogicalThesis`).',
    'Cada página DEVE ter um `learningStep` claro (contextualizacao, conceituacao, aplicacao, historicidade, producao_final).',
    'Cada página DEVE ter uma lista de `mustInclude` com os conceitos ou relações que serão trabalhados nela.',
    'A última página PODE ter apenas 1 questão (targetQuestionCount=1) SE for a "producao_final" estruturada (ex: com data_table e self_assessment).',
    '',
    '# INTENCIONALIDADE PEDAGÓGICA E BOM SENSO (CRÍTICO)',
    '- Pense como um editor humano genial: Um texto simples e muito bem escrito (gostoso de ler) vale 100x mais do que uma página poluída de caixas e tabelas sem sentido.',
    '- ESTRUTURA IDEAL DE APRENDIZAGEM: Siga a progressão "Conceito → Exemplo Concreto → Situação-Problema → Contexto Histórico/Científico → Ação/Aplicação".',
    '- SITUAÇÃO-PROBLEMA: Sempre inclua um "estudo de caso" ou situação cotidiana (ex: um aluno novo com sotaque diferente) para ancorar a teoria na prática.',
    '- HISTORICIDADE: Não trate os temas apenas como "regras de boa convivência". Dê profundidade (ex: direitos foram conquistados com luta por grupos específicos ao longo do tempo).',
    '- DIVERSIDADE DE FORMATOS: Alterne! Use texto normal para conceitos, "vocabulary_box" para glossários e caixas coloridas para as situações-problema.',
    '- O "Assessment": Evite alternativas óbvias ou bobas nas questões. Faça o aluno pensar.',
    '- Propósito de cada página (Pense na progressão cognitiva do aluno em cada página)',
    '- Componentes ESPECÍFICOS por página (Apenas os estritamente necessários para o ensino)',
    `- Distribuição de questões por página (somatório obrigatório = ${questionCount})`,
  ]

  return lines.filter((l) => l !== null).join('\n')
}
