import { Agent } from '@mastra/core/agent'

function resolveLessonPlanModel() {
  return `openai/${process.env.LESSON_PLAN_MODEL || 'gpt-4o-mini'}`
}

export const lessonPlanContextAgent = new Agent({
  id: 'lesson-plan-context-agent',
  name: 'Lesson Plan Context Agent',
  instructions: 'Extraia contexto util, fiel ao recurso, em formato estruturado.',
  model: resolveLessonPlanModel(),
})

export const lessonPlanDraftAgent = new Agent({
  id: 'lesson-plan-draft-agent',
  name: 'Lesson Plan Draft Agent',
  instructions: 'Gere o plano de aula no schema solicitado, sem inventar dados fora do recurso.',
  model: resolveLessonPlanModel(),
})

export const lessonPlanReviewAgent = new Agent({
  id: 'lesson-plan-review-agent',
  name: 'Lesson Plan Review Agent',
  instructions: 'Revise o plano e retorne feedback objetivo para correcoes.',
  model: resolveLessonPlanModel(),
})

export const lessonPlanRefineAgent = new Agent({
  id: 'lesson-plan-refine-agent',
  name: 'Lesson Plan Refine Agent',
  instructions: 'Aplique correcoes solicitadas e entregue versao final no schema.',
  model: resolveLessonPlanModel(),
})
