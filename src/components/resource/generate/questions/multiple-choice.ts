import { componentShell, escapeHtml } from '@/lib/resource/render-utils'

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F']

export interface MultipleChoiceProps {
  id: string
  number: number
  prompt: string
  options: string[]
  instruction?: string
}

export function multipleChoice(p: MultipleChoiceProps): string {
  const opts = p.options.map((opt, i) => `
    <div class="mc-opt">
      <span class="mc-letter">${LETTERS[i]}</span>
      <span class="mc-text">${escapeHtml(opt)}</span>
    </div>`).join('')

  const content = `
  <div class="q-header">
    <span class="q-number">${p.number}.</span>
    <span class="q-prompt">${escapeHtml(p.prompt)}</span>
  </div>
  ${p.instruction ? `<div class="q-instruction">${escapeHtml(p.instruction)}</div>` : ''}
  <div class="mc-opts">${opts}</div>`

  return componentShell({
    id: p.id,
    type: 'multiple_choice',
    content,
    className: 'question',
    layoutRole: 'question',
  })
}
