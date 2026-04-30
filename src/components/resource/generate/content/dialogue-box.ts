import { componentShell, escapeHtml } from '@/lib/resource/render-utils'

export interface DialogueBoxProps {
  id: string
  title?: string
  lines: Array<{ speaker: string; text: string; side?: 'left' | 'right' }>
}

export function dialogueBox(p: DialogueBoxProps): string {
  const lines = p.lines.map((line) => `
    <div class="dialogue-line${line.side === 'right' ? ' right' : ''}">
      <span class="dialogue-speaker">${escapeHtml(line.speaker)}:</span>
      <div class="dialogue-bubble">${escapeHtml(line.text)}</div>
    </div>`).join('')

  const content = `
  <div class="box-hd"><span class="box-icon">💬</span><span class="box-title">${escapeHtml(p.title || 'Diálogo')}</span></div>
  <div class="box-divider"></div>
  <div class="dialogue-list">${lines}</div>`

  return componentShell({
    id: p.id,
    type: 'dialogue_box',
    content,
    className: 'dialogue-box',
    layoutRole: 'content',
  })
}
