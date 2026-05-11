import type { ResourceSnapshot } from '@/lib/lesson-plans/schemas'

const MVP_ALLOWED_SUBJECTS = ['portugues', 'matematica'] as const

function normalize(value: string | null | undefined) {
  return (value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

export function isLessonPlanMvpEligible(input: {
  educationLevelName: string | null | undefined
  subjectName: string | null | undefined
}) {
  const level = normalize(input.educationLevelName)
  const subject = normalize(input.subjectName)

  const isFundamental = level.includes('fundamental')
  const isAllowedSubject = MVP_ALLOWED_SUBJECTS.includes(subject as (typeof MVP_ALLOWED_SUBJECTS)[number])

  return isFundamental && isAllowedSubject
}

export function isResourceSnapshotMvpEligible(snapshot: ResourceSnapshot) {
  return isLessonPlanMvpEligible({
    educationLevelName: snapshot.educationLevel?.name,
    subjectName: snapshot.subject?.name,
  })
}

export const LESSON_PLAN_MVP_BLOCK_MESSAGE =
  'No MVP, o plano de aula está disponível apenas para Português e Matemática do Ensino Fundamental.'
