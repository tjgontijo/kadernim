import { renderOpenAnswerQuestion } from './open-answer-base'

export interface CreationProps {
  id: string
  number: number
  prompt: string
  lines?: number
  instruction?: string
}

export function creation(p: CreationProps): string {
  return renderOpenAnswerQuestion({
    id: p.id,
    type: 'creation',
    number: p.number,
    prompt: p.prompt,
    lines: p.lines ?? 4,
    instruction: p.instruction,
  })
}
