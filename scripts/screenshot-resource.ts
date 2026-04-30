import { chromium } from 'playwright'
import { generateResourceContent } from '../src/mastra/agents/generate-resource/orchestrators/generate-resource-content'
import { renderResourceToHtml } from '../src/lib/resource/compositor'
import { parseBnccCode, yearToPhase } from '../src/lib/resource/bncc-parser'
import { getComponentName } from '../src/lib/resource/bncc-parser'
import fs from 'fs'
import path from 'path'

const BNCC_CODE = process.argv[2] || 'EF05HI04'
const OUT_DIR = path.join(process.cwd(), 'scripts/screenshots')

const SUBJECT_MAP: Record<string, string> = {
  lingua_portuguesa: 'pt',
  arte: 'art',
  educacao_fisica: 'ef',
  lingua_inglesa: 'ing',
  matematica: 'math',
  ciencias: 'sci',
  historia: 'hist',
  geografia: 'geo',
  ensino_religioso: 'er',
}

async function main() {
  console.log(`\n=== Gerando recurso: ${BNCC_CODE} ===\n`)

  const plan = await generateResourceContent(BNCC_CODE)

  console.log(`\n=== Plano ===`)
  console.log(`Título: ${plan.title}`)
  plan.pages.forEach((p, i) => {
    const types = p.components.map((c) => c.type)
    console.log(`  Página ${i + 1}: [${types.join(', ')}]`)
  })

  const meta = parseBnccCode(BNCC_CODE)
  const phase = yearToPhase(meta.year)
  const subject = SUBJECT_MAP[meta.component] || 'sci'
  const html = renderResourceToHtml(plan, phase, subject)

  fs.mkdirSync(OUT_DIR, { recursive: true })

  const htmlPath = path.join(OUT_DIR, `${BNCC_CODE}.html`)
  fs.writeFileSync(htmlPath, html, 'utf-8')
  console.log(`\nHTML salvo em: ${htmlPath}`)

  console.log('\nCapturando screenshots...')
  const browser = await chromium.launch()
  const page = await browser.newPage()
  await page.setViewportSize({ width: 900, height: 1200 })
  await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle' })

  const pages = await page.locator('.resource-page').all()
  console.log(`${pages.length} página(s) encontrada(s)`)

  for (let i = 0; i < pages.length; i++) {
    const outPath = path.join(OUT_DIR, `${BNCC_CODE}_page${i + 1}.png`)
    await pages[i].screenshot({ path: outPath })
    console.log(`  Screenshot página ${i + 1}: ${outPath}`)
  }

  await browser.close()
  console.log('\nPronto!\n')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
