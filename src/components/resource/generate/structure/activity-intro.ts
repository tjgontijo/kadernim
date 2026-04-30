import { componentShell, escapeHtml } from '@/lib/resource/render-utils'

// Contextualização / Introdução de atividade

export interface ActivityIntroProps {
  id: string
  instructionText?: string
  bodyText: string
  source?: string
}

export function activityIntro(p: ActivityIntroProps): string {
  const content = `
  ${p.instructionText ? `<div class="act-intro-instruction">${escapeHtml(p.instructionText)}</div>` : ''}
  <div class="act-intro-body">${escapeHtml(p.bodyText)}</div>
  ${p.source ? `<div class="act-intro-source">Fonte: ${escapeHtml(p.source)}</div>` : ''}`

  return componentShell({
    id: p.id,
    type: 'activity_intro',
    content,
    className: 'act-intro',
    layoutRole: 'structure',
  })
}
