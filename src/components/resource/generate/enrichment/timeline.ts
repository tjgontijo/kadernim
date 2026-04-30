import { componentShell, escapeHtml } from '@/lib/resource/render-utils'

export interface TimelineProps {
  id: string
  events: Array<{ date: string; label: string }>
}

export function timeline(p: TimelineProps): string {
  const track = p.events.map((_, i) => (
    `<div class="tl-event"><div class="tl-dot"></div></div>${i < p.events.length - 1 ? '<div class="tl-conn"></div>' : ''}`
  )).join('')

  const labels = p.events.map((event) => (
    `<div class="tl-label">
      <div class="tl-date">${escapeHtml(event.date)}</div>
      <div class="tl-text">${escapeHtml(event.label)}</div>
    </div>`
  )).join('')

  const content = `
  <div class="tl-track">${track}</div>
  <div class="tl-labels">${labels}</div>`

  return componentShell({
    id: p.id,
    type: 'timeline',
    content,
    className: 'timeline-wrap',
    layoutRole: 'enrichment',
  })
}
