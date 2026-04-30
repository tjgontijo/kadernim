import { componentShell, escapeHtml } from '@/lib/resource/render-utils'

export type CalloutVariant = 'think' | 'didyouknow' | 'attention' | 'tip' | 'quick' | 'pause'

const CALLOUT_META: Record<CalloutVariant, { className: string; icon: string; title: string }> = {
  think: { className: 'callout-think', icon: '🤔', title: 'Pense comigo' },
  didyouknow: { className: 'callout-didyouknow', icon: '💭', title: 'Você sabia?' },
  attention: { className: 'callout-attention', icon: '⚠️', title: 'Atenção' },
  tip: { className: 'callout-tip', icon: '💬', title: 'Dica do mestre' },
  quick: { className: 'callout-quick', icon: '⚡', title: 'Desafio rápido' },
  pause: { className: 'callout-pause', icon: '🎯', title: 'Pausa para conversa' },
}

export interface CalloutBoxProps {
  id: string
  variant: CalloutVariant
  body: string
  title?: string
  icon?: string
}

export function calloutBox(p: CalloutBoxProps): string {
  const meta = CALLOUT_META[p.variant]
  const title = p.title || meta.title
  const icon = p.icon || meta.icon

  const content = `
  <div class="callout-icon">${escapeHtml(icon)}</div>
  <div class="callout-title">${escapeHtml(title)}</div>
  <div class="callout-body">${escapeHtml(p.body)}</div>`

  return componentShell({
    id: p.id,
    type: 'callout_box',
    content,
    className: `callout ${meta.className}`,
    layoutRole: 'content',
  })
}
