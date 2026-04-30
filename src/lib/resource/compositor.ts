import fs from 'fs'
import path from 'path'
import { conceptBox, tipBox, vocabularyBox } from '@/components/resource/generate/boxes'
import { calloutBox, connectionWeb, dialogueBox, proseBlock, readingBox } from '@/components/resource/generate/content'
import {
  challengeBox,
  dataTable,
  drawingArea,
  frameBox,
  graphPlaceholder,
  imagePlaceholder,
  timeline,
  selfAssessment,
} from '@/components/resource/generate/enrichment'
import { storyBlock } from '@/components/resource/generate/narrative/story-block'
import {
  comprehension,
  calculation,
  creation,
  fillBlank,
  matching,
  multipleChoice,
  openLong,
  openShort,
  ordering,
  reasoning,
  trueFalse,
} from '@/components/resource/generate/questions'
import { activityIntro, dividerSection, pageFooter, pageHeader } from '@/components/resource/generate/structure'
import type { Component, PedagogicalPhase, ResourcePlan } from './schemas'
import { RenderContext, DENSITY_CONFIGS } from './layout-engine-types'

const PHASE_NUM: Record<PedagogicalPhase, string> = {
  phase_1: '1',
  phase_2: '2',
  phase_3: '3',
  phase_4: '4',
  phase_5: '5',
}

export function loadDesignSystemCss(): string {
  const filePath = path.join(process.cwd(), 'docs/Kadernim/apostila-design-system.html')
  const html = fs.readFileSync(filePath, 'utf-8')
  
  // Find all <style> blocks and join their content
  const styleRegex = /<style>([\s\S]*?)<\/style>/g
  const styles: string[] = []
  let match
  
  while ((match = styleRegex.exec(html)) !== null) {
    styles.push(match[1])
  }
  
  return styles.join('\n')
}

export function renderComponent(component: Component, context?: RenderContext): string {
  switch (component.type) {
    case 'page_header':
      return pageHeader({
        id: component.id,
        title: component.title,
        subject: component.subject,
        year: component.year,
        bnccCode: component.bnccCode,
        teacherField: component.teacherField,
        studentField: component.studentField,
        dateField: component.dateField,
        schoolField: component.schoolField,
      })

    case 'page_footer':
      return pageFooter({
        id: component.id,
        bnccSkill: component.bnccSkill,
        competencyArea: component.competencyArea,
        pageNumber: component.pageNumber,
      })

    case 'story_block':
      return storyBlock({
        id: component.id,
        storyText: component.storyText,
        imagePlaceholder: component.imagePlaceholder,
        learningPoint: component.learningPoint,
      })

    case 'concept_box':
      return conceptBox({
        id: component.id,
        term: component.term,
        definition: component.definition,
      })

    case 'tip_box':
      return tipBox({
        id: component.id,
        tipText: component.tipText,
      })

    case 'vocabulary_box':
      return vocabularyBox({
        id: component.id,
        items: component.items,
      })

    case 'activity_intro':
      return activityIntro({
        id: component.id,
        instructionText: component.instructionText,
        bodyText: component.bodyText,
        source: component.source,
      })

    case 'prose_block':
      return proseBlock({
        id: component.id,
        paragraphs: component.paragraphs,
      })

    case 'callout_box':
      return calloutBox({
        id: component.id,
        variant: component.variant,
        body: component.body,
        title: component.title,
        icon: component.icon,
      })

    case 'connection_web':
      return connectionWeb({
        id: component.id,
        center: component.center,
        connections: component.connections,
      })

    case 'reading_box':
      return readingBox({
        id: component.id,
        tag: component.tag,
        title: component.title,
        body: component.body,
        source: component.source,
      })

    case 'dialogue_box':
      return dialogueBox({
        id: component.id,
        title: component.title,
        lines: component.lines,
      })

    case 'multiple_choice':
      return multipleChoice({
        id: component.id,
        number: component.number,
        prompt: component.prompt,
        options: component.options,
      })

    case 'open_short':
      return openShort({
        id: component.id,
        number: component.number,
        prompt: component.prompt,
        lines: component.lines,
      })

    case 'open_long':
      return openLong({
        id: component.id,
        number: component.number,
        prompt: component.prompt,
        lines: component.lines,
      })

    case 'true_false':
      return trueFalse({
        id: component.id,
        number: component.number,
        prompt: component.prompt,
        statements: component.statements,
      })

    case 'fill_blank':
      return fillBlank({
        id: component.id,
        number: component.number,
        prompt: component.prompt,
        wordBank: component.wordBank,
        sentenceTemplate: component.sentenceTemplate,
      })

    case 'matching':
      return matching({
        id: component.id,
        number: component.number,
        prompt: component.prompt,
        leftItems: component.leftItems,
        rightItems: component.rightItems,
      })

    case 'ordering':
      return ordering({
        id: component.id,
        number: component.number,
        prompt: component.prompt,
        items: component.items,
      })

    case 'calculation':
      return calculation({
        id: component.id,
        number: component.number,
        prompt: component.prompt,
        expression: component.expression,
        developmentLines: component.developmentLines,
        hasAnswerLine: component.hasAnswerLine,
      })

    case 'comprehension':
      return comprehension({
        id: component.id,
        number: component.number,
        prompt: component.prompt,
        lines: component.lines,
      })

    case 'reasoning':
      return reasoning({
        id: component.id,
        number: component.number,
        prompt: component.prompt,
        lines: component.lines,
      })

    case 'creation':
      return creation({
        id: component.id,
        number: component.number,
        prompt: component.prompt,
        lines: component.lines,
      })

    case 'challenge_box':
      return challengeBox({
        id: component.id,
        challengeText: component.challengeText,
        lines: component.lines,
      })

    case 'divider_section':
      return dividerSection({
        id: component.id,
        sectionTitle: component.sectionTitle,
      })

    case 'timeline':
      return timeline({
        id: component.id,
        events: component.events,
      })

    case 'data_table':
      return dataTable({
        id: component.id,
        headers: component.headers,
        rows: component.rows,
      })

    case 'image_placeholder':
      return imagePlaceholder({
        id: component.id,
        caption: component.caption,
        description: component.description,
      })

    case 'graph_placeholder':
      return graphPlaceholder({
        id: component.id,
        caption: component.caption,
        description: component.description,
        icon: component.icon,
        showAxes: component.showAxes,
      })

    case 'drawing_area':
      return drawingArea({
        id: component.id,
        prompt: component.prompt,
        number: component.number,
        label: component.label,
      })

    case 'frame_box':
      return frameBox({
        id: component.id,
        title: component.title,
        body: component.body,
        lines: component.lines,
      })

    case 'self_assessment':
      return selfAssessment({
        title: component.title,
        items: component.items,
      })

    default:
      return `
<div style="padding:12px;background:#FEE2E2;border:1px solid #FCA5A5;border-radius:6px;color:#991B1B;font-size:12px;margin-bottom:16px">
  Componente não implementado: ${(component as { type?: string }).type ?? 'desconhecido'}
</div>`
  }
}

function renderResourcePage(components: string[], context: RenderContext): string {
  const body = components.slice(0, -1).join('\n')
  const footer = components[components.length - 1]
  const config = DENSITY_CONFIGS[context.density]

  // Base styles that adapt to density
  const pageStyle = [
    'width:210mm',
    context.mode === 'print' ? 'height:297mm;overflow:hidden' : 'min-height:297mm',
    `padding:${config.padding}`,
    'margin:0 auto 12mm',
    'background:white',
    'box-shadow:0 1px 4px rgba(0,0,0,.12)',
    'display:flex',
    'flex-direction:column',
    `gap:${config.gap}`,
  ].join(';')

  return `
<div class="resource-page" style="${pageStyle}" data-density="${context.density}" data-mode="${context.mode}">
  ${body}
  <div style="flex:1"></div>
  ${footer}
</div>`
}

export function renderResourceToHtml(
  plan: ResourcePlan,
  contextOrPhase: RenderContext | PedagogicalPhase = 'phase_3',
  subject = 'sci',
): string {
  const css = loadDesignSystemCss()
  
  // Backward compatibility
  const context: RenderContext = typeof contextOrPhase === 'string' 
    ? { phase: contextOrPhase, subject, mode: 'preview', density: 'balanced' }
    : contextOrPhase

  const phaseNum = PHASE_NUM[context.phase]
  const config = DENSITY_CONFIGS[context.density]

  const pagesHtml = plan.pages
    .map((page) => renderResourcePage(page.components.map(c => renderComponent(c, context)), context))
    .join('\n')

  return `<!DOCTYPE html>
<html lang="pt-BR" data-phase="${phaseNum}" data-subject="${context.subject}" data-density="${context.density}" data-mode="${context.mode}">
<head>
  <meta charset="UTF-8">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --density-gap: ${config.gap};
      --font-scale: ${config.fontSizeMultiplier};
    }
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { 
      background: #F1F5F9 !important; 
      display: block !important; 
      grid-template-rows: unset !important; 
      grid-template-columns: unset !important; 
      grid-template-areas: unset !important;
      font-size: calc(1rem * var(--font-scale));
    }
    .resource-page { display: flex; flex-direction: column; }
    @media print {
      html, body { background: white !important; display: block !important; width: 210mm; }
      .resource-page {
        box-shadow: none !important;
        margin: 0 !important;
        width: 210mm !important;
        height: 297mm !important;
        min-height: 297mm !important;
        overflow: hidden !important;
        break-after: page;
        page-break-after: always;
      }
      .resource-page:last-child {
        break-after: avoid;
        page-break-after: avoid;
      }
      .component-wrapper {
        break-inside: avoid;
        page-break-inside: avoid;
      }
    }
    ${css}
  </style>
</head>
<body>
${pagesHtml}
</body>
</html>`
}

// Backward-compatible alias (legacy name)
export const renderApostilaToHtml = renderResourceToHtml
