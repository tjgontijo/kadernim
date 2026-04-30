import { renderOpenAnswerQuestion } from './open-answer-base'

export interface ComprehensionProps {
  id: string
  number: number
  prompt: string
  lines?: number
  instruction?: string
}

export function comprehension(p: ComprehensionProps): string {
  return renderOpenAnswerQuestion({
    id: p.id,
    type: 'comprehension',
    number: p.number,
    prompt: p.prompt,
    lines: p.lines ?? 4,
    instruction: p.instruction,
  })
}
