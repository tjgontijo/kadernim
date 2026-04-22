import { Agent } from '@mastra/core/agent'

function resolveLessonPlanModel() {
  return `openai/${process.env.LESSON_PLAN_MODEL || 'gpt-4o-mini'}`
}

export const lessonPlanDraftAgent = new Agent({
  id: 'lesson-plan-draft-agent',
  name: 'Lesson Plan Draft Agent',
  instructions: 'Gere o plano de aula seguindo as skills do prompt.',
  model: resolveLessonPlanModel(),
})
