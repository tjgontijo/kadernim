import { componentShell, escapeHtml } from '@/lib/resource/render-utils'

export interface PageHeaderProps {
  id: string
  title: string
  subject: string
  year: string
  bnccCode: string
  studentField?: boolean
  teacherField?: boolean
  dateField?: boolean
  schoolField?: boolean
}

export function pageHeader(p: PageHeaderProps): string {
  const fields = [
    p.studentField && `<div class="hf"><span class="hf-label">Aluno:</span><div class="hf-line"></div></div>`,
    p.teacherField && `<div class="hf"><span class="hf-label">Prof.:</span><div class="hf-line"></div></div>`,
    p.dateField && `<div class="hf"><span class="hf-label">Data:</span><div class="hf-line"></div></div>`,
    p.schoolField && `<div class="hf"><span class="hf-label">Escola:</span><div class="hf-line"></div></div>`,
  ].filter(Boolean).join('')

  const isCompact = !fields
  
  const content = `
  <div class="pg-header-top">
    <div class="pg-header-icon">👥</div>
    <div>
      <div class="pg-header-title">${escapeHtml(p.title)}</div>
      <div class="pg-header-meta">${escapeHtml(p.subject)} · ${escapeHtml(p.year)} · ${escapeHtml(p.bnccCode)}</div>
    </div>
  </div>
  ${fields ? `<div class="pg-header-fields">${fields}</div>` : ''}`

  return componentShell({
    id: p.id,
    type: 'page_header',
    content,
    className: `pg-header ${isCompact ? 'compact' : ''}`,
    layoutRole: 'structure',
  })
}
