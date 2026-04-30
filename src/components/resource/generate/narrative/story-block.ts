import { componentShell, escapeHtml } from '@/lib/resource/render-utils'

export interface StoryBlockProps {
  id: string
  storyText: string
  imagePlaceholder?: string
  learningPoint?: string
}

export function storyBlock(p: StoryBlockProps): string {
  const content = `
  <div class="act-intro-body">${escapeHtml(p.storyText)}</div>
  ${p.imagePlaceholder ? `
  <div class="img-placeholder story-img">
    <div class="img-ph-icon">🖼️</div>
    <div class="img-ph-caption">${escapeHtml(p.imagePlaceholder)}</div>
  </div>` : ''}
  ${p.learningPoint ? `<div class="story-learning-point">🌱 ${escapeHtml(p.learningPoint)}</div>` : ''}`

  return componentShell({
    id: p.id,
    type: 'story_block',
    content,
    className: 'story-block',
    layoutRole: 'content',
  })
}
