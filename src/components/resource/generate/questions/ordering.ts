import { componentShell, escapeHtml } from '@/lib/resource/render-utils'

export interface OrderingProps {
  id: string
  number: number
  prompt: string
  items: string[]
  instruction?: string
}

export function ordering(p: OrderingProps): string {
  const items = p.items.map(item => `
    <div class="order-item">
      <div class="order-bubble"></div>
      <span class="order-text">${escapeHtml(item)}</span>
    </div>`).join('')

  const content = `
  <div class="q-header">
    <span class="q-number">${p.number}.</span>
    <span class="q-prompt">${escapeHtml(p.prompt)}</span>
  </div>
  ${p.instruction ? `<div class="q-instruction">${escapeHtml(p.instruction)}</div>` : ''}
  <div class="order-list">${items}</div>`

  return componentShell({
    id: p.id,
    type: 'ordering',
    content,
    className: 'question',
    layoutRole: 'question',
  })
}
