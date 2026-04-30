import { componentShell, escapeHtml } from '@/lib/resource/render-utils'

export interface DividerSectionProps {
  id: string
  sectionTitle: string
}

export function dividerSection(p: DividerSectionProps): string {
  const content = `
  <div class="divider-line"></div>
  <span class="divider-label">${escapeHtml(p.sectionTitle)}</span>
  <div class="divider-line"></div>`

  return componentShell({
    id: p.id,
    type: 'divider_section',
    content,
    className: 'section-divider',
    layoutRole: 'structure',
  })
}
