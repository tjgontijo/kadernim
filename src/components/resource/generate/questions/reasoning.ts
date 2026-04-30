import { renderOpenAnswerQuestion } from './open-answer-base'

export interface ReasoningProps {
  id: string
  number: number
  prompt: string
  lines?: number
  instruction?: string
}

export function reasoning(p: ReasoningProps): string {
  return renderOpenAnswerQuestion({
    id: p.id,
    type: 'reasoning',
    number: p.number,
    prompt: p.prompt,
    lines: p.lines ?? 4,
    instruction: p.instruction,
  })
}
