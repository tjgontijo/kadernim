import { renderOpenAnswerQuestion } from './open-answer-base'

export interface OpenShortProps {
  id: string
  number: number
  prompt: string
  lines?: number
  instruction?: string
}

export function openShort(p: OpenShortProps): string {
  return renderOpenAnswerQuestion({
    id: p.id,
    type: 'open_short',
    number: p.number,
    prompt: p.prompt,
    lines: p.lines ?? 2,
    instruction: p.instruction,
  })
}
