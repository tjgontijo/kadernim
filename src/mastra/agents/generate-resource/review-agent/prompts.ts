import type { ResourcePlan } from '@/lib/resource/schemas'
import type { SkillGenerationMap } from '@/mastra/agents/generate-resource/shared/schemas'

export function buildGenerateResourceReviewPrompt(input: {
  questionCount: number
  bnccDescription: string
  skillMap: SkillGenerationMap
  draft: ResourcePlan
  deterministicIssues: string[]
  skillsBlock: string
}) {
  const { questionCount, bnccDescription, skillMap, draft, deterministicIssues } = input

  return `${input.skillsBlock}

# Habilidade BNCC (referência para fidelidade)
${bnccDescription}

# Contrato Pedagógico (Skill Map)
O recurso FOI OBRIGADO a seguir este contrato:
- Verbo: ${skillMap.cognitiveVerb}
- Conceitos exigidos: ${skillMap.centralConcepts.join(', ')}
- Relações obrigatórias: ${skillMap.requiredRelations.join(', ')}
- Tarefa Final Ideal: ${skillMap.finalPerformanceTask}
- Evidências esperadas nas questões: ${skillMap.assessmentEvidence.join(' | ')}

# Recurso gerado
${JSON.stringify(draft)}

# Validações determinísticas (erros confirmados — devem gerar shouldRefine = true)
${deterministicIssues.length > 0 ? deterministicIssues.map((i) => `- ${i}`).join('\n') : '- Nenhuma'}

# Parâmetros esperados
- Total de questões: ${questionCount}

Revise conforme o checklist. Seja objetivo — aponte issues reais e específicas, não genéricas.`
}
