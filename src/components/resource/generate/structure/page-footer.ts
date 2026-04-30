import { componentShell, escapeHtml } from '@/lib/resource/render-utils'

export interface PageFooterProps {
  id: string
  bnccSkill: string
  competencyArea: string
  pageNumber: number
}

export function pageFooter(p: PageFooterProps): string {
  const content = `
  <span class="pg-footer-skill">${escapeHtml(p.bnccSkill)} · ${escapeHtml(p.competencyArea)}</span>
  <span class="pg-footer-page">Pág. ${p.pageNumber}</span>`

  return componentShell({
    id: p.id,
    type: 'page_footer',
    content,
    className: 'pg-footer',
    layoutRole: 'structure',
  })
}
