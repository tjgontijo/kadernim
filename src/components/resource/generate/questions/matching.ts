import { componentShell, escapeHtml } from '@/lib/resource/render-utils'

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F']

export interface MatchingProps {
  id: string
  number: number
  prompt: string
  leftItems: string[]
  rightItems: string[]
  instruction?: string
}

export function matching(p: MatchingProps): string {
  const left = p.leftItems.map((item, i) => `
    <div class="match-item-wrap">
      <span class="match-ltr">${LETTERS[i]}</span>
      <span class="match-pill">${escapeHtml(item)}</span>
    </div>`).join('')
  
  const dots = p.leftItems.map(() => `<div class="match-circle"></div>`).join('')
  
  const right = p.rightItems.map((item, i) => `
    <div class="match-item-wrap">
      <span class="match-ltr">${i + 1}.</span>
      <span class="match-pill">${escapeHtml(item)}</span>
    </div>`).join('')

  const content = `
  <div class="q-header">
    <span class="q-number">${p.number}.</span>
    <span class="q-prompt">${escapeHtml(p.prompt)}</span>
  </div>
  ${p.instruction ? `<div class="q-instruction">${escapeHtml(p.instruction)}</div>` : ''}
  <div class="match-grid">
    <div class="match-col">${left}</div>
    <div class="match-dots-col">${dots}</div>
    <div class="match-col">${right}</div>
  </div>`

  return componentShell({
    id: p.id,
    type: 'matching',
    content,
    className: 'question',
    layoutRole: 'question',
  })
}
