import type { Component, PedagogicalPhase } from './schemas'

// Mirrors apostila-design-system.css CSS custom properties
const TOKENS = {
  phase_1: { fsBody: 16, fsTitle: 30, fsMeta: 14, fsSm: 13, lh: 2.0,  pad: 16, gap: 12, answerLh: 44 },
  phase_2: { fsBody: 15, fsTitle: 26, fsMeta: 13, fsSm: 12, lh: 1.8,  pad: 14, gap: 10, answerLh: 40 },
  phase_3: { fsBody: 14, fsTitle: 22, fsMeta: 12, fsSm: 12, lh: 1.6,  pad: 12, gap:  8, answerLh: 34 },
  phase_4: { fsBody: 13, fsTitle: 20, fsMeta: 11, fsSm: 11, lh: 1.5,  pad: 10, gap:  8, answerLh: 30 },
  phase_5: { fsBody: 13, fsTitle: 18, fsMeta: 11, fsSm: 11, lh: 1.4,  pad: 10, gap:  6, answerLh: 28 },
} as const

// A4 page at 96dpi: 210mm × 297mm
export const PAGE_W_PX = 794
export const PAGE_H_PX = 1122
export const PAGE_PAD_H_PX = 60 // 16mm × (96/25.4)
export const PAGE_PAD_W_PX = 68 // 18mm × (96/25.4)
export const CONTENT_W_PX = PAGE_W_PX - PAGE_PAD_W_PX * 2  // 658px
export const PAGE_USABLE_H = PAGE_H_PX - PAGE_PAD_H_PX * 2 // 1002px

// Safety margin: exact 1.0 (relying on tuned tokens)
export const SAFETY = 1.0

type Tokens = typeof TOKENS[PedagogicalPhase]

// Average char width ≈ 0.48× font size for Nunito/Inter (more dense)
function charsPerLine(fs: number, width = CONTENT_W_PX) {
  return Math.floor(width / (fs * 0.48))
}

function textLines(text: string, chars: number) {
  return Math.max(1, Math.ceil(text.length / chars))
}

function boxHeight(
  innerH: number,
  pad: number,
  extras = 0, // e.g. header row inside the box
): number {
  return pad * 2 + extras + innerH
}

function questionBase(prompt: string, t: Tokens): number {
  const cp = charsPerLine(t.fsBody, CONTENT_W_PX - 40) // 40px for q-number width
  const promptH = textLines(prompt, cp) * (t.fsBody * t.lh)
  // Reduced fixed gaps from 10+10 to 6+6
  return t.pad * 2 + 6 + promptH + 6
}

export function estimateComponentHeight(c: Component, phase: PedagogicalPhase): number {
  const t = TOKENS[phase]
  const lh  = t.fsBody * t.lh
  const slh = t.fsSm  * t.lh
  const cp  = charsPerLine(t.fsBody)

  switch (c.type) {
    // ── STRUCTURAL ──────────────────────────────────────────────────────────
    case 'page_header': {
      const topH = Math.max(30, t.fsTitle * 1.0 + t.fsMeta * 1.0) + 4
      const hasFields = c.studentField || c.teacherField || c.dateField || c.schoolField
      const fieldsH = hasFields ? 4 + 6 + 18 : 0 
      return t.pad * 1.2 + topH + fieldsH
    }

    case 'page_footer':
      return 6 * 2 + slh + 2

    // ── STRUCTURE ────────────────────────────────────────────────────────────
    case 'divider_section':
      return 8 + 30 + 8

    // ── CONTENT BLOCKS ───────────────────────────────────────────────────────
    case 'activity_intro': {
      const instrH = textLines(c.instructionText, cp) * slh
      const bodyH  = textLines(c.bodyText, cp) * lh
      const srcH   = c.source ? slh + 4 : 0
      return boxHeight(instrH + 4 + bodyH + srcH, t.pad * 0.6)
    }

    case 'story_block': {
      const textH  = textLines(c.storyText, cp) * lh
      const imgH   = c.imagePlaceholder ? 112 + 12 : 0
      const pointH = (t.fsBody * 1.0) + 8 + slh
      return boxHeight(textH + imgH + pointH, t.pad)
    }

    case 'concept_box': {
      // box header (icon + title label + divider)
      const boxHdr = slh + 8 + 2 + 10 // title row + divider + gap
      const termH  = lh + 8
      const defH   = textLines(c.definition, cp) * lh
      return boxHeight(boxHdr + termH + defH, t.pad)
    }

    case 'tip_box': {
      const boxHdr = slh + 8 + 2 + 10
      return boxHeight(boxHdr + textLines(c.tipText, cp) * slh, t.pad)
    }

    case 'vocabulary_box': {
      const boxHdr = slh + 8 + 2 + 10
      const itemsH = c.items.reduce((s, item) => {
        const termW = Math.floor(CONTENT_W_PX * 0.3)
        const defW  = CONTENT_W_PX - termW - 20
        return s + Math.max(lh, textLines(item.definition, charsPerLine(t.fsBody, defW)) * lh) + 6
      }, 0)
      return boxHeight(boxHdr + itemsH, t.pad)
    }

    case 'reading_box': {
      const tagH   = c.tag ? slh + 8 : 0
      const titleH = textLines(c.title, cp) * lh + 8
      const bodyH  = textLines(c.body, cp) * lh
      const srcH   = c.source ? slh + 10 : 0
      // reading_box uses padding left only (border-left style), so full width
      return t.pad * 2 + tagH + titleH + bodyH + srcH
    }

    case 'prose_block': {
      return c.paragraphs.reduce((s, p, i) => s + textLines(p, cp) * lh + (i > 0 ? 12 : 0), 0)
    }

    case 'callout_box': {
      const iconH  = 24 + 6
      const titleH = c.title ? lh + 6 : 0
      const bodyH  = textLines(c.body, cp) * lh
      return boxHeight(iconH + titleH + bodyH, t.pad)
    }

    case 'connection_web': {
      return t.pad * 2 + 100 + 24 + 120 // center circle + gap + connections grid
    }

    case 'dialogue_box': {
      const titleH = c.title ? lh + 8 : 0
      const dlinesH = c.lines.reduce((s, l) => {
        const bubbleW = Math.floor(CONTENT_W_PX * 0.65)
        return s + Math.max(lh + 16, textLines(l.text, charsPerLine(t.fsBody, bubbleW)) * lh + 16) + 10
      }, 0)
      return boxHeight(titleH + dlinesH, t.pad)
    }

    // ── QUESTIONS ────────────────────────────────────────────────────────────
    case 'multiple_choice': {
      const base = questionBase(c.prompt, t)
      const optsH = c.options.reduce((s, o) => {
        const textH = Math.max(lh, textLines(o, charsPerLine(t.fsBody, CONTENT_W_PX - 60)) * lh)
        // Reduced from 16+7 to 10+4
        return s + textH + 10 + 4 
      }, 0)
      return base + optsH
    }

    case 'true_false': {
      const base = questionBase(c.prompt, t)
      const stmtsH = c.statements.reduce((s, stmt) => {
        const stmtTextH = textLines(stmt, charsPerLine(t.fsBody, CONTENT_W_PX - 80)) * lh
        // Reduced bubble base and padding
        return s + Math.max(24, stmtTextH) + 8 
      }, 0)
      return base + stmtsH
    }

    case 'fill_blank': {
      const base = questionBase(c.prompt, t)
      const bankH = c.wordBank ? slh + 6 + 14 : 0
      // blanks are 90px inline elements — conservatively assume less chars per line
      const sentH = textLines(c.sentenceTemplate, charsPerLine(t.fsBody, CONTENT_W_PX * 0.65)) * (lh * 1.6)
      return base + bankH + sentH
    }

    case 'matching': {
      const base = questionBase(c.prompt, t)
      const rows = Math.max(c.leftItems.length, c.rightItems.length)
      return base + rows * (lh + 8 + 8) // pill height + gap
    }

    case 'ordering': {
      const base = questionBase(c.prompt, t)
      return base + c.items.length * (lh + 10) // order-item height
    }

    case 'open_short':
    case 'open_long':
    case 'comprehension':
    case 'reasoning':
    case 'creation': {
      const base = questionBase(c.prompt, t)
      return base + c.lines * t.answerLh
    }

    case 'calculation': {
      const base = questionBase(c.prompt, t)
      return base + 90 + 10 + (c.hasAnswerLine !== false ? t.answerLh : 0)
    }

    // ── ENRICHMENT ───────────────────────────────────────────────────────────
    case 'challenge_box': {
      const textH = textLines(c.challengeText, cp) * lh
      return boxHeight(30 + textH + 12 + c.lines * t.answerLh, t.pad)
    }

    case 'timeline':
      return 80 + 40 + t.gap

    case 'data_table':
      return (c.rows.length + 1) * 40 + 8

    case 'image_placeholder':
      return 72 + 100

    case 'graph_placeholder':
      return (c.showAxes ? 130 : 90) + 16

    case 'drawing_area': {
      const promptH = textLines(c.prompt, cp) * slh + 8
      return 160 + promptH
    }

    case 'frame_box': {
      const titleH = c.title ? lh + 8 : 0
      const bodyH  = textLines(c.body, cp) * lh
      const linesH = c.lines ? c.lines * t.answerLh : 0
      return boxHeight(titleH + bodyH + linesH, t.pad)
    }

    default:
      return 120
  }
}

export { TOKENS }
