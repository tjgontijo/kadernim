import { componentShell, escapeHtml } from '@/lib/resource/render-utils'

export interface ChallengeBoxProps {
  id: string
  challengeText: string
  lines?: number
  title?: string
}

export function challengeBox(p: ChallengeBoxProps): string {
  const lineCount = p.lines ?? 3
  const answerLines = Array.from({ length: lineCount }).map(() => (
    '<div class="answer-line challenge-line"></div>'
  )).join('')

  const content = `
  <div class="box-hd"><span class="box-icon">🏆</span><span class="box-title">${escapeHtml(p.title || 'Desafio')}</span></div>
  <div class="box-divider challenge-divider"></div>
  <div class="box-def">${escapeHtml(p.challengeText)}</div>
  <div class="answer-lines">${answerLines}</div>`

  return componentShell({
    id: p.id,
    type: 'challenge_box',
    content,
    className: 'challenge',
    layoutRole: 'enrichment',
    extraAttrs: {
      'data-lines': lineCount.toString(),
    },
  })
}
