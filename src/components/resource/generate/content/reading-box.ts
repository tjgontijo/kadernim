import { componentShell, escapeHtml } from '@/lib/resource/render-utils'

export interface ReadingBoxProps {
  id: string
  tag?: string
  title: string
  body: string
  source?: string
}

export function readingBox(p: ReadingBoxProps): string {
  const paragraphs = p.body
    .split('\n\n')
    .map(para => `<p class="rb-para">${escapeHtml(para.trim())}</p>`)
    .join('')

  const content = `
  ${p.tag ? `<span class="reading-box-tag">${escapeHtml(p.tag)}</span>` : ''}
  <p class="reading-box-title">${escapeHtml(p.title)}</p>
  <div class="reading-box-body">${paragraphs}</div>
  ${p.source ? `<p class="reading-box-source">${escapeHtml(p.source)}</p>` : ''}`

  return componentShell({
    id: p.id,
    type: 'reading_box',
    content,
    className: 'reading-box',
    layoutRole: 'content',
  })
}
