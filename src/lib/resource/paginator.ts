import type { Component, PagePlan, PedagogicalPhase, ResourcePlan } from './schemas'
import { estimateComponentHeight, PAGE_USABLE_H, SAFETY, TOKENS } from './height-estimator'

function flattenContent(plan: ResourcePlan): Component[] {
  return plan.pages.flatMap((p) =>
    p.components.filter((c) => c.type !== 'page_header' && c.type !== 'page_footer')
  )
}

function getHeaderTemplate(plan: ResourcePlan) {
  for (const page of plan.pages) {
    const h = page.components.find((c) => c.type === 'page_header')
    if (h && h.type === 'page_header') return h
  }
  throw new Error('[paginator] No page_header found in plan')
}

function getFooterTemplate(plan: ResourcePlan) {
  for (const page of plan.pages) {
    const f = page.components.find((c) => c.type === 'page_footer')
    if (f && f.type === 'page_footer') return f
  }
  throw new Error('[paginator] No page_footer found in plan')
}

function pack(
  content: Component[],
  heights: number[],   // measured or estimated height per component (index matches content)
  headerH: number,
  footerH: number,
  headerTpl: Extract<Component, { type: 'page_header' }>,
  footerTpl: Extract<Component, { type: 'page_footer' }>,
  gap: number,
): PagePlan[] {
  const availableH = PAGE_USABLE_H - headerH - footerH - gap * 2

  const pages: PagePlan[] = []
  let remaining = content.map((c, i) => ({ c, h: heights[i] }))
  let pageNumber = 1

  while (remaining.length > 0) {
    const pageItems: Component[] = []
    let usedH = 0

    while (remaining.length > 0) {
      const { c, h } = remaining[0]
      const gapCost = pageItems.length > 0 ? gap : 0

      if (usedH + gapCost + h > availableH && pageItems.length > 0) break

      pageItems.push(remaining.shift()!.c)
      usedH += gapCost + h
    }

    // Widow prevention: divider_section must not be last on a page
    while (pageItems.length > 1 && pageItems[pageItems.length - 1].type === 'divider_section') {
      const orphan = pageItems.pop()!
      remaining.unshift({ c: orphan, h: heights[content.indexOf(orphan)] })
    }

    const header: Component = pageNumber === 1
      ? { ...headerTpl, id: `${headerTpl.id}-p${pageNumber}` }
      : { ...headerTpl, id: `${headerTpl.id}-p${pageNumber}`, studentField: false, teacherField: false, dateField: false, schoolField: false }

    pages.push({
      pageNumber,
      components: [header, ...pageItems, { ...footerTpl, id: `${footerTpl.id}-p${pageNumber}`, pageNumber }],
    })
    pageNumber++
  }

  return pages
}

/** Fast pagination using estimated heights — no browser required. */
export function paginateResourcePlan(plan: ResourcePlan, phase: PedagogicalPhase): ResourcePlan {
  const tok = TOKENS[phase]
  const headerTpl = getHeaderTemplate(plan)
  const footerTpl = getFooterTemplate(plan)
  const content = flattenContent(plan)

  const headerH = Math.ceil(estimateComponentHeight(headerTpl, phase) * SAFETY)
  const footerH = Math.ceil(estimateComponentHeight(footerTpl, phase) * SAFETY)
  const heights = content.map((c) => Math.ceil(estimateComponentHeight(c, phase) * SAFETY))

  const pages = pack(content, heights, headerH, footerH, headerTpl, footerTpl, tok.gap)

  console.log(`[paginator:estimate] ${plan.pages.length}→${pages.length} pages`)
  return { ...plan, pages }
}

/**
 * Accurate pagination using browser-measured heights.
 * Heights must be obtained via measureComponentHeights() before calling this.
 */
export function paginateResourcePlanWithMeasurements(
  plan: ResourcePlan,
  phase: PedagogicalPhase,
  measuredHeights: Map<Component, number>,
): ResourcePlan {
  const tok = TOKENS[phase]
  const headerTpl = getHeaderTemplate(plan)
  const footerTpl = getFooterTemplate(plan)
  const content = flattenContent(plan)

  // All structural + content components to measure
  const allComponents = [headerTpl, footerTpl, ...content]
  const getMeasured = (c: Component) =>
    measuredHeights.get(c) ?? Math.ceil(estimateComponentHeight(c, phase) * SAFETY)

  const headerH = getMeasured(headerTpl)
  const footerH = getMeasured(footerTpl)
  const heights = content.map(getMeasured)

  const pages = pack(content, heights, headerH, footerH, headerTpl, footerTpl, tok.gap)

  console.log(`[paginator:measured] ${plan.pages.length}→${pages.length} pages`)
  return { ...plan, pages }
}
