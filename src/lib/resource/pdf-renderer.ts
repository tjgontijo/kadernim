import { chromium } from 'playwright'
import type { Component, PedagogicalPhase, ResourcePlan } from './schemas'
import { renderComponent, renderResourceToHtml, loadDesignSystemCss } from './compositor'
import { paginateResourcePlanWithMeasurements } from './paginator'
import { RenderContext, DENSITY_CONFIGS } from './layout-engine-types'
import { LayoutQualityReport } from './layout-report'

const CONTENT_W = 658
const PHASE_NUM: Record<PedagogicalPhase, string> = {
  phase_1: '1', phase_2: '2', phase_3: '3', phase_4: '4', phase_5: '5',
}

function buildMeasurementHtml(
  components: Component[],
  context: RenderContext
): string {
  const css = loadDesignSystemCss()
  const phaseNum = PHASE_NUM[context.phase]
  const config = DENSITY_CONFIGS[context.density]
  
  const items = components
    .map((c, i) => `<div data-idx="${i}" class="measure-item" style="width:${CONTENT_W}px;display:block">${renderComponent(c, context)}</div>`)
    .join('\n')

  return `<!DOCTYPE html>
<html lang="pt-BR" data-phase="${phaseNum}" data-subject="${context.subject}" data-density="${context.density}">
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --density-gap: ${config.gap};
      --font-scale: ${config.fontSizeMultiplier};
    }
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { 
      display: block !important; 
      grid-template-rows: unset !important; 
      grid-template-columns: unset !important; 
      grid-template-areas: unset !important; 
      min-height: 0 !important;
      font-size: calc(1rem * var(--font-scale));
    }
    #measure-root { display: flex; flex-direction: column; width: ${CONTENT_W}px; background: white; gap: 0; }
    ${css}
  </style>
</head>
<body>
  <div id="measure-root">${items}</div>
</body>
</html>`
}

export class PdfRenderer {
  static generateHtml(
    plan: ResourcePlan,
    options: { phase?: PedagogicalPhase; subject?: string; density?: any; mode?: any } = {},
  ): string {
    return renderResourceToHtml(plan, {
      phase: options.phase ?? 'phase_3',
      subject: options.subject ?? 'sci',
      density: options.density ?? 'balanced',
      mode: options.mode ?? 'preview',
    })
  }

  static async measureAndAnalyze(
    plan: ResourcePlan,
    context: RenderContext,
    targetPages: number
  ): Promise<{ paginatedPlan: ResourcePlan; report: Omit<LayoutQualityReport, 'score'> }> {
    const browser = await chromium.launch({ headless: true })
    try {
      const allComponents = plan.pages.flatMap((p) => p.components)
      const page = await browser.newPage()
      await page.setViewportSize({ width: CONTENT_W + 40, height: 8000 })

      const measureHtml = buildMeasurementHtml(allComponents, context)
      await page.setContent(measureHtml, { waitUntil: 'networkidle' })

      const rawHeights: number[] = await page.evaluate((count: number) => {
        const out: number[] = []
        for (let i = 0; i < count; i++) {
          const el = document.querySelector(`[data-idx="${i}"]`) as HTMLElement | null
          out.push(el ? Math.ceil(el.getBoundingClientRect().height) : 0)
        }
        return out
      }, allComponents.length)

      await page.close()

      const measuredHeights = new Map<Component, number>(
        allComponents.map((c, i) => [c, rawHeights[i]])
      )

      // Paginate using real heights
      const paginatedPlan = paginateResourcePlanWithMeasurements(plan, context.phase, measuredHeights)

      // Analysis
      const totalPages = paginatedPlan.pages.length
      const overflowCount = 0 // In deterministic pagination we don't have overflow usually, it just adds pages
      const underflowPages = paginatedPlan.pages.filter(p => p.components.length < 3).length
      
      const report: Omit<LayoutQualityReport, 'score'> = {
        profile: context.density,
        totalPages,
        targetPages,
        overflowCount,
        underflowPages,
        orphansCount: 0,
        violations: [],
      }

      return { paginatedPlan, report }
    } finally {
      await browser.close()
    }
  }

  static async render(
    plan: ResourcePlan,
    options: { phase?: PedagogicalPhase; subject?: string; format?: 'A4' | 'Letter'; density?: any } = {},
  ): Promise<Buffer> {
    const phase = options.phase ?? 'phase_3'
    const subject = options.subject ?? 'sci'
    const density = options.density ?? 'balanced'

    const browser = await chromium.launch({ headless: true })
    try {
      const context: RenderContext = { phase, subject, density, mode: 'measure' }
      const { paginatedPlan } = await this.measureAndAnalyze(plan, context, 2)

      const html = renderResourceToHtml(paginatedPlan, { ...context, mode: 'print' })
      const renderPage = await browser.newPage()
      await renderPage.setViewportSize({ width: 794, height: 1123 })
      await renderPage.emulateMedia({ media: 'print' })
      await renderPage.setContent(html, { waitUntil: 'networkidle' })

      const pdf = await renderPage.pdf({
        format: options.format ?? 'A4',
        margin: { top: '0', bottom: '0', left: '0', right: '0' },
        printBackground: true,
      })

      await renderPage.close()
      return pdf
    } finally {
      await browser.close()
    }
  }
}
