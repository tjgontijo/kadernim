import { componentShell, escapeHtml } from '@/lib/resource/render-utils'

export interface VocabularyBoxProps {
  id: string
  items: Array<{ term: string; definition: string }>
}

export function vocabularyBox(p: VocabularyBoxProps): string {
  const items = p.items.map((item) => `
    <li class="vocab-item">
      <span class="vocab-term">${escapeHtml(item.term)}</span>
      <span class="vocab-sep">→</span>
      <span class="vocab-def">${escapeHtml(item.definition)}</span>
    </li>`).join('')

  const content = `
  <div class="box-hd"><span class="box-icon">📖</span><span class="box-title">Vocabulário</span></div>
  <div class="box-divider"></div>
  <ul class="vocab-list">${items}</ul>`

  return componentShell({
    id: p.id,
    type: 'vocabulary_box',
    content,
    className: 'box box-vocab',
    layoutRole: 'content',
  })
}
