import { componentShell, escapeHtml } from '@/lib/resource/render-utils'

export interface OpenAnswerBaseProps {
  id: string
  type: string
  number: number
  prompt: string
  lines?: number
  instruction?: string
}

export function renderOpenAnswerQuestion(p: OpenAnswerBaseProps): string {
  const lineCount = p.lines ?? 3
  const lines = Array.from({ length: lineCount })
    .map(() => '<div class="answer-line"></div>')
    .join('')

  const content = `
  <div class="q-header">
    <span class="q-number">${p.number}.</span>
    <span class="q-prompt">${escapeHtml(p.prompt)}</span>
  </div>
  ${p.instruction ? `<div class="q-instruction">${escapeHtml(p.instruction)}</div>` : ''}
  <div class="answer-lines">${lines}</div>`

  return componentShell({
    id: p.id,
    type: p.type,
    content,
    className: 'question',
    layoutRole: 'question',
    extraAttrs: {
      'data-lines': lineCount.toString(),
    },
  })
}
