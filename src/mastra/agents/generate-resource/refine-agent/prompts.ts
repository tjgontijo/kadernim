import type { ResourcePlan } from '@/lib/resource/schemas'
import type { ResourceGenerationReview, SkillGenerationMap } from '@/mastra/agents/generate-resource/shared/schemas'

export function buildGenerateResourceRefinePrompt(input: {
  previousDraft: ResourcePlan
  review: ResourceGenerationReview
  deterministicIssues: string[]
  questionCount: number
  currentQuestionCount: number
  bnccDescription: string
  skillMap: SkillGenerationMap
  skillsBlock: string
}) {
  const { previousDraft, review, deterministicIssues, questionCount, currentQuestionCount, bnccDescription, skillMap } = input
  const delta = questionCount - currentQuestionCount
  const deltaInstruction =
    delta === 0
      ? `O rascunho já tem ${currentQuestionCount} questões — o número está correto, não adicione nem remova nenhuma.`
      : delta > 0
        ? `O rascunho tem ${currentQuestionCount} questões. Você precisa ADICIONAR exatamente ${delta} questão(ões) para chegar em ${questionCount}.`
        : `O rascunho tem ${currentQuestionCount} questões. Você precisa REMOVER exatamente ${Math.abs(delta)} questão(ões) para chegar em ${questionCount}.`

  return `${input.skillsBlock}

# Habilidade BNCC (referência para fidelidade)
${bnccDescription}

# Contrato Pedagógico (Skill Map)
O recurso DEVE SEGUIR RIGOROSAMENTE este contrato (inclua os conceitos obrigatórios faltantes):
- Verbo: ${skillMap.cognitiveVerb}
- Conceitos exigidos: ${skillMap.centralConcepts.join(', ')}
- Relações obrigatórias: ${skillMap.requiredRelations.join(', ')}
- Tarefa Final Ideal: ${skillMap.finalPerformanceTask}
- Evidências esperadas nas questões: ${skillMap.assessmentEvidence.join(' | ')}

# Rascunho anterior
${JSON.stringify(previousDraft)}

# Feedback de revisão
${JSON.stringify(review)}

# Validações determinísticas (corrija obrigatoriamente)
${deterministicIssues.length > 0 ? deterministicIssues.map((i) => `- ${i}`).join('\n') : '- Nenhuma'}

# Contagem de questões — CRÍTICO
${deltaInstruction}
As questões devem ser numeradas sequencialmente de 1 a ${questionCount}. Verifique: a ÚLTIMA questão do recurso deve ter number=${questionCount}.

# Meta
- Corrija os issues apontados sem alterar o que está correto.
- Entregue JSON final válido e completo.`
}
