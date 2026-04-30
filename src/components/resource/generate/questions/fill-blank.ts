import { componentShell, escapeHtml } from '@/lib/resource/render-utils'

export interface FillBlankProps {
  id: string
  number: number
  prompt: string
  wordBank?: string[]
  sentenceTemplate: string
  instruction?: string
}

export function fillBlank(p: FillBlankProps): string {
  const bank = p.wordBank?.length
    ? `<div class="fb-bank">${p.wordBank.map(w => `<span class="fb-word">${escapeHtml(w)}</span>`).join('')}</div>`
    : ''
  
  const sentences = p.sentenceTemplate
    .split('\n')
    .filter(s => s.trim())
    .map(s => {
      const escaped = escapeHtml(s.trim())
      return `<p class="fb-sent">${escaped.replace(/_{3,}/g, '<span class="fb-blank"></span>')}</p>`
    })
    .join('')

  const content = `
  <div class="q-header">
    <span class="q-number">${p.number}.</span>
    <span class="q-prompt">${escapeHtml(p.prompt)}</span>
  </div>
  ${p.instruction ? `<div class="q-instruction">${escapeHtml(p.instruction)}</div>` : ''}
  ${bank}
  <div class="fb-sentences">${sentences}</div>`

  return componentShell({
    id: p.id,
    type: 'fill_blank',
    content,
    className: 'question',
    layoutRole: 'question',
  })
}
