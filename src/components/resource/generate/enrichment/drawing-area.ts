import { componentShell, escapeHtml } from '@/lib/resource/render-utils'

export interface DrawingAreaProps {
  id: string
  prompt: string
  number?: number
  label?: string
}

export function drawingArea(p: DrawingAreaProps): string {
  const content = `
  <div class="q-header">
    ${typeof p.number === 'number' ? `<span class="q-number">${p.number}.</span>` : ''}
    <p class="q-prompt">${escapeHtml(p.prompt)}</p>
  </div>
  <div class="drawing-area-inner">
    <div class="drawing-area-icon">✏️</div>
    <span class="drawing-area-label">${escapeHtml(p.label || 'Espaço para desenho')}</span>
  </div>`

  return componentShell({
    id: p.id,
    type: 'drawing_area',
    content,
    layoutRole: 'enrichment',
  })
}
