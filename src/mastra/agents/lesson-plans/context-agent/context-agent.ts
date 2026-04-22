import { Agent } from '@mastra/core/agent'

function resolveLessonPlanModel() {
  return `openai/${process.env.LESSON_PLAN_MODEL || 'gpt-4o-mini'}`
}

export const lessonPlanContextAgent = new Agent({
  id: 'lesson-plan-context-agent',
  name: 'Lesson Plan Context Agent',
  instructions: 'Extraia contexto estruturado do recurso seguindo as skills do prompt.',
  model: resolveLessonPlanModel(),
})
