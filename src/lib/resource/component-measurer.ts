import { chromium } from 'playwright'
import type { Component, PedagogicalPhase } from './schemas'
import { renderComponent, loadDesignSystemCss } from './compositor'

const PHASE_NUM: Record<PedagogicalPhase, string> = {
  phase_1: '1', phase_2: '2', phase_3: '3', phase_4: '4', phase_5: '5',
}

// Content width in px (A4 - 2×18mm padding at 96dpi)
const CONTENT_W = 658

export async function measureComponentHeights(
  components: Component[],
  phase: PedagogicalPhase,
  subject = 'sci',
): Promise<number[]> {
  const css = loadDesignSystemCss()
  const phaseNum = PHASE_NUM[phase]

  // Each component gets its own wrapper. We use a flex column container
  // that is NOT a direct child of body, so the design system's body grid layout
  // doesn't affect our measurements.
  const wrappedComponents = components
    .map((c, i) => `<div data-idx="${i}" style="width:${CONTENT_W}px;display:block">${renderComponent(c)}</div>`)
    .join('\n')

  const html = `<!DOCTYPE html>
<html lang="pt-BR" data-phase="${phaseNum}" data-subject="${subject}">
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    ${css}
    /* Override design system shell layout so it doesn't distort measurements */
    body { display: block !important; grid-template-rows: unset !important; grid-template-columns: unset !important; grid-template-areas: unset !important; min-height: 0 !important; }
    #measure-root { display: flex; flex-direction: column; width: ${CONTENT_W}px; background: white; gap: 0; }
  </style>
</head>
<body>
  <div id="measure-root">${wrappedComponents}</div>
</body>
</html>`

  const browser = await chromium.launch({ headless: true })
  try {
    const page = await browser.newPage()
    await page.setViewportSize({ width: CONTENT_W + 40, height: 2000 })
    await page.setContent(html, { waitUntil: 'networkidle' })

    const heights = await page.evaluate((count: number) => {
      const result: number[] = []
      for (let i = 0; i < count; i++) {
        const el = document.querySelector(`[data-idx="${i}"]`) as HTMLElement | null
        result.push(el ? Math.ceil(el.getBoundingClientRect().height) : 0)
      }
      return result
    }, components.length)

    return heights
  } finally {
    await browser.close()
  }
}
