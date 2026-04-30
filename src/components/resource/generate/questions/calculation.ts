import { componentShell, escapeHtml } from '@/lib/resource/render-utils'

export interface CalculationProps {
  id: string
  number: number
  prompt: string
  expression?: string
  developmentLines?: number
  hasAnswerLine?: boolean
  instruction?: string
}

export function calculation(p: CalculationProps): string {
  const lineCount = p.developmentLines ?? 4
  const devHeight = `${lineCount * 24}px`
  
  const content = `
  <div class="q-header">
    <span class="q-number">${p.number}.</span>
    <span class="q-prompt">${escapeHtml(p.prompt)}</span>
  </div>
  ${p.instruction ? `<div class="q-instruction">${escapeHtml(p.instruction)}</div>` : ''}
  ${p.expression ? `<div class="calc-expr">${escapeHtml(p.expression)}</div>` : ''}
  <div class="calc-dev-label">Desenvolvimento:</div>
  <div class="calc-dev-area" style="height:${devHeight}"></div>
  ${p.hasAnswerLine !== false ? `
  <div class="calc-ans">
    <span class="calc-ans-label">Resposta:</span>
    <div class="calc-ans-line"></div>
  </div>` : ''}`

  return componentShell({
    id: p.id,
    type: 'calculation',
    content,
    className: 'question',
    layoutRole: 'question',
    extraAttrs: {
      'data-lines': lineCount.toString(),
    },
  })
}
