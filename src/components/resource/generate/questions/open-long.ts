import { renderOpenAnswerQuestion } from './open-answer-base'

export interface OpenLongProps {
  id: string
  number: number
  prompt: string
  lines?: number
  instruction?: string
}

export function openLong(p: OpenLongProps): string {
  return renderOpenAnswerQuestion({
    id: p.id,
    type: 'open_long',
    number: p.number,
    prompt: p.prompt,
    lines: p.lines ?? 6,
    instruction: p.instruction,
  })
}
