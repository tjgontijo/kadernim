import { componentShell, escapeHtml } from '@/lib/resource/render-utils'

export interface GraphPlaceholderProps {
  id: string
  caption: string
  description: string
  icon?: string
  showAxes?: boolean
}

export function graphPlaceholder(p: GraphPlaceholderProps): string {
  const content = `
  <div class="graph-ph-icon">${escapeHtml(p.icon || '📊')}</div>
  ${p.showAxes === false ? '' : '<div class="graph-axes"></div>'}
  <p class="graph-ph-caption">${escapeHtml(p.caption)}</p>
  <p class="graph-ph-desc">${escapeHtml(p.description)}</p>`

  return componentShell({
    id: p.id,
    type: 'graph_placeholder',
    content,
    className: 'graph-placeholder',
    layoutRole: 'enrichment',
  })
}
