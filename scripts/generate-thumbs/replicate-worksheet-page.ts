import * as fs from 'fs'
import * as path from 'path'
import { chromium } from 'playwright'

const OUTPUT_DIR = path.join(process.cwd(), 'docs/resources/analysis/mockups')

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

function buildHtml() {
  const questions = [
    {
      number: 4,
      title: 'Quais foram os três alimentos que o menino tentou preparar?',
      lines: 3,
      variant: 'tape',
      x: 8,
      y: 8,
      w: 34,
      h: 24,
    },
    {
      number: 5,
      title: 'O que aconteceu com as torradas? Por que isso aconteceu?',
      lines: 4,
      variant: 'double',
      x: 45,
      y: 8,
      w: 47,
      h: 24,
    },
    {
      number: 6,
      title: 'Encontre no texto uma palavra que significa o mesmo que "missão" e escreva uma frase com ela.',
      lines: 5,
      variant: 'rounded',
      x: 8,
      y: 35,
      w: 54,
      h: 23,
    },
    {
      number: 7,
      title: 'O que significa a expressão "pretas como carvão" usada no texto?',
      lines: 8,
      variant: 'dashed',
      x: 65,
      y: 35,
      w: 27,
      h: 36,
    },
    {
      number: 8,
      title: 'Como os pais reagiram quando viram a bagunça na cozinha?',
      lines: 5,
      variant: 'flower',
      x: 8,
      y: 61,
      w: 43,
      h: 28,
    },
    {
      number: 9,
      title: 'Qual foi a lição que o menino aprendeu com essa experiência?',
      lines: 4,
      variant: 'single',
      x: 56,
      y: 74,
      w: 36,
      h: 20,
    },
  ]

  const cards = questions
    .map((q) => {
      const lines = Array.from({ length: q.lines })
        .map(() => '<div class="line"></div>')
        .join('')

      return `
      <section class="card card-${q.variant}" style="left:${q.x}%; top:${q.y}%; width:${q.w}%; height:${q.h}%;">
        <h3><strong>${q.number}.</strong> ${q.title}</h3>
        <div class="lines">${lines}</div>
      </section>
    `
    })
    .join('\n')

  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <title>Replica page 007</title>
  <style>
    @page { size: A4; margin: 0; }
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; background: #e8e8e8; }
    body {
      font-family: "Arial Black", "Trebuchet MS", Arial, sans-serif;
      display: flex;
      justify-content: center;
      padding: 20px;
    }
    .sheet {
      width: 210mm;
      height: 297mm;
      background: #fff;
      position: relative;
      border: 2.5mm dashed #111;
      border-radius: 6mm;
      padding: 10mm;
      overflow: hidden;
    }
    .sheet::before {
      content: "";
      position: absolute;
      inset: 6mm;
      border: 1.2mm solid #111;
      border-radius: 6mm;
      opacity: 0.15;
      pointer-events: none;
    }
    .tag {
      position: absolute;
      right: 8mm;
      top: 5mm;
      font-size: 12px;
      font-weight: 900;
      text-transform: uppercase;
      border: 1.2mm solid #111;
      border-radius: 999px;
      padding: 2mm 4mm;
      background: #fff;
      transform: rotate(-3deg);
    }
    .card {
      position: absolute;
      background: #fff;
      border: 1.2mm solid #111;
      border-radius: 5mm;
      padding: 4.5mm;
      display: flex;
      flex-direction: column;
      box-shadow: 0.8mm 0.8mm 0 0 #111;
    }
    .card h3 {
      margin: 0;
      font-size: 10.5px;
      line-height: 1.35;
      text-transform: uppercase;
      letter-spacing: 0.15px;
    }
    .lines {
      margin-top: auto;
      display: grid;
      gap: 2.2mm;
      padding-top: 3.4mm;
    }
    .line {
      border-bottom: 0.55mm solid #111;
      height: 2.5mm;
    }
    .card-double {
      border-width: 1.8mm;
      box-shadow: none;
      outline: 0.8mm solid #111;
      outline-offset: -2.8mm;
    }
    .card-dashed {
      border-style: dashed;
      border-radius: 10mm;
    }
    .card-rounded {
      border-radius: 3mm;
      box-shadow: none;
      outline: 0.7mm solid #111;
      outline-offset: -2.2mm;
    }
    .card-tape::before,
    .card-tape::after {
      content: "";
      position: absolute;
      width: 11mm;
      height: 3.7mm;
      border: 0.8mm solid #111;
      background: #fff;
      top: -2.8mm;
      transform: rotate(-32deg);
    }
    .card-tape::before { left: -1.5mm; }
    .card-tape::after {
      right: -1.5mm;
      transform: rotate(32deg);
    }
    .card-flower {
      border-radius: 8mm;
      box-shadow: none;
    }
    .card-flower::before {
      content: "";
      position: absolute;
      inset: -1.4mm;
      border: 1mm solid #111;
      border-radius: 7mm;
      opacity: 0.75;
      pointer-events: none;
    }
  </style>
</head>
<body>
  <main class="sheet">
    <div class="tag">Crônicas</div>
    ${cards}
  </main>
</body>
</html>`
}

async function run() {
  ensureDir(OUTPUT_DIR)

  const htmlPath = path.join(OUTPUT_DIR, 'worksheet-page007-replica.html')
  const pngPath = path.join(OUTPUT_DIR, 'worksheet-page007-replica.png')
  const pdfPath = path.join(OUTPUT_DIR, 'worksheet-page007-replica.pdf')

  fs.writeFileSync(htmlPath, buildHtml(), 'utf8')

  const browser = await chromium.launch()
  const context = await browser.newContext({
    viewport: {
      width: 1241,
      height: 1755,
    },
    // Exporta PNG em alta densidade para evitar serrilhado.
    deviceScaleFactor: 3,
  })
  const page = await context.newPage()

  await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle' })
  const sheet = await page.$('.sheet')
  if (!sheet) {
    throw new Error('Elemento .sheet não encontrado para screenshot')
  }
  await sheet.screenshot({ path: pngPath, scale: 'device' })
  await page.pdf({
    path: pdfPath,
    format: 'A4',
    printBackground: true,
    margin: { top: '0', right: '0', bottom: '0', left: '0' },
  })

  await context.close()
  await browser.close()

  console.log('Replica gerada com sucesso:')
  console.log(`- HTML: ${htmlPath}`)
  console.log(`- PNG:  ${pngPath}`)
  console.log(`- PDF:  ${pdfPath}`)
}

run().catch((error) => {
  console.error('Falha ao gerar replica:', error)
  process.exit(1)
})
