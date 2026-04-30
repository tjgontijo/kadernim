import { componentShell, escapeHtml } from '@/lib/resource/render-utils'

export interface FrameBoxProps {
  id: string
  title?: string
  body: string
  lines?: number
}

export function frameBox(p: FrameBoxProps): string {
  const lineCount = p.lines ?? 2
  const lines = Array.from({ length: lineCount })
    .map(() => '<div class="frame-line"></div>')
    .join('')
  
  const content = `
  ${p.title ? `<div class="frame-title">${escapeHtml(p.title)}</div>` : ''}
  <p class="frame-body">${escapeHtml(p.body)}</p>
  <div class="frame-lines">${lines}</div>`

  return componentShell({
    id: p.id,
    type: 'frame_box',
    content,
    className: 'frame',
    layoutRole: 'enrichment',
    extraAttrs: {
      'data-lines': lineCount.toString(),
    },
  })
}
