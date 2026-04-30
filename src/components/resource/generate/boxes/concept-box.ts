import { componentShell, escapeHtml } from '@/lib/resource/render-utils'

export interface ConceptBoxProps {
  id: string
  term: string
  definition: string
}

export function conceptBox(p: ConceptBoxProps): string {
  const content = `
  <div class="box-hd"><span class="box-icon">💡</span><span class="box-title">Conceito</span></div>
  <div class="box-divider"></div>
  <div class="box-term">${escapeHtml(p.term)}</div>
  <div class="box-def">${escapeHtml(p.definition)}</div>`

  return componentShell({
    id: p.id,
    type: 'concept_box',
    content,
    className: 'box box-concept',
    layoutRole: 'content',
  })
}
