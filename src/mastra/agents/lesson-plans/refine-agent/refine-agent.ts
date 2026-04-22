import { Agent } from '@mastra/core/agent'

function resolveLessonPlanModel() {
  return `openai/${process.env.LESSON_PLAN_MODEL || 'gpt-4o-mini'}`
}

export const lessonPlanRefineAgent = new Agent({
  id: 'lesson-plan-refine-agent',
  name: 'Lesson Plan Refine Agent',
  instructions: 'Refine o plano seguindo as skills do prompt.',
  model: resolveLessonPlanModel(),
})
