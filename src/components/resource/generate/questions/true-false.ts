import { componentShell, escapeHtml } from '@/lib/resource/render-utils'

export interface TrueFalseProps {
  id: string
  number: number
  prompt: string
  statements: string[]
  instruction?: string
}

export function trueFalse(p: TrueFalseProps): string {
  const items = p.statements.map(s => `
    <div class="tf-item">
      <div class="tf-bubble">V</div>
      <div class="tf-bubble">F</div>
      <span class="tf-text">${escapeHtml(s)}</span>
    </div>`).join('')

  const content = `
  <div class="q-header">
    <span class="q-number">${p.number}.</span>
    <span class="q-prompt">${escapeHtml(p.prompt)}</span>
  </div>
  ${p.instruction ? `<div class="q-instruction">${escapeHtml(p.instruction)}</div>` : ''}
  <div class="tf-list">${items}</div>`

  return componentShell({
    id: p.id,
    type: 'true_false',
    content,
    className: 'question',
    layoutRole: 'question',
  })
}
