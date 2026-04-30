import { componentShell, escapeHtml } from '@/lib/resource/render-utils'

export interface ImagePlaceholderProps {
  id: string
  caption: string
  description: string
}

export function imagePlaceholder(p: ImagePlaceholderProps): string {
  const content = `
  <div class="img-ph-icon">🖼️</div>
  <div class="img-ph-caption">${escapeHtml(p.caption)}</div>
  <div class="img-ph-desc">${escapeHtml(p.description)}</div>`

  return componentShell({
    id: p.id,
    type: 'image_placeholder',
    content,
    className: 'img-placeholder',
    layoutRole: 'enrichment',
  })
}
