import { componentShell, escapeHtml } from '@/lib/resource/render-utils'

export interface ProseBlockProps {
  id: string
  paragraphs: string[]
}

export function proseBlock(p: ProseBlockProps): string {
  const paragraphs = p.paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('')
  
  return componentShell({
    id: p.id,
    type: 'prose_block',
    content: paragraphs,
    className: 'prose',
    layoutRole: 'content',
  })
}
