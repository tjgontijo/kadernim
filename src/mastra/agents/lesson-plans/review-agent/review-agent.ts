import { Agent } from '@mastra/core/agent'

function resolveLessonPlanModel() {
  return `openai/${process.env.LESSON_PLAN_MODEL || 'gpt-4o-mini'}`
}

export const lessonPlanReviewAgent = new Agent({
  id: 'lesson-plan-review-agent',
  name: 'Lesson Plan Review Agent',
  instructions: 'Revise o plano seguindo o checklist do prompt.',
  model: resolveLessonPlanModel(),
})
