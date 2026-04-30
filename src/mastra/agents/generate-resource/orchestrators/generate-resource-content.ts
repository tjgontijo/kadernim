import { ActivityInputSchema, ResourcePlanSchema, countQuestions, QUESTION_COMPONENT_TYPES } from '@/lib/resource/schemas'
import type { BnccSkill, Component, PedagogicalPhase, ResourcePlan } from '@/lib/resource/schemas'
import { paginateResourcePlan } from '@/lib/resource/paginator'
import { getComponentName, parseBnccCode, yearToPhase } from '@/lib/resource/bncc-parser'
import { getBnccSkillByCode } from '@/lib/bncc/services/bncc-service'
import { generateResourceSkillMapperAgent } from '@/mastra/agents/generate-resource/skill-mapper-agent/skill-mapper-agent'
import { buildSkillMapperPrompt } from '@/mastra/agents/generate-resource/skill-mapper-agent/prompts'
import { generateResourceContextAgent } from '@/mastra/agents/generate-resource/context-agent/context-agent'
import { buildGenerateResourceContextPrompt } from '@/mastra/agents/generate-resource/context-agent/prompts'
import { RESOURCE_CONTEXT_PLANNING } from '@/mastra/agents/generate-resource/context-agent/skills'
import { generateResourceDraftAgent } from '@/mastra/agents/generate-resource/draft-agent/draft-agent'
import { buildGenerateResourceDraftPrompt } from '@/mastra/agents/generate-resource/draft-agent/prompts'
import { RESOURCE_DRAFT_RULES } from '@/mastra/agents/generate-resource/draft-agent/skills'
import { generateResourceRefineAgent } from '@/mastra/agents/generate-resource/refine-agent/refine-agent'
import { buildGenerateResourceRefinePrompt } from '@/mastra/agents/generate-resource/refine-agent/prompts'
import { RESOURCE_REFINE_RULES } from '@/mastra/agents/generate-resource/refine-agent/skills'
import { generateResourceReviewAgent } from '@/mastra/agents/generate-resource/review-agent/review-agent'
import { buildGenerateResourceReviewPrompt } from '@/mastra/agents/generate-resource/review-agent/prompts'
import { RESOURCE_REVIEW_CHECKLIST } from '@/mastra/agents/generate-resource/review-agent/skills'
import { generateResourceProposalAgent } from '@/mastra/agents/generate-resource/proposal-agent/proposal-agent'
import { buildGenerateResourceProposalPrompt } from '@/mastra/agents/generate-resource/proposal-agent/prompts'
import { GENERATE_RESOURCE_COMPONENTS_SKILL } from '@/mastra/agents/generate-resource/shared/component-catalog'
import {
  ResourceGenerationContextSchema,
  ResourceGenerationReviewSchema,
  ResourceProposalsSchema,
  SkillGenerationMapSchema,
} from '@/mastra/agents/generate-resource/shared/schemas'
import type { ResourceProposal, SkillGenerationMap } from '@/mastra/agents/generate-resource/shared/schemas'
import {
  RESOURCE_OUTPUT_CONTRACT,
  RESOURCE_PEDAGOGICAL_FIDELITY,
} from '@/mastra/agents/generate-resource/shared/skills'
import { AdaptiveLayoutEngine } from '@/lib/resource/adaptive-layout-engine'

const DEFAULT_QUESTION_COUNT: Record<PedagogicalPhase, number> = {
  phase_1: 2,
  phase_2: 3,
  phase_3: 4,
  phase_4: 5,
  phase_5: 6,
}

const CONTEXT_SKILLS = [
  RESOURCE_CONTEXT_PLANNING,
  RESOURCE_PEDAGOGICAL_FIDELITY,
  RESOURCE_OUTPUT_CONTRACT,
].join('\n\n')

const DRAFT_SKILLS = [
  GENERATE_RESOURCE_COMPONENTS_SKILL,
  RESOURCE_DRAFT_RULES,
  RESOURCE_OUTPUT_CONTRACT,
].join('\n\n')

const REVIEW_SKILLS = [
  RESOURCE_REVIEW_CHECKLIST,
  RESOURCE_PEDAGOGICAL_FIDELITY,
  RESOURCE_OUTPUT_CONTRACT,
].join('\n\n')

const REFINE_SKILLS = [
  GENERATE_RESOURCE_COMPONENTS_SKILL,
  RESOURCE_REFINE_RULES,
  RESOURCE_OUTPUT_CONTRACT,
].join('\n\n')

function trimExcessQuestions(plan: ResourcePlan, target: number): ResourcePlan {
  const excess = countQuestions(plan) - target
  if (excess <= 0) return plan

  let removed = 0
  const pages = [...plan.pages].reverse().map((page) => {
    if (removed >= excess) return page
    const components = [...page.components]
    const trimmed: typeof components = []
    for (let i = components.length - 1; i >= 0; i--) {
      const c = components[i]
      if (removed < excess && QUESTION_COMPONENT_TYPES.has(c.type) && c.type !== 'page_footer') {
        removed++
      } else {
        trimmed.unshift(c)
      }
    }
    return { ...page, components: trimmed }
  })

  return { ...plan, pages: pages.reverse() }
}

function validateGeneratedPlan(plan: ResourcePlan, expectedQuestionCount: number, expectedPages?: number, skillMap?: SkillGenerationMap): string[] {
  const issues: string[] = []

  if (plan.pages.length < 2) {
    issues.push('O recurso precisa ter no mínimo 2 páginas.')
  }

  if (expectedPages && plan.pages.length !== expectedPages) {
    issues.push(`O recurso deve ter exatamente ${expectedPages} páginas conforme o blueprint, mas veio ${plan.pages.length}.`)
  }

  plan.pages.forEach((page, idx) => {
    const firstType = page.components[0]?.type
    const lastType = page.components[page.components.length - 1]?.type
    if (firstType !== 'page_header') issues.push(`A página ${idx + 1} deve começar com page_header.`)
    if (lastType !== 'page_footer') issues.push(`A página ${idx + 1} deve terminar com page_footer.`)

    const contentCount = page.components.filter(c => c.type !== 'page_header' && c.type !== 'page_footer').length
    if (contentCount < 2) {
      issues.push(`Página ${page.pageNumber} tem pouco conteúdo. Adicione apoio, quadro ou autoavaliação.`)
    }
  })

  // Validador de Produção Final Solta
  const lastPage = plan.pages[plan.pages.length - 1]
  if (lastPage) {
    const hasCreation = lastPage.components.some(c => c.type === 'creation')
    const hasTable = lastPage.components.some(c => c.type === 'data_table' || c.type === 'self_assessment')
    if (hasCreation && !hasTable) {
      issues.push('Produção final precisa de estrutura (ex: data_table ou self_assessment). Não deixe o aluno no vazio.')
    }
  }

  // Validador de Distratores Fracos
  const weakPatterns = ['não faz diferença', 'não importa', 'apenas', 'todos devem ser iguais', 'sem se preocupar', 'ignorar']
  plan.pages.forEach(page => {
    page.components.forEach(component => {
      if (component.type === 'multiple_choice') {
        let weakCount = 0
        // @ts-ignore
        component.options.forEach((opt: string) => {
          if (weakPatterns.some(p => opt.toLowerCase().includes(p))) weakCount++
        })
        if (weakCount >= 2) {
          // @ts-ignore
          issues.push(`Questão ${component.number} tem distratores muito óbvios ou fracos.`)
        }
      }
    })
  })

  // Validador de Conceitos Obrigatórios
  if (skillMap) {
    const textStr = JSON.stringify(plan).toLowerCase()
    skillMap.centralConcepts.forEach(concept => {
      if (!textStr.includes(concept.toLowerCase())) {
        issues.push(`Conceito obrigatório ausente do material: ${concept}`)
      }
    })
  }

  const totalQuestions = countQuestions(plan)
  if (totalQuestions !== expectedQuestionCount) {
    issues.push(`O total de questões deve ser exatamente ${expectedQuestionCount}, mas veio ${totalQuestions}.`)
  }

  return issues
}

export async function generateResourceProposalsContent(bnccCode: string, questionCount: number) {
  console.log(`[proposals] bnccCode=${bnccCode} questionCount=${questionCount}`)

  const bnccData = await getBnccSkillByCode(bnccCode)
  if (!bnccData) throw new Error(`Habilidade BNCC não encontrada no banco: ${bnccCode}`)
  console.log(`[proposals] bncc loaded: ${bnccData.subject?.name} · ${bnccData.grade?.name}`)

  const result = await generateResourceProposalAgent.generate(
    buildGenerateResourceProposalPrompt({ bnccData, questionCount }),
    { structuredOutput: { schema: ResourceProposalsSchema } },
  )

  console.log(`[proposals] generated ${result.object.proposals.length} proposals`)
  return result.object.proposals
}

export async function generateResourceContent(
  bnccCode: string,
  questionCount?: number,
  selectedProposal?: ResourceProposal,
  mockBnccData?: any,
): Promise<ResourcePlan> {
  const input = ActivityInputSchema.parse({ bnccCode, questionCount })
  const bnccMetadata: Omit<BnccSkill, 'description'> = parseBnccCode(input.bnccCode)
  const phase = yearToPhase(bnccMetadata.year)
  const resolvedQuestionCount = input.questionCount || DEFAULT_QUESTION_COUNT[phase]
  const componentName = getComponentName(bnccMetadata.component)

  console.log(`[generate] START bnccCode=${input.bnccCode} questionCount=${resolvedQuestionCount} phase=${phase}`)
  if (selectedProposal) console.log(`[generate] proposal="${selectedProposal.theme}"`)

  const bnccData = mockBnccData || (await getBnccSkillByCode(input.bnccCode))
  if (!bnccData) throw new Error(`Habilidade BNCC não encontrada no banco: ${input.bnccCode}`)
  console.log('[generate] bncc loaded:', bnccData.subject?.name, '·', bnccData.grade?.name)

  console.log('[generate] → skill mapper agent')
  const skillMapResult = await generateResourceSkillMapperAgent.generate(
    buildSkillMapperPrompt({
      bnccCode: bnccData.code,
      bnccDescription: bnccData.description,
      bnccSubject: bnccData.subject?.name || componentName,
      bnccGrade: bnccData.grade?.name || String(bnccMetadata.year),
      pedagogicalExplanation: bnccData.comments || '',
      curriculumGuidance: bnccData.curriculumSuggestions || '',
    }),
    { structuredOutput: { schema: SkillGenerationMapSchema } }
  )

  const skillMap = skillMapResult.object
  console.log('[generate] skill mapper finished')

  console.log('[generate] → context agent')
  const contextResult = await generateResourceContextAgent.generate(
    buildGenerateResourceContextPrompt({
      bnccData,
      skillMap,
      phase,
      questionCount: resolvedQuestionCount,
      selectedProposal,
      skillsBlock: CONTEXT_SKILLS,
    }),
    { structuredOutput: { schema: ResourceGenerationContextSchema } },
  )

  let context = contextResult.object
  const blueprintTotal = context.pageBlueprint.reduce((s: number, p: { targetQuestionCount: number }) => s + p.targetQuestionCount, 0)
  console.log(`[generate] context: ${context.pageBlueprint.length} pages, blueprint total=${blueprintTotal} (expected=${resolvedQuestionCount})`)

  if (blueprintTotal !== resolvedQuestionCount) {
    console.warn(`[generate] blueprint mismatch — fixing: redistributing ${resolvedQuestionCount} questions across ${context.pageBlueprint.length} pages`)
    const pages = context.pageBlueprint.length
    const base = Math.floor(resolvedQuestionCount / pages)
    const remainder = resolvedQuestionCount % pages
    context = {
      ...context,
      pageBlueprint: context.pageBlueprint.map((p: { targetQuestionCount: number }, i: number) => ({
        ...p,
        targetQuestionCount: base + (i < remainder ? 1 : 0),
      })),
    }
  }

  console.log('[generate] → draft agent')
  const draftResult = await generateResourceDraftAgent.generate(
    buildGenerateResourceDraftPrompt({
      bnccData,
      bnccMetadata,
      componentName,
      phase,
      questionCount: resolvedQuestionCount,
      context,
      skillMap,
      skillsBlock: DRAFT_SKILLS,
    }),
    { structuredOutput: { schema: ResourcePlanSchema } },
  )

  const draft = draftResult.object
  const deterministicIssues = validateGeneratedPlan(draft, resolvedQuestionCount, undefined, skillMap)
  const draftQuestions = countQuestions(draft)
  console.log(`[generate] draft: ${draft.pages.length} pages, ${draftQuestions} questions, deterministic issues=${deterministicIssues.length}`)
  if (deterministicIssues.length > 0) console.log(`[generate] deterministic issues: ${deterministicIssues.join(' | ')}`)

  console.log('[generate] → review agent')
  const reviewResult = await generateResourceReviewAgent.generate(
    buildGenerateResourceReviewPrompt({
      questionCount: resolvedQuestionCount,
      bnccDescription: bnccData.description,
      skillMap,
      draft,
      deterministicIssues,
      skillsBlock: REVIEW_SKILLS,
    }),
    { structuredOutput: { schema: ResourceGenerationReviewSchema } },
  )

  const review = ResourceGenerationReviewSchema.parse(reviewResult.object)
  console.log(`[generate] review: shouldRefine=${review.shouldRefine} issues=${review.issues.length} (${review.issues.map(i => i.severity).join(',')})`)
  const shouldRefine =
    review.shouldRefine ||
    review.issues.some((issue) => issue.severity === 'HIGH') ||
    deterministicIssues.length > 0

  if (!shouldRefine) {
    console.log('[generate] DONE (no refine needed) → adaptive layout engine')
    const { plan: finalPlan } = await AdaptiveLayoutEngine.process(draft, { 
      phase, 
      subject: bnccMetadata.component 
    })
    return finalPlan
  }

  const draftQuestionCount = countQuestions(draft)

  console.log('[generate] → refine agent')
  const refineResult = await generateResourceRefineAgent.generate(
    buildGenerateResourceRefinePrompt({
      previousDraft: draft,
      review,
      deterministicIssues,
      questionCount: resolvedQuestionCount,
      currentQuestionCount: draftQuestionCount,
      bnccDescription: bnccData.description,
      skillMap,
      skillsBlock: REFINE_SKILLS,
    }),
    { structuredOutput: { schema: ResourcePlanSchema } },
  )

  let refined = refineResult.object
  const refinedRaw = countQuestions(refined)
  console.log(`[generate] refined: ${refined.pages.length} pages, ${refinedRaw} questions`)

  // Deterministic trim if agent overshot by ≤3 questions
  if (refinedRaw > resolvedQuestionCount && refinedRaw - resolvedQuestionCount <= 3) {
    console.log(`[generate] trimming ${refinedRaw - resolvedQuestionCount} excess question(s)`)
    refined = trimExcessQuestions(refined, resolvedQuestionCount)
  }

  // Validate question count only — page layout is handled by the paginator
  const finalIssues = validateGeneratedPlan(refined, resolvedQuestionCount, undefined, skillMap)
  console.log(`[generate] final issues=${finalIssues.length}${finalIssues.length > 0 ? ': ' + finalIssues.join(' | ') : ''}`)

  if (finalIssues.length > 0) {
    const totalRaw = countQuestions(refined)
    if (totalRaw === 0 || refined.pages.length === 0) {
      throw new Error(`Falha crítica ao gerar recurso: Nenhum conteúdo válido. Issues: ${finalIssues.join(' ')}`)
    } else {
      console.warn(`[generate] Tolerando issues finais para preservar conteúdo gerado: ${finalIssues.join(' ')}`)
    }
  }

  console.log('[generate] → adaptive layout engine (measurement pass)')
  const { plan: finalPlan } = await AdaptiveLayoutEngine.process(refined, { 
    phase, 
    subject: bnccMetadata.component 
  })

  return finalPlan
}
