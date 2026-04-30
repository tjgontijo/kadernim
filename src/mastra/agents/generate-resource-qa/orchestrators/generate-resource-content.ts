import { ResourcePlanSchema, countQuestions } from '@/lib/resource/schemas'
import type { BnccSkill, PedagogicalPhase, ResourcePlan } from '@/lib/resource/schemas'
import { parseBnccCode, yearToPhase } from '@/lib/resource/bncc-parser'
import { getBnccSkillByCode } from '@/lib/bncc/services/bncc-service'
import { qaArchitectAgent } from '../architect/architect'
import { buildQaArchitectPrompt } from '../architect/prompts'
import { qaArtisanAgent } from '../artisan/artisan'
import { buildQaArtisanPrompt, buildQaRefinementPrompt } from '../artisan/prompts'
import { RESOURCE_ARTISAN_RULES } from '../artisan/artisan-skills'
import { QA_COMPONENT_CATALOG } from '../shared/component-catalog'
import {
  MultiSkillGenerationMapSchema,
  ResourceGenerationReviewSchema,
} from '../shared/schemas'
import { RESOURCE_OUTPUT_CONTRACT } from '../shared/skills'
import { AdaptiveLayoutEngine } from '@/lib/resource/adaptive-layout-engine'
import { qaReviewerAgent } from '../reviewer/reviewer'
import { buildQaReviewPrompt } from '../reviewer/prompts'

const DEFAULT_QUESTION_COUNT: Record<PedagogicalPhase, number> = {
  phase_1: 2,
  phase_2: 3,
  phase_3: 4,
  phase_4: 5,
  phase_5: 6,
}

const ARTISAN_SKILLS = [
  QA_COMPONENT_CATALOG,
  RESOURCE_ARTISAN_RULES,
  RESOURCE_OUTPUT_CONTRACT,
].join('\n\n')

export async function generateResourceQaContent(
  bnccCodes: string[],
  questionCount?: number,
): Promise<ResourcePlan> {
  const codes = bnccCodes.slice(0, 5)
  const skillsData = await Promise.all(codes.map(code => getBnccSkillByCode(code)))
  const validSkills = skillsData.filter((s): s is NonNullable<typeof s> => !!s)
  
  if (validSkills.length === 0) throw new Error('Nenhuma habilidade válida fornecida.')
  
  const mainSkill = validSkills[0]
  const phase = yearToPhase(parseBnccCode(mainSkill.code).year)
  const resolvedQuestionCount = questionCount || (DEFAULT_QUESTION_COUNT[phase] * validSkills.length)

  console.log(`[generate-qa] START codes=${codes.join(',')} questionCount=${resolvedQuestionCount} phase=${phase}`)

  console.log('[generate-qa] → QA Architect (Planning)')
  const architectResult = await qaArchitectAgent.generate(
    buildQaArchitectPrompt(validSkills.map(s => ({
      bnccCode: s.code,
      bnccDescription: s.description,
      bnccSubject: s.subject?.name || '',
      bnccGrade: s.grade?.name || '',
      pedagogicalExplanation: s.comments || '',
      curriculumGuidance: s.curriculumSuggestions || '',
    }))),
    {
      structuredOutput: {
        schema: MultiSkillGenerationMapSchema,
        errorStrategy: 'strict',
      },
      modelSettings: {
        temperature: 0.2,
      },
    },
  )

  const pedagogicalMap = architectResult.object
  console.log('[generate-qa] Architect finished')

  console.log('[generate-qa] → QA Artisan (Writing)')
  const draftResult = await qaArtisanAgent.generate(
    buildQaArtisanPrompt({
      skills: validSkills,
      phase,
      questionCount: resolvedQuestionCount,
      pedagogicalMap,
      skillsBlock: ARTISAN_SKILLS,
    }),
    {
      structuredOutput: {
        schema: ResourcePlanSchema,
        errorStrategy: 'strict',
      },
      modelSettings: {
        temperature: 0.3,
        maxOutputTokens: 4000,
      },
    },
  )

  let currentPlan = draftResult.object
  console.log('[generate-qa] Draft finished')

  console.log('[generate-qa] → QA Reviewer (Checking)')
  const reviewResult = await qaReviewerAgent.generate(
    buildQaReviewPrompt({
      resourcePlan: currentPlan,
      pedagogicalMap,
      questionCount: resolvedQuestionCount,
      allowedComponents: QA_COMPONENT_CATALOG,
    }),
    {
      structuredOutput: {
        schema: ResourceGenerationReviewSchema,
        errorStrategy: 'strict',
      },
      modelSettings: {
        temperature: 0,
      },
    },
  )

  const review = reviewResult.object
  console.log(`[generate-qa] Review finished. shouldRefine=${review.shouldRefine}`)

  if (review.shouldRefine) {
    console.log('[generate-qa] → QA Artisan (Refining)')
    const refinedResult = await qaArtisanAgent.generate(
      buildQaRefinementPrompt({
        originalPlan: currentPlan,
        review,
        pedagogicalMap,
        questionCount: resolvedQuestionCount,
        phase,
        skills: validSkills,
        skillsBlock: ARTISAN_SKILLS,
      }),
      {
        structuredOutput: {
          schema: ResourcePlanSchema,
          errorStrategy: 'strict',
        },
        modelSettings: {
          temperature: 0.2,
          maxOutputTokens: 4000,
        },
      },
    )
    currentPlan = refinedResult.object
  }

  console.log('[generate-qa] DONE → adaptive layout engine')
  const { plan: finalPlan } = await AdaptiveLayoutEngine.process(currentPlan, { 
    phase, 
    subject: parseBnccCode(mainSkill.code).component 
  })
  
  const finalQuestionCount = countQuestions(finalPlan)
  if (finalQuestionCount !== resolvedQuestionCount) {
    console.warn(`[generate-qa] WARNING: Final question count mismatch. Expected ${resolvedQuestionCount}, got ${finalQuestionCount}`)
    // Still returning for now, but in production we might throw
  }

  return ResourcePlanSchema.parse(finalPlan)
}
