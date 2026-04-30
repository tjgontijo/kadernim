import { componentShell, escapeHtml } from '@/lib/resource/render-utils'

export interface TipBoxProps {
  id: string
  tipText: string
}

export function tipBox(p: TipBoxProps): string {
  const content = `
  <div class="box-hd"><span class="box-icon">📌</span><span class="box-title">Dica</span></div>
  <div class="box-divider"></div>
  <div class="box-def">${escapeHtml(p.tipText)}</div>`

  return componentShell({
    id: p.id,
    type: 'tip_box',
    content,
    className: 'box box-tip',
    layoutRole: 'content',
  })
}
